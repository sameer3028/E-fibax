import { Router } from 'express';
import {
  getShippingConfig,
  calculateShippingFee,
  getTrackingDetails,
  cancelDelhiveryShipment
} from '../shipping.js';
import { verifyOrderPayment, createRazorpayRefund } from '../payment.js';
import { sendOrderConfirmationEmail, sendAdminNewOrderAlert, sendOrderCancellationEmail } from '../services/emailService.js';
import {
  getAdminSessionFromRequest,
  getCustomerFromRequest,
  requireAdminAuth
} from '../middleware/auth.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { getArray, setArray } from '../store.js';
import { normalizeCustomerOrder } from './customerAuthRoutes.js';

const router = Router();

function readOrders() {
  return getArray('orders');
}

function saveOrders(orders) {
  setArray('orders', orders);
}

function readProducts() {
  return getArray('products');
}

function saveProducts(products) {
  setArray('products', products);
}

function readCoupons() {
  return getArray('coupons');
}

function readUsers() {
  return getArray('users');
}

function saveUsers(users) {
  setArray('users', users);
}

// GET /api/orders - List orders (admin sees all, authenticated customer sees their own)
router.get('/', (req, res) => {
  try {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    const adminSession = getAdminSessionFromRequest(req);
    const customer = getCustomerFromRequest(req);
    const orders = readOrders();

    if (adminSession) {
      return res.json({ success: true, count: orders.length, data: orders });
    }

    if (customer) {
      const userOrders = orders.filter(
        o =>
          (o.customer?.userId && o.customer.userId === customer.id) ||
          (o.customer?.email && o.customer.email.toLowerCase() === (customer.email || '').toLowerCase()) ||
          (o.customer?.phone && o.customer.phone === customer.phone)
      );
      const normalizedOrders = userOrders.map(normalizeCustomerOrder).filter(Boolean);
      return res.json({ success: true, count: normalizedOrders.length, data: normalizedOrders });
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Admin or customer authentication required to view orders.'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders - Place order and auto-deduct inventory
router.post('/', orderLimiter, async (req, res) => {
  try {
    const orders = readOrders();
    const products = readProducts();
    const productsMap = {};
    products.forEach(p => { productsMap[String(p.id)] = p; });

    const { customer, items, shipping, payment, totals } = req.body || {};
    const authenticatedCustomer = getCustomerFromRequest(req);
    const resolvedUserId = authenticatedCustomer?.id || customer?.userId || null;
    const resolvedEmail = authenticatedCustomer?.email || customer?.email || '';

    // 1. Idempotency Guard (protect against duplicate clicks or network retries)
    const transactionId = payment?.transactionId || payment?.paymentId || payment?.razorpay_payment_id;
    const idempotencyKey = req.headers['x-idempotency-key'] || req.body?.idempotencyKey;

    if (transactionId) {
      const existingByTx = orders.find(o =>
        o.payment?.transactionId === transactionId ||
        o.payment?.paymentId === transactionId ||
        o.payment?.razorpay_payment_id === transactionId
      );
      if (existingByTx) {
        console.warn(`⚠️ Duplicate order attempt prevented for transaction ${transactionId}. Returning existing #${existingByTx.orderId}`);
        return res.status(200).json({ success: true, data: existingByTx, duplicate: true });
      }
    }

    if (idempotencyKey) {
      const existingByKey = orders.find(o => o.idempotencyKey === idempotencyKey);
      if (existingByKey) {
        console.warn(`⚠️ Duplicate order attempt prevented for idempotency key ${idempotencyKey}. Returning existing #${existingByKey.orderId}`);
        return res.status(200).json({ success: true, data: existingByKey, duplicate: true });
      }
    }

    // 2. Cryptographic validation of online/Razorpay payments
    const paymentCheck = verifyOrderPayment(payment);
    if (!paymentCheck.valid) {
      return res.status(400).json({
        success: false,
        error: paymentCheck.error || 'Payment signature verification failed.'
      });
    }
    const verifiedPayment = paymentCheck.verifiedPayment;

    const orderId = 'FBX-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();

    // 3. Calculate item weights and server-side subtotal
    let cartWeight = 0;
    const itemsList = Array.isArray(items) ? items : [];
    const calculatedSubtotal = itemsList.reduce((acc, item) => {
      const pId = String(item.id || item.product?.id || '');
      const p = productsMap[pId];
      const price = Number(item.price || item.salePrice || p?.salePrice || 0);
      const qty = Number(item.quantity) || 1;

      let itemWeight = 250;
      const vol = item.volumeWeight || p?.volumeWeight;
      if (vol) {
        const m = String(vol).match(/(\d+)\s*(ml|gm|g|kg|l)?/i);
        if (m) {
          let val = parseInt(m[1], 10);
          const u = (m[2] || 'gm').toLowerCase();
          if (u === 'kg' || u === 'l') val *= 1000;
          if (val > 0) itemWeight = val;
        }
      }
      cartWeight += itemWeight * qty;
      return acc + (price * qty);
    }, 0);

    if (cartWeight <= 0) cartWeight = 500;

    // 4. Server-side validation of Delhivery shipping fee
    const paymentMode = verifiedPayment?.method?.includes('COD') ? 'COD' : (verifiedPayment?.method || 'Prepaid');
    const shippingCalc = await calculateShippingFee({
      cartTotal: calculatedSubtotal,
      pincode: shipping?.pincode,
      paymentMethod: paymentMode,
      weight: cartWeight
    });

    if (shippingCalc.calculationFailed && shippingCalc.rateMode === 'live') {
      return res.status(400).json({
        success: false,
        error: shippingCalc.error || 'Unable to calculate live Delhivery shipping rate for destination PIN code. Order placement blocked.'
      });
    }

    const verifiedShippingFee = Number(shippingCalc.shippingFee || 0);
    const verifiedCodFee = Number(shippingCalc.codFee || 0);
    let verifiedDiscount = 0;

    if (totals?.couponCode) {
      const coupons = readCoupons();
      const cleanCode = String(totals.couponCode).trim().toUpperCase();
      const coupon = coupons.find(c => String(c.code).toUpperCase() === cleanCode);
      if (coupon && coupon.isActive !== false && calculatedSubtotal >= (Number(coupon.minOrder) || 0)) {
        if (coupon.type === 'percent') {
          verifiedDiscount = Math.round((calculatedSubtotal * Number(coupon.value)) / 100);
          if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined && coupon.maxDiscount !== '' && Number(coupon.maxDiscount) > 0) {
            verifiedDiscount = Math.min(verifiedDiscount, Number(coupon.maxDiscount));
          }
        } else {
          verifiedDiscount = Math.min(Number(coupon.value), calculatedSubtotal);
        }
      }
    }

    const verifiedGrandTotal = Math.max(0, calculatedSubtotal - verifiedDiscount + verifiedShippingFee + verifiedCodFee);

    const config = getShippingConfig();
    const courierName = config.defaultCourier || 'Delhivery Express';

    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      idempotencyKey: idempotencyKey || null,
      customer: {
        ...(customer || {}),
        userId: resolvedUserId,
        email: resolvedEmail || customer?.email || ''
      },
      items: itemsList,
      shipping: shipping || {},
      payment: verifiedPayment,
      totals: {
        subtotal: calculatedSubtotal,
        discountAmount: verifiedDiscount,
        couponCode: totals?.couponCode || null,
        shippingFee: verifiedShippingFee,
        codFee: verifiedCodFee,
        grandTotal: verifiedGrandTotal
      },
      trackingId: null,
      courier: courierName,
      status: 'Processing',
      delhiveryAwb: null,
      shipment: null
    };

    // If customer is logged in and has no saved address, auto-save this address
    if (authenticatedCustomer && shipping?.address) {
      try {
        const users = readUsers();
        const uIdx = users.findIndex(u => u.id === authenticatedCustomer.id);
        if (uIdx !== -1 && (!users[uIdx].addresses || users[uIdx].addresses.length === 0)) {
          users[uIdx].addresses = [{
            id: 'addr_' + Date.now(),
            address: shipping.address,
            city: shipping.city || '',
            pincode: shipping.pincode || '',
            isDefault: true
          }];
          saveUsers(users);
        }
      } catch (err) {
        console.error('Error auto-saving address:', err);
      }
    }

    // Decrement stock for ordered items
    if (itemsList.length > 0) {
      itemsList.forEach(item => {
        const pIdx = products.findIndex(p => String(p.id) === String(item.id));
        if (pIdx !== -1) {
          const qty = item.quantity || 1;
          products[pIdx].stockQuantity = Math.max(0, (products[pIdx].stockQuantity || 0) - qty);
          products[pIdx].inStock = products[pIdx].stockQuantity > 0;
        }
      });
      saveProducts(products);
    }

    orders.unshift(newOrder);
    saveOrders(orders);

    console.log(`📦 New Order placed: ${orderId} — ${courierName} (AWB pending admin dispatch)`);

    // Non-blocking customer email alert
    sendOrderConfirmationEmail(newOrder).catch(err => {
      console.error(`Non-blocking email alert error for order #${orderId}:`, err.message);
    });

    // Non-blocking automatic admin new order alert
    sendAdminNewOrderAlert(newOrder).catch(err => {
      console.error(`Non-blocking admin alert error for order #${orderId}:`, err.message);
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Core Order Cancellation Engine
export async function executeOrderCancellation({ orderId, reason, adminRemarks, isAdmin = false, adminUser = 'admin' }) {
  if (!orderId || String(orderId).trim() === '' || String(orderId).toLowerCase() === 'undefined' || String(orderId).toLowerCase() === 'null') {
    return { success: false, status: 400, error: 'A valid Order ID is required for cancellation.' };
  }

  const cleanOrderId = String(orderId).trim();
  const orders = readOrders();
  const idx = orders.findIndex(o => String(o.orderId || o.id || '').toUpperCase() === cleanOrderId.toUpperCase());
  if (idx === -1) {
    return { success: false, status: 404, error: `Order #${cleanOrderId} not found.` };
  }

  const order = orders[idx];

  // 1. Guard against duplicate cancellation
  if (order.status === 'Cancelled') {
    return { success: false, status: 400, error: `Order #${order.orderId} is already cancelled.` };
  }

  // 2. Status-aware checks
  const statusUpper = (order.status || '').toUpperCase();

  // Delivered check
  if (statusUpper === 'DELIVERED') {
    return {
      success: false,
      status: 400,
      error: 'Delivered orders cannot be cancelled directly. Please use the return and refund workflow.'
    };
  }

  // In Transit / Dispatched check
  if (['IN TRANSIT', 'DISPATCHED', 'OUT FOR DELIVERY', 'RTO'].includes(statusUpper)) {
    return {
      success: false,
      status: 400,
      error: 'Cancellation is blocked: The shipment has already been picked up and is in transit with courier. Courier interception or RTO (Return to Origin) handling is required.'
    };
  }

  // 3. Courier Cancellation Check (if AWB exists)
  const awb = order.delhiveryAwb || order.trackingId;
  let delhiveryCancelResult = null;

  if (awb && !awb.startsWith('DLH-') && !awb.startsWith('PENDING')) {
    const liveTracking = await getTrackingDetails(awb, orders);
    const liveStatus = (liveTracking?.status || '').toUpperCase();

    if (['IN TRANSIT', 'OUT FOR DELIVERY', 'DELIVERED', 'DISPATCHED'].includes(liveStatus)) {
      return {
        success: false,
        status: 400,
        error: `Cancellation blocked: Delhivery reports this package is already ${liveTracking.status || 'in transit'}. Courier interception or RTO handling is required.`
      };
    }

    delhiveryCancelResult = await cancelDelhiveryShipment(awb, reason || 'Customer requested cancellation');
    if (!delhiveryCancelResult.success) {
      console.warn(`Delhivery cancellation API warning for ${order.orderId}:`, delhiveryCancelResult.error);
      const errMsg = String(delhiveryCancelResult.error || '').toLowerCase();
      if (!errMsg.includes('already') && !errMsg.includes('cancelled') && !errMsg.includes('not found')) {
        return {
          success: false,
          status: 400,
          error: `Delhivery courier cancellation failed: ${delhiveryCancelResult.error}. Shipment status preserved.`
        };
      }
    }
  }

  // 4. Inventory Restoration (Idempotent Guard)
  let inventoryRestorationResult = null;
  if (!order.inventoryRestored) {
    try {
      const products = readProducts();
      const items = Array.isArray(order.items) ? order.items : [];
      const restoredItems = [];

      for (const item of items) {
        const itemId = String(item.id || item.product?.id || '');
        const qty = Number(item.quantity) || 1;
        const pIdx = products.findIndex(p => String(p.id) === itemId);

        if (pIdx !== -1) {
          const prevStock = Number(products[pIdx].stockQuantity) || 0;
          const newStock = prevStock + qty;
          products[pIdx].stockQuantity = newStock;
          products[pIdx].inStock = newStock > 0;
          restoredItems.push({
            id: itemId,
            title: products[pIdx].title || item.title,
            restoredQuantity: qty,
            previousStock: prevStock,
            newStock: newStock
          });
        }

        // Support combo/bundled component product quantities
        if (Array.isArray(item.components) && item.components.length > 0) {
          for (const comp of item.components) {
            const compId = String(comp.id || comp.productId || '');
            const compQty = (Number(comp.quantity) || 1) * qty;
            const cIdx = products.findIndex(p => String(p.id) === compId);
            if (cIdx !== -1) {
              const prevComp = Number(products[cIdx].stockQuantity) || 0;
              products[cIdx].stockQuantity = prevComp + compQty;
              products[cIdx].inStock = products[cIdx].stockQuantity > 0;
              restoredItems.push({
                id: compId,
                title: products[cIdx].title || comp.title,
                restoredQuantity: compQty,
                componentOf: itemId,
                previousStock: prevComp,
                newStock: products[cIdx].stockQuantity
              });
            }
          }
        }
      }

      saveProducts(products);
      inventoryRestorationResult = {
        success: true,
        restoredAt: new Date().toISOString(),
        restoredCount: restoredItems.length,
        items: restoredItems
      };
    } catch (invErr) {
      console.error(`Error restoring inventory for order #${order.orderId}:`, invErr);
      inventoryRestorationResult = {
        success: false,
        error: invErr.message
      };
    }
  } else {
    inventoryRestorationResult = {
      success: true,
      restored: false,
      message: 'Inventory was already restored previously for this order (idempotent protection).'
    };
  }

  // 5. Payment & Refund Handling
  const paymentMethod = order.payment?.method || '';
  const isPrepaid = paymentMethod !== 'COD' && paymentMethod !== 'cod' &&
    (order.payment?.status === 'Paid' || /razorpay|online|upi|card/i.test(paymentMethod));

  let refundEligibility = isPrepaid ? 'Eligible' : 'Not Applicable (COD)';
  let refundStatus = isPrepaid ? 'Pending Refund' : 'Not Applicable';
  let refundDetails = null;

  if (isPrepaid) {
    const paymentId = order.payment?.transactionId || order.payment?.paymentId || order.payment?.razorpay_payment_id;
    const grandTotal = Number(order.totals?.grandTotal || 0);

    if (paymentId && !String(paymentId).startsWith('TEST-TXN-')) {
      try {
        const refundRes = await createRazorpayRefund({
          paymentId,
          amount: grandTotal,
          notes: {
            orderId: order.orderId,
            reason: reason || 'Customer requested cancellation'
          }
        });

        if (refundRes.success) {
          refundStatus = 'Processed';
          refundDetails = {
            gateway: 'Razorpay',
            refundId: refundRes.refundId,
            amount: refundRes.amount,
            currency: refundRes.currency || 'INR',
            status: refundRes.status || 'processed',
            processedAt: new Date().toISOString()
          };
        } else {
          refundStatus = 'Pending Refund';
          refundDetails = {
            gateway: 'Razorpay',
            error: refundRes.error,
            note: 'Automatic gateway refund could not be completed. Marked as Refund Required for manual admin follow-up.'
          };
        }
      } catch (refErr) {
        refundStatus = 'Pending Refund';
        refundDetails = {
          gateway: 'Razorpay',
          error: refErr.message,
          note: 'Gateway network error. Marked as Refund Required for manual admin follow-up.'
        };
      }
    } else {
      refundStatus = 'Pending Refund';
      refundDetails = {
        note: 'Online payment record has no live gateway transaction ID. Marked as Refund Required for manual verification.'
      };
    }
  } else {
    refundDetails = {
      note: 'Cash on Delivery order. No customer refund required. COD collection cancelled.'
    };
  }

  // 6. Build Comprehensive Cancellation Record & History
  const previousStatus = order.status;
  const cancellationTimestamp = new Date().toISOString();
  const cancelledByLabel = isAdmin ? (adminUser ? `ADMIN (${adminUser})` : 'ADMIN') : 'CUSTOMER';

  const cancellationRecord = {
    orderId: order.orderId,
    reason: reason || 'Customer requested cancellation',
    adminRemarks: adminRemarks || '',
    cancelledBy: cancelledByLabel,
    cancelledAt: cancellationTimestamp,
    previousStatus,
    newStatus: 'Cancelled',
    courierCancellationResult: delhiveryCancelResult,
    refundEligibility,
    refundStatus,
    refundDetails,
    inventoryRestoration: inventoryRestorationResult
  };

  // 7. Persist Updated Order
  orders[idx] = {
    ...order,
    status: 'Cancelled',
    cancelledAt: cancellationTimestamp,
    cancellationReason: reason || 'Customer requested cancellation',
    cancelReason: reason || 'Customer requested cancellation',
    adminRemarks: adminRemarks || '',
    cancelledBy: cancelledByLabel,
    cancellationBy: cancelledByLabel,
    refundEligibility,
    refundStatus,
    refundDetails,
    inventoryRestored: true,
    inventoryRestoration: inventoryRestorationResult,
    cancellationRecord,
    cancellationHistory: [...(order.cancellationHistory || []), cancellationRecord],
    shipment: {
      ...(order.shipment || {}),
      status: 'Cancelled',
      cancelled: true,
      cancelledAt: cancellationTimestamp,
      delhiveryCancelResponse: delhiveryCancelResult
    },
    updatedAt: cancellationTimestamp
  };

  saveOrders(orders);
  console.log(`❌ Order #${order.orderId} successfully CANCELLED [By: ${cancelledByLabel}, Refund: ${refundStatus}, InvRestored: ${inventoryRestorationResult?.success}]`);

  // 8. Trigger Customer Notification Email
  try {
    sendOrderCancellationEmail(orders[idx], cancellationRecord);
  } catch (emailErr) {
    console.error('Error dispatching cancellation email:', emailErr);
  }

  const normalizedFinalOrder = normalizeCustomerOrder(orders[idx]);
  return {
    success: true,
    message: `Order #${order.orderId} cancelled successfully.`,
    data: normalizedFinalOrder,
    order: normalizedFinalOrder
  };
}

// POST /api/orders/:orderId/cancel - Order Cancellation Endpoint
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, adminRemarks } = req.body || {};

    if (!orderId || String(orderId).trim() === '' || String(orderId).toLowerCase() === 'undefined' || String(orderId).toLowerCase() === 'null') {
      return res.status(400).json({ success: false, error: 'A valid Order ID is required for cancellation.' });
    }

    const cleanOrderId = String(orderId).trim();
    const authenticatedCustomer = getCustomerFromRequest(req);
    const adminSession = getAdminSessionFromRequest(req);
    const isAdmin = !!adminSession || req.body?.adminOverride === true;

    const orders = readOrders();
    const order = orders.find(o => String(o.orderId || o.id || '').toUpperCase() === cleanOrderId.toUpperCase());
    if (!order) {
      return res.status(404).json({ success: false, error: `Order #${cleanOrderId} not found.` });
    }

    // Permission Verification
    if (!isAdmin) {
      const reqPhone = (req.headers['x-customer-phone'] || req.body?.customerPhone || '').replace(/\D/g, '');
      const reqEmail = (req.headers['x-customer-email'] || req.body?.customerEmail || '').toLowerCase();
      let isOwner = false;

      if (authenticatedCustomer) {
        isOwner =
          (order.customer?.userId && order.customer.userId === authenticatedCustomer.id) ||
          (order.customer?.email && order.customer.email.toLowerCase() === (authenticatedCustomer.email || '').toLowerCase()) ||
          (order.customer?.phone && String(order.customer.phone).replace(/\D/g, '') === String(authenticatedCustomer.phone).replace(/\D/g, ''));
      } else if (reqPhone || reqEmail) {
        const orderPhone = String(order.customer?.phone || '').replace(/\D/g, '');
        const orderEmail = String(order.customer?.email || '').toLowerCase();
        isOwner = (reqPhone && orderPhone === reqPhone) || (reqEmail && orderEmail === reqEmail);
      }

      if (!authenticatedCustomer && !reqPhone && !reqEmail) {
        return res.status(401).json({ success: false, error: 'Authentication required to cancel order.' });
      }

      if (!isOwner) {
        return res.status(403).json({ success: false, error: 'You are not authorized to cancel this order.' });
      }
    }

    const result = await executeOrderCancellation({
      orderId: order.orderId || order.id || cleanOrderId,
      reason,
      adminRemarks,
      isAdmin,
      adminUser: adminSession?.username || 'admin'
    });

    if (!result.success) {
      return res.status(result.status || 400).json(result);
    }

    return res.json(result);
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders/:orderId/resend-email - Admin manual resend order confirmation email
router.post('/:orderId/resend-email', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const orders = readOrders();
    const order = orders.find(o => String(o.orderId).toUpperCase() === String(orderId).toUpperCase());
    if (!order) {
      return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
    }

    const result = await sendOrderConfirmationEmail(order, true);
    if (result.success) {
      res.json({ success: true, message: `Order confirmation email resent successfully for #${order.orderId}.`, data: result });
    } else {
      res.status(400).json({ success: false, error: result.error || result.reason || 'Failed to send confirmation email.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/orders/:orderId/resend-admin-alert - Admin manual resend admin order alert email
router.post('/:orderId/resend-admin-alert', requireAdminAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const orders = readOrders();
    const order = orders.find(o => String(o.orderId).toUpperCase() === String(orderId).toUpperCase());
    if (!order) {
      return res.status(404).json({ success: false, error: `Order #${orderId} not found.` });
    }

    const result = await sendAdminNewOrderAlert(order, true);
    if (result.success) {
      res.json({
        success: true,
        message: `Admin order alert resent successfully for #${order.orderId} to ${result.recipient}.`,
        data: result
      });
    } else if (result.notConfigured) {
      res.status(400).json({
        success: false,
        notConfigured: true,
        error: 'SMTP credentials are not configured in Admin Settings. Unable to dispatch live email.'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || result.reason || 'Failed to send admin order alert.'
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
