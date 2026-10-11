import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAdminToken,
  getAdminSessionFromRequest,
  activeAdminSessions,
  hashPassword,
  verifyPassword
} from '../middleware/auth.js';
import { verifyOrderPayment } from '../payment.js';
import crypto from 'crypto';

test('Security Middleware & Payment Verification Tests', async (t) => {
  await t.test('Password hashing and verification with scrypt', () => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword('SuperSecret123!', salt);

    assert.equal(verifyPassword('SuperSecret123!', salt, hash), true, 'Valid password must verify');
    assert.equal(verifyPassword('WrongPassword', salt, hash), false, 'Incorrect password must be rejected');
  });

  await t.test('Admin session creation and Bearer token parsing', () => {
    const username = 'admin_test';
    const token = generateAdminToken(username);

    assert.ok(token, 'Token must be generated');
    assert.equal(activeAdminSessions.has(token), true, 'Session must exist in active map');

    const mockReq = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };

    const session = getAdminSessionFromRequest(mockReq);
    assert.ok(session, 'Session must be retrieved from Bearer token');
    assert.equal(session.username, username);
  });

  await t.test('verifyOrderPayment validates cash on delivery (COD) correctly', () => {
    const codPayment = { method: 'COD', status: 'Pending' };
    const result = verifyOrderPayment(codPayment);

    assert.equal(result.valid, true);
    assert.equal(result.verifiedPayment.status, 'Pending');
  });

  await t.test('verifyOrderPayment rejects Razorpay payment without signature', () => {
    const fraudPayment = {
      method: 'Razorpay UPI/Cards (Live)',
      status: 'Paid',
      transactionId: 'pay_fake_123'
    };
    const result = verifyOrderPayment(fraudPayment);

    assert.equal(result.valid, false);
    assert.match(result.error, /missing razorpay verification tokens/i);
  });

  await t.test('verifyOrderPayment accepts authentic Razorpay payment with valid signature', () => {
    const testSecret = process.env.RAZORPAY_KEY_SECRET || '6iMt0tb8iH7TVB3sFaFL7o0f';
    const orderId = 'order_valid_999';
    const paymentId = 'pay_valid_888';

    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const authenticPayment = {
      method: 'Razorpay UPI/Cards (Live)',
      status: 'Paid',
      razorpayOrderId: orderId,
      transactionId: paymentId,
      signature: validSignature
    };

    const result = verifyOrderPayment(authenticPayment);
    assert.equal(result.valid, true);
    assert.equal(result.verifiedPayment.status, 'Paid');
    assert.equal(result.verifiedPayment.transactionId, paymentId);
  });
});
