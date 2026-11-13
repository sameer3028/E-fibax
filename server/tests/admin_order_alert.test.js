import test from 'node:test';
import assert from 'node:assert/strict';
import { isSmtpConfigured, sendAdminNewOrderAlert, readEmailConfig } from '../services/emailService.js';
import { generateAdminOrderAlertHtml, generateAdminOrderAlertText } from '../emailTemplates/adminOrderAlert.js';

test('Admin New Order Alert Suite', async (t) => {
  await t.test('isSmtpConfigured returns false when host, user or password are missing', () => {
    assert.equal(isSmtpConfigured({ smtpHost: '', smtpUser: '', smtpPassword: '' }), false);
    assert.equal(isSmtpConfigured({ smtpHost: 'smtp.gmail.com', smtpUser: '', smtpPassword: '' }), false);
    assert.equal(isSmtpConfigured({ smtpHost: 'smtp.gmail.com', smtpUser: 'user@gmail.com', smtpPassword: '' }), false);
    assert.equal(isSmtpConfigured({ smtpHost: 'smtp.gmail.com', smtpUser: 'user@gmail.com', smtpPassword: 'secret' }), true);
  });

  await t.test('Default admin notification recipient is fibaxpharma@gmail.com', () => {
    const config = readEmailConfig();
    assert.equal(config.adminAlertEmail, 'fibaxpharma@gmail.com');
    assert.equal(config.adminAlertEnabled, true);
    assert.equal(config.senderName, 'Fibax Ayurveda');
    assert.equal(config.senderEmail, 'orders@fibaxpharma.com');
  });

  await t.test('sendAdminNewOrderAlert handles unconfigured SMTP safely without faking delivery', async () => {
    const mockOrder = {
      orderId: 'FBX-UNIT-TEST-001',
      createdAt: new Date().toISOString(),
      customer: { name: 'Unit Tester', phone: '9876543210' },
      items: [{ title: 'Axe Ortho', price: 425, quantity: 1 }],
      shipping: { address: 'Test St', city: 'Mohali', state: 'Punjab', pincode: '160071' },
      totals: { subtotal: 425, grandTotal: 425 }
    };

    const res = await sendAdminNewOrderAlert(mockOrder, true);
    assert.equal(res.notConfigured, true);
    assert.equal(res.reason, 'smtp_not_configured');
    assert.equal(res.recipient, 'fibaxpharma@gmail.com');
  });

  await t.test('sendAdminNewOrderAlert enforces idempotency to prevent duplicate alerts', async () => {
    const mockSentOrder = {
      orderId: 'FBX-UNIT-TEST-IDEMPOTENT',
      adminOrderAlertSent: true,
      adminOrderAlertSentAt: new Date().toISOString()
    };

    const res = await sendAdminNewOrderAlert(mockSentOrder, false);
    assert.equal(res.success, true);
    assert.equal(res.skipped, true);
    assert.equal(res.reason, 'already_sent');
  });

  await t.test('generateAdminOrderAlertHtml produces valid email with order details and deep link', () => {
    const sample = {
      orderId: 'FBX-UNIT-HTML-001',
      createdAt: '2026-11-10T12:00:00.000Z',
      customer: { name: 'Karan Sharma', phone: '9911223344', email: 'karan@example.com' },
      shipping: { address: 'Plot 10', city: 'Amritsar', state: 'Punjab', pincode: '143001' },
      items: [{ title: 'Fibax Multivitamin Syrup 500ml', sku: 'FBX-MULTI', price: 345, quantity: 2 }],
      payment: { method: 'COD' },
      totals: { subtotal: 690, discountAmount: 0, shippingFee: 49, codFee: 0, grandTotal: 739 }
    };

    const html = generateAdminOrderAlertHtml(sample);
    const text = generateAdminOrderAlertText(sample);

    assert.ok(html.includes('NEW ORDER RECEIVED | Order #FBX-UNIT-HTML-001 | Fibax Ayurveda'));
    assert.ok(html.includes('Karan Sharma'));
    assert.ok(html.includes('9911223344'));
    assert.ok(html.includes('Amritsar'));
    assert.ok(html.includes('Fibax Multivitamin Syrup 500ml'));
    assert.ok(html.includes('₹739'));
    assert.ok(html.includes('VIEW ORDER IN ADMIN PANEL'));
    assert.ok(html.includes('/admin?tab=orders&orderId=FBX-UNIT-HTML-001'));

    assert.ok(text.includes('Karan Sharma'));
    assert.ok(text.includes('FBX-UNIT-HTML-001'));
  });
});
