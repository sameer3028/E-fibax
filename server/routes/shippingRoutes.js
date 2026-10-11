import { Router } from 'express';
import {
  getShippingConfig,
  saveShippingConfig,
  checkPincodeServiceability,
  calculateShippingFee,
  createShipmentForOrder,
  createDelhiveryShipment,
  requestDelhiveryPickup,
  getTrackingDetails,
  generatePrintableLabel
} from '../shipping.js';
import { getAdminSessionFromRequest, requireAdminAuth } from '../middleware/auth.js';
import { getArray, setArray } from '../store.js';

const router = Router();

function readOrders() {
  return getArray('orders');
}

function saveOrders(orders) {
  setArray('orders', orders);
}

// GET /api/shipping/config - Config lookup (sanitized for public, full for admin)
router.get('/config', (req, res) => {
  try {
    const config = getShippingConfig();
    const adminSession = getAdminSessionFromRequest(req);

    if (adminSession) {
      // Full config for authenticated admin
      return res.json({ success: true, data: config });
    }

    // Public sanitized config for storefront / cart
    return res.json({
      success: true,
      data: {
        freeShippingThreshold: config.freeShippingThreshold,
        defaultShippingFee: config.defaultShippingFee,
        defaultCourier: config.defaultCourier || 'Delhivery Express'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/config - Save shipping configuration (Admin only)
router.post('/config', requireAdminAuth, (req, res) => {
  try {
    const updated = saveShippingConfig(req.body || {});
    res.json({ success: true, message: 'Shipping platform configuration saved', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/check-serviceability - Real-time PIN code verification
router.post('/check-serviceability', async (req, res) => {
  try {
    const { pincode } = req.body || {};
    if (!pincode || String(pincode).trim().length < 6) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit Indian PIN code.' });
    }
    const result = await checkPincodeServiceability(pincode);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/rates - Dynamic Shipping & COD Fee Calculation
router.post('/rates', async (req, res) => {
  try {
    const { cartTotal, pincode, paymentMethod, weight, items } = req.body || {};
    const result = await calculateShippingFee({
      cartTotal: Number(cartTotal) || 0,
      pincode,
      paymentMethod,
      weight,
      items
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/shipping/ship-order/:id - 1-Click Order Fulfillment / Real Delhivery AWB Creation (Admin only)
router.post('/ship-order/:id', requireAdminAuth, async (req, res) => {
  try {
    const orders = readOrders();
    const idx = orders.findIndex(o => o.orderId === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orders[idx];

    // Call real Delhivery shipment creation API
    const delhiveryResult = await createDelhiveryShipment(order, req.body || {});

    if (!delhiveryResult.success) {
      const errorMsg = delhiveryResult.existingAwb
        ? `Shipment already created — AWB: ${delhiveryResult.existingAwb}`
        : (delhiveryResult.error || 'Failed to create Delhivery shipment');
      return res.status(400).json({
        success: false,
        error: errorMsg,
        existingAwb: delhiveryResult.existingAwb || null
      });
    }

    const awb = delhiveryResult.awb || delhiveryResult.waybill;

    // Auto-trigger pickup request
    try {
      await requestDelhiveryPickup(order);
    } catch (pickupErr) {
      console.warn('Auto pickup request failed (non-blocking):', pickupErr.message);
    }

    orders[idx] = {
      ...order,
      status: 'Manifested',
      trackingId: awb,
      delhiveryAwb: awb,
      courier: delhiveryResult.courier || 'Delhivery Express',
      shipment: delhiveryResult,
      updatedAt: new Date().toISOString()
    };

    saveOrders(orders);
    console.log(`🚚 Delhivery Shipment Created & Manifested for ${order.orderId}: AWB ${awb}`);
    res.json({ success: true, message: 'Shipment created successfully with Delhivery AWB ' + awb, data: orders[idx] });
  } catch (err) {
    console.error('Ship order error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shipping/track/:id - Public Tracking Lookup (by orderId or trackingId/AWB)
router.get('/track/:id', async (req, res) => {
  try {
    const orders = readOrders();
    const tracking = await getTrackingDetails(req.params.id, orders);
    if (!tracking) {
      return res.status(404).json({
        success: false,
        error: `No shipment found matching tracking ID or Order number "${req.params.id}". Please verify and try again.`
      });
    }
    res.json({ success: true, data: tracking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/shipping/label/:orderId - Printable Shipping Label HTML
router.get('/label/:orderId', (req, res) => {
  try {
    const orders = readOrders();
    const order = orders.find(o => o.orderId === req.params.orderId || o.trackingId === req.params.orderId);
    if (!order) {
      return res.status(404).send('<h3>Order not found for shipping label</h3>');
    }
    const html = generatePrintableLabel(order);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    res.status(500).send('Error generating shipping label: ' + err.message);
  }
});

// PATCH /api/shipping/status/:orderId - Update shipment status and location remarks (Admin only)
router.patch('/status/:orderId', requireAdminAuth, (req, res) => {
  try {
    const { status, location, remark } = req.body || {};
    const orders = readOrders();
    const idx = orders.findIndex(o => o.orderId === req.params.orderId || o.trackingId === req.params.orderId);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const order = orders[idx];
    const currentTimeline = order.shipment?.timeline || createShipmentForOrder(order).timeline;

    const newMilestone = {
      status: status || order.status,
      title: status || 'Status Update',
      location: location || 'Transit Hub',
      timestamp: new Date().toISOString(),
      completed: true,
      description: remark || `Package status updated to ${status}`
    };

    orders[idx] = {
      ...order,
      status: status || order.status,
      shipment: {
        ...(order.shipment || {}),
        status: status || order.status,
        timeline: [...currentTimeline, newMilestone]
      },
      updatedAt: new Date().toISOString()
    };

    saveOrders(orders);
    res.json({ success: true, message: 'Shipment status updated', data: orders[idx] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
