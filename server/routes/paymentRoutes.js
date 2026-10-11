import { Router } from 'express';
import {
  getPaymentConfig,
  createRazorpayOrder,
  verifyPaymentSignature
} from '../payment.js';

const router = Router();

// GET /api/payment/config - Public payment gateway config
router.get('/config', (req, res) => {
  try {
    const config = getPaymentConfig();
    res.json({ success: true, ...config });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment/create-order - Initialize Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, receipt, notes } = req.body || {};
    const orderData = await createRazorpayOrder({ amount, receipt, notes });
    res.json(orderData);
  } catch (err) {
    console.error('Create payment order error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/payment/verify - Cryptographically verify signature
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, razorpayOrderId, paymentId, signature } = req.body || {};
    const result = verifyPaymentSignature({
      razorpay_order_id: razorpay_order_id || razorpayOrderId,
      razorpay_payment_id: razorpay_payment_id || paymentId,
      razorpay_signature: razorpay_signature || signature
    });
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
