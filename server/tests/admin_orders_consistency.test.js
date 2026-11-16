import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { generateAdminToken, generateCustomerToken } from '../middleware/auth.js';
import adminRoutes from '../routes/adminRoutes.js';
import orderRoutes from '../routes/orderRoutes.js';
import { initStore, setArray } from '../store.js';

test('Admin Orders Consistency & Security Test Suite', async (t) => {
  await initStore();

  // Seed test users into store
  setArray('users', [
    { id: 'user-001', name: 'Harpreet Singh', phone: '9988776655', email: 'harpreet@example.com' },
    { id: 'user-002', name: 'Simranjit Kaur', phone: '9876543210', email: 'simran@example.com' }
  ]);

  // Seed test orders into store
  const sampleOrders = [
    {
      orderId: 'FBX-TEST-001',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: { name: 'Harpreet Singh', phone: '9988776655', email: 'harpreet@example.com', userId: 'user-001' },
      items: [{ title: 'Safed Musli Powder', quantity: 1, price: 600 }],
      totals: { grandTotal: 600 },
      payment: { method: 'COD' },
      trackingId: null,
      delhiveryAwb: null
    },
    {
      orderId: 'FBX-TEST-002',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: { name: 'Harpreet Singh', phone: '9988776655', email: 'harpreet@example.com', userId: 'user-001' },
      items: [{ title: 'Ashwagandha Gold', quantity: 1, price: 800 }],
      totals: { grandTotal: 800 },
      payment: { method: 'COD' },
      trackingId: null,
      delhiveryAwb: null
    },
    {
      orderId: 'FBX-TEST-003',
      createdAt: new Date().toISOString(),
      status: 'Dispatched',
      customer: { name: 'Simranjit Kaur', phone: '9876543210', email: 'simran@example.com', userId: 'user-002' },
      items: [{ title: 'Shilajit Resin', quantity: 1, price: 1200 }],
      totals: { grandTotal: 1200 },
      payment: { method: 'Prepaid' },
      trackingId: 'DLH-123456789',
      delhiveryAwb: 'DLH-123456789'
    }
  ];

  setArray('orders', sampleOrders);

  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  app.use('/api/orders', orderRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const adminToken = generateAdminToken('admin');
  const customerToken = generateCustomerToken('user-001');

  try {
    await t.test('1. Security: GET /api/admin/orders rejects unauthenticated calls with 401', async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`);
      assert.strictEqual(res.status, 401);
      const body = await res.json();
      assert.strictEqual(body.success, false);
    });

    await t.test('2. Admin API: GET /api/admin/orders returns all orders with strict no-cache headers', async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.headers.get('cache-control'), 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.count, 3);
      assert.strictEqual(body.data.length, 3);
    });

    await t.test('3. Security: GET /api/orders rejects unauthenticated calls with 401', async () => {
      const res = await fetch(`${baseUrl}/api/orders`);
      assert.strictEqual(res.status, 401);
      const body = await res.json();
      assert.strictEqual(body.success, false);
    });

    await t.test('4. Admin API: GET /api/orders with admin token returns all orders (Desktop parity)', async () => {
      const res = await fetch(`${baseUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.count, 3);
      assert.strictEqual(body.data.length, 3);
    });

    await t.test('5. Customer Isolation: GET /api/orders with customer token only returns their own 2 orders', async () => {
      const res = await fetch(`${baseUrl}/api/orders`, {
        headers: { 'Authorization': `Bearer ${customerToken}` }
      });
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.count, 2);
      assert.strictEqual(body.data.length, 2);
      assert(body.data.every(o => o.customer.phone === '9988776655'));
    });

    await t.test('6. Orders without AWB are preserved and returned with full customer details', async () => {
      const res = await fetch(`${baseUrl}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const body = await res.json();
      const pendingOrders = body.data.filter(o => !o.trackingId);
      assert.strictEqual(pendingOrders.length, 2);
      assert.strictEqual(pendingOrders[0].orderId, 'FBX-TEST-001');
      assert.strictEqual(pendingOrders[0].customer.name, 'Harpreet Singh');
      assert.strictEqual(pendingOrders[0].status, 'Processing');
    });
  } finally {
    server.close();
  }
});
