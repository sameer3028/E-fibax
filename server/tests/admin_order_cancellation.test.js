import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { generateAdminToken, generateCustomerToken } from '../middleware/auth.js';
import adminRoutes from '../routes/adminRoutes.js';
import orderRoutes from '../routes/orderRoutes.js';
import { initStore, setArray, getArray } from '../store.js';
import { DATA_DIR } from '../config/paths.js';

test('Admin Order Cancellation & Logistics Suite', async (t) => {
  await initStore();

  const testProducts = [
    {
      id: 'PROD-CANCEL-001',
      title: 'Fibax Herbal Joint Relief',
      stockQuantity: 20,
      inStock: true
    },
    {
      id: 'PROD-CANCEL-002',
      title: 'Fibax Pure Shilajit Gold',
      stockQuantity: 15,
      inStock: true
    }
  ];
  setArray('products', testProducts);

  const testUsers = [
    {
      id: 'user-cnc-1',
      name: 'Vikram Malhotra',
      phone: '9876543210',
      email: 'vikram@example.com'
    },
    {
      id: 'user-cnc-2',
      name: 'Pooja Sharma',
      phone: '9811223344',
      email: 'pooja@example.com'
    }
  ];
  setArray('users', testUsers);

  const sampleOrders = [
    {
      orderId: 'FBX-CNC-001',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: { name: 'Vikram Malhotra', phone: '9876543210', email: 'vikram@example.com', userId: 'user-cnc-1' },
      items: [{ id: 'PROD-CANCEL-001', title: 'Fibax Herbal Joint Relief', quantity: 2, price: 500 }],
      totals: { grandTotal: 1000 },
      payment: { method: 'COD', status: 'Pending' },
      trackingId: null,
      delhiveryAwb: null
    },
    {
      orderId: 'FBX-CNC-002',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: { name: 'Pooja Sharma', phone: '9811223344', email: 'pooja@example.com', userId: 'user-cnc-2' },
      items: [{ id: 'PROD-CANCEL-002', title: 'Fibax Pure Shilajit Gold', quantity: 1, price: 1200 }],
      totals: { grandTotal: 1200 },
      payment: { method: 'Prepaid', status: 'Paid', transactionId: 'pay_test_cnc_999' },
      trackingId: null,
      delhiveryAwb: null
    },
    {
      orderId: 'FBX-CNC-003',
      createdAt: new Date().toISOString(),
      status: 'In Transit',
      customer: { name: 'Rohan Mehra', phone: '9711223344', email: 'rohan@example.com', userId: 'user-cnc-3' },
      items: [{ id: 'PROD-CANCEL-001', title: 'Fibax Herbal Joint Relief', quantity: 1, price: 500 }],
      totals: { grandTotal: 500 },
      payment: { method: 'COD' },
      trackingId: 'DLH-TEST-TRANSIT-1',
      delhiveryAwb: 'DLH-TEST-TRANSIT-1'
    },
    {
      orderId: 'FBX-CNC-004',
      createdAt: new Date().toISOString(),
      status: 'Delivered',
      customer: { name: 'Ananya Gupta', phone: '9611223344', email: 'ananya@example.com', userId: 'user-cnc-4' },
      items: [{ id: 'PROD-CANCEL-002', title: 'Fibax Pure Shilajit Gold', quantity: 1, price: 1200 }],
      totals: { grandTotal: 1200 },
      payment: { method: 'Prepaid', status: 'Paid' },
      trackingId: 'DLH-TEST-DELIVERED-1',
      delhiveryAwb: 'DLH-TEST-DELIVERED-1'
    },
    {
      orderId: 'FBX-CNC-005',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: { name: 'Karan Johar', phone: '9511223344', email: 'karan@example.com', userId: 'user-cnc-5' },
      items: [{ id: 'PROD-CANCEL-001', title: 'Fibax Herbal Joint Relief', quantity: 1, price: 500 }],
      totals: { grandTotal: 500 },
      payment: { method: 'COD' },
      trackingId: 'DLH-TEST-MANIFEST-1',
      delhiveryAwb: 'DLH-TEST-MANIFEST-1'
    }
  ];

  setArray('orders', sampleOrders);

  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  app.use('/api/orders', orderRoutes);

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const adminToken = generateAdminToken('superadmin');
  const poojaCustomerToken = generateCustomerToken('user-cnc-2');

  t.after(() => {
    server.close();
  });

  // 1. Security Check
  await t.test('1. Security: POST /api/admin/orders/:orderId/cancel rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/orders/FBX-CNC-001/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Customer changed mind' })
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // 2. Pre-Shipment COD Cancellation & Inventory Restoration
  await t.test('2. Cancel Pre-Shipment COD Order: restores stock and sets status to Cancelled', async () => {
    const res = await fetch(`${baseUrl}/api/admin/orders/FBX-CNC-001/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reason: 'Customer requested cancellation',
        adminRemarks: 'Verified cancellation over phone with customer Vikram.'
      })
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    const orderData = json.data || json.order;
    assert.ok(orderData);
    assert.strictEqual(orderData.status, 'Cancelled');
    assert.strictEqual(orderData.cancellationReason, 'Customer requested cancellation');
    assert.strictEqual(orderData.adminRemarks, 'Verified cancellation over phone with customer Vikram.');
    assert.strictEqual(orderData.inventoryRestored, true);
    assert.strictEqual(orderData.refundStatus, 'Not Applicable');

    // Verify stock restoration in products collection (20 + 2 = 22)
    const products = getArray('products');
    const item = products.find(p => p.id === 'PROD-CANCEL-001');
    assert.strictEqual(item.stockQuantity, 22);
  });

  // 3. Inventory Restoration Idempotency
  await t.test('3. Idempotent inventory restoration: duplicate cancellation does not double-restore stock', async () => {
    const res = await fetch(`${baseUrl}/api/admin/orders/FBX-CNC-001/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reason: 'Duplicate call test'
      })
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.match(json.error, /already cancelled/i);

    // Stock should STILL be 22, NOT 24
    const products = getArray('products');
    const item = products.find(p => p.id === 'PROD-CANCEL-001');
    assert.strictEqual(item.stockQuantity, 22);
  });

  // 4. Prepaid Order Cancellation & Refund Tracking
  await t.test('4. Cancel Prepaid Order: triggers refund audit and restores stock', async () => {
    const res = await fetch(`${baseUrl}/api/admin/orders/FBX-CNC-002/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reason: 'Product out of stock',
        adminRemarks: 'Full refund to original source.'
      })
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    const orderData = json.data || json.order;
    assert.ok(orderData);
    assert.strictEqual(orderData.status, 'Cancelled');
    assert.strictEqual(orderData.refundEligibility, 'Eligible');
    assert.ok(orderData.refundStatus === 'Processed' || orderData.refundStatus === 'Pending Refund');
    assert.ok(orderData.refundDetails !== null);

    // Stock restoration for PROD-CANCEL-002 (15 + 1 = 16)
    const products = getArray('products');
    const item = products.find(p => p.id === 'PROD-CANCEL-002');
    assert.strictEqual(item.stockQuantity, 16);
  });

  // 5. Block In Transit Cancellation
  await t.test('5. Guard: Block direct cancellation when order is In Transit / Dispatched', async () => {
    const res = await fetch(`${baseUrl}/api/admin/orders/FBX-CNC-003/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reason: 'Customer requested cancellation'
      })
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.match(json.error, /In Transit/i);

    // Verify order status unchanged
    const orders = getArray('orders');
    const order = orders.find(o => o.orderId === 'FBX-CNC-003');
    assert.strictEqual(order.status, 'In Transit');
  });

  // 6. Block Delivered Order Cancellation
  await t.test('6. Guard: Block direct cancellation when order is already Delivered', async () => {
    const res = await fetch(`${baseUrl}/api/admin/orders/FBX-CNC-004/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reason: 'Customer requested cancellation'
      })
    });

    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.match(json.error, /Delivered/i);

    // Verify order status unchanged
    const orders = getArray('orders');
    const order = orders.find(o => o.orderId === 'FBX-CNC-004');
    assert.strictEqual(order.status, 'Delivered');
  });

  // 7. Cancellation with AWB (Manifested)
  await t.test('7. Order with AWB syncs courier cancellation & updates shipment status', async () => {
    const res = await fetch(`${baseUrl}/api/admin/orders/FBX-CNC-005/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        reason: 'Duplicate order'
      })
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    const orderData = json.data || json.order;
    assert.ok(orderData);
    assert.strictEqual(orderData.status, 'Cancelled');
    assert.strictEqual(orderData.shipment?.status, 'Cancelled');
    assert.strictEqual(orderData.shipment?.cancelled, true);
  });

  // 8. Customer Visibility Parity
  await t.test('8. Customer View: GET /api/orders returns updated Cancelled status and reason', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      headers: {
        Authorization: `Bearer ${poojaCustomerToken}`
      }
    });

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.success, true);
    const poojaOrder = json.data.find(o => o.orderId === 'FBX-CNC-002');
    assert.ok(poojaOrder);
    assert.strictEqual(poojaOrder.status, 'Cancelled');
    assert.strictEqual(poojaOrder.cancellationReason, 'Product out of stock');
    assert.strictEqual(poojaOrder.refundEligibility, 'Eligible');
  });

  // 9. Cancellation Audit History
  await t.test('9. Order records comprehensive cancellationRecord and cancellationHistory', async () => {
    const orders = getArray('orders');
    const order = orders.find(o => o.orderId === 'FBX-CNC-001');

    assert.ok(order.cancellationRecord);
    assert.strictEqual(order.cancellationRecord.orderId, 'FBX-CNC-001');
    assert.strictEqual(order.cancellationRecord.previousStatus, 'Processing');
    assert.strictEqual(order.cancellationRecord.newStatus, 'Cancelled');
    assert.match(order.cancellationRecord.cancelledBy, /ADMIN/);
    assert.ok(Array.isArray(order.cancellationHistory));
    assert.strictEqual(order.cancellationHistory.length, 1);
  });

  // 10. Direct File Persistence in DATA_DIR
  await t.test('10. Data Persistence: Verify file on disk preserves cancelled order state', async () => {
    const dataDir = DATA_DIR;
    const ordersFilePath = join(dataDir, 'orders.json');
    assert.ok(existsSync(ordersFilePath));

    const raw = readFileSync(ordersFilePath, 'utf8');
    const diskOrders = JSON.parse(raw);
    const diskOrder = diskOrders.find(o => o.orderId === 'FBX-CNC-001');

    assert.ok(diskOrder);
    assert.strictEqual(diskOrder.status, 'Cancelled');
    assert.strictEqual(diskOrder.cancellationReason, 'Customer requested cancellation');
    assert.strictEqual(diskOrder.inventoryRestored, true);
  });
});
