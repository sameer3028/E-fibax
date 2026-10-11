import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { verifyPaymentSignature, getPaymentConfig } from '../payment.js';

test('Payment Gateway Security Tests', async (t) => {
  await t.test('getPaymentConfig returns public config with currency and company name', () => {
    const config = getPaymentConfig();
    assert.equal(config.currency, 'INR');
    assert.equal(config.companyName, 'Fibax Ayurveda');
    assert.ok(config.keyId, 'Key ID must be present');
  });

  await t.test('verifyPaymentSignature validates genuine Razorpay signature', () => {
    const testSecret = process.env.RAZORPAY_KEY_SECRET || '6iMt0tb8iH7TVB3sFaFL7o0f';
    const orderId = 'order_test_123456';
    const paymentId = 'pay_test_789012';
    
    // Generate valid HMAC SHA256 signature
    const body = `${orderId}|${paymentId}`;
    const validSignature = crypto.createHmac('sha256', testSecret).update(body).digest('hex');

    const result = verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature
    });

    assert.equal(result.success, true);
    assert.equal(result.verified, true);
    assert.equal(result.paymentId, paymentId);
    assert.equal(result.orderId, orderId);
  });

  await t.test('verifyPaymentSignature rejects tampered or fraudulent signature', () => {
    const orderId = 'order_test_123456';
    const paymentId = 'pay_test_789012';
    const forgedSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const result = verifyPaymentSignature({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: forgedSignature
    });

    assert.equal(result.success, false);
    assert.equal(result.verified, false);
    assert.match(result.error, /invalid payment signature/i);
  });

  await t.test('verifyPaymentSignature rejects incomplete credentials', () => {
    const result = verifyPaymentSignature({
      razorpay_order_id: 'order_123'
    });

    assert.equal(result.success, false);
    assert.match(result.error, /incomplete payment credentials/i);
  });
});
