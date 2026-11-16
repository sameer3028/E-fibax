import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { generateCustomerToken } from '../middleware/auth.js';
import customerAuthRoutes from '../routes/customerAuthRoutes.js';
import orderRoutes, { executeOrderCancellation } from '../routes/orderRoutes.js';
import { initStore, setArray, getArray } from '../store.js';

test('Customer Order Cancellation Fix & Order ID Mapping Suite', async (t) => {
  await initStore();

  // Seed test products
  const testProducts = [
    {
      id: 'PROD-CUST-001',
      title: 'Fibax Herbal Joint Relief',
      stockQuantity: 20,
      inStock: true
    },
    {
      id: 'PROD-CUST-002',
      title: 'Fibax Pure Shilajit Gold',
      stockQuantity: 15,
      inStock: true
    }
  ];
  setArray('products', testProducts);

  // Seed test customers
  const testCustomers = [
    {
      id: 'cust-id-101',
      name: 'Rohan Verma',
      phone: '9876543210',
      email: 'rohan@example.com'
    },
    {
      id: 'cust-id-102',
      name: 'Simran Kaur',
      phone: '9811223344',
      email: 'simran@example.com'
    }
  ];
  setArray('users', testCustomers);

  // Seed test orders with real production schemas (only orderId, no id field)
  const testOrders = [
    {
      orderId: 'FBX-CUST-001',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: {
        name: 'Rohan Verma',
        phone: '9876543210',
        email: 'rohan@example.com',
        userId: 'cust-id-101'
      },
      items: [
        { id: 'PROD-CUST-001', title: 'Fibax Herbal Joint Relief', quantity: 2, price: 500 }
      ],
      totals: { grandTotal: 1000 },
      payment: { method: 'COD', status: 'Pending' },
      trackingId: null,
      delhiveryAwb: null
    },
    {
      orderId: 'FBX-CUST-002',
      createdAt: new Date().toISOString(),
      status: 'In Transit',
      customer: {
        name: 'Rohan Verma',
        phone: '9876543210',
        email: 'rohan@example.com',
        userId: 'cust-id-101'
      },
      items: [
        { id: 'PROD-CUST-002', title: 'Fibax Pure Shilajit Gold', quantity: 1, price: 999 }
      ],
      totals: { grandTotal: 999 },
      payment: { method: 'Prepaid', status: 'Paid' },
      trackingId: 'DLV987654321',
      delhiveryAwb: 'DLV987654321'
    },
    {
      orderId: 'FBX-CUST-003',
      createdAt: new Date().toISOString(),
      status: 'Delivered',
      customer: {
        name: 'Rohan Verma',
        phone: '9876543210',
        email: 'rohan@example.com',
        userId: 'cust-id-101'
      },
      items: [
        { id: 'PROD-CUST-001', title: 'Fibax Herbal Joint Relief', quantity: 1, price: 500 }
      ],
      totals: { grandTotal: 500 },
      payment: { method: 'COD', status: 'Paid' },
      trackingId: 'DLV123456789',
      delhiveryAwb: 'DLV123456789'
    },
    {
      orderId: 'FBX-CUST-004',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: {
        name: 'Simran Kaur',
        phone: '9811223344',
        email: 'simran@example.com',
        userId: 'cust-id-102'
      },
      items: [
        { id: 'PROD-CUST-002', title: 'Fibax Pure Shilajit Gold', quantity: 1, price: 999 }
      ],
      totals: { grandTotal: 999 },
      payment: { method: 'COD', status: 'Pending' },
      trackingId: null,
      delhiveryAwb: null
    }
  ];
  setArray('orders', testOrders);

  // Set up Express test server
  const app = express();
  app.use(express.json());
  app.use('/api', customerAuthRoutes);
  app.use('/api/orders', orderRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  const tokenRohan = generateCustomerToken(testCustomers[0].id);
  const tokenSimran = generateCustomerToken(testCustomers[1].id);

  t.after(() => {
    server.close();
  });

  // --- Sub-test 1: GET /api/user/orders returns orders with populated id and orderId ---
  await t.test('GET /api/user/orders populates canonical id and orderId matching production records', async () => {
    const res = await fetch(`${baseUrl}/api/user/orders`, {
      headers: { Authorization: `Bearer ${tokenRohan}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 3);

    for (const order of body.data) {
      assert.ok(order.orderId, 'Order must have orderId');
      assert.ok(order.id, 'Order must have id for legacy compatibility');
      assert.strictEqual(order.id, order.orderId, 'id and orderId must be identical canonical ID');
      assert.ok(order.totalAmount !== undefined, 'totalAmount must be populated');
      assert.ok(order.paymentMethod, 'paymentMethod must be populated');
    }

    const order1 = body.data.find(o => o.orderId === 'FBX-CUST-001');
    assert.strictEqual(order1.id, 'FBX-CUST-001');
    assert.strictEqual(order1.orderId, 'FBX-CUST-001');
    assert.strictEqual(order1.totalAmount, 1000);
    assert.strictEqual(order1.paymentMethod, 'COD');
  });

  // --- Sub-test 2: Customer GET /api/orders branch also populates id and orderId ---
  await t.test('GET /api/orders (customer token) normalizes id and orderId', async () => {
    const res = await fetch(`${baseUrl}/api/orders`, {
      headers: { Authorization: `Bearer ${tokenRohan}` }
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 3);
    assert.strictEqual(body.data[0].id, body.data[0].orderId);
  });

  // --- Sub-test 3: POST /api/orders/undefined/cancel is rejected with 400 Bad Request ---
  await t.test('POST /api/orders/undefined/cancel is rejected with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/orders/undefined/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRohan}`
      },
      body: JSON.stringify({ reason: 'Accidental order' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /A valid Order ID is required/i);
  });

  // --- Sub-test 4: POST /api/orders/null/cancel is rejected with 400 Bad Request ---
  await t.test('POST /api/orders/null/cancel is rejected with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/orders/null/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRohan}`
      },
      body: JSON.stringify({ reason: 'Accidental order' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /A valid Order ID is required/i);
  });

  // --- Sub-test 5: Non-existent order cancellation returns 404 ---
  await t.test('POST /api/orders/FBX-NONEXISTENT/cancel returns 404', async () => {
    const res = await fetch(`${baseUrl}/api/orders/FBX-NONEXISTENT/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRohan}`
      },
      body: JSON.stringify({ reason: 'Accidental order' })
    });
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /Order #FBX-NONEXISTENT not found/i);
  });

  // --- Sub-test 6: Unauthenticated cancellation request returns 401 ---
  await t.test('Unauthenticated customer cancellation request returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/orders/FBX-CUST-001/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Accidental order' })
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
  });

  // --- Sub-test 7: Customer B cannot cancel Customer A's order (403 Forbidden) ---
  await t.test('Customer B cannot cancel Customer A order (Cross-customer isolation)', async () => {
    const res = await fetch(`${baseUrl}/api/orders/FBX-CUST-001/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenSimran}` // Simran tries to cancel Rohan's order
      },
      body: JSON.stringify({ reason: 'Malicious cancellation' })
    });
    assert.strictEqual(res.status, 403);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /not authorized to cancel this order/i);
  });

  // --- Sub-test 8: Customer A cancels their own valid order successfully ---
  await t.test('Customer A successfully cancels own pre-shipment order', async () => {
    const initialProducts = getArray('products');
    const initialJointReliefStock = initialProducts.find(p => p.id === 'PROD-CUST-001').stockQuantity;

    const res = await fetch(`${baseUrl}/api/orders/FBX-CUST-001/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRohan}`
      },
      body: JSON.stringify({ reason: 'I changed my mind / ordered by mistake' })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.data);
    assert.strictEqual(body.data.id, 'FBX-CUST-001');
    assert.strictEqual(body.data.orderId, 'FBX-CUST-001');
    assert.strictEqual(body.data.status, 'Cancelled');
    assert.strictEqual(body.data.cancellationReason, 'I changed my mind / ordered by mistake');

    // Verify stored order status
    const orders = getArray('orders');
    const storedOrder = orders.find(o => o.orderId === 'FBX-CUST-001');
    assert.strictEqual(storedOrder.status, 'Cancelled');
    assert.strictEqual(storedOrder.cancellationReason, 'I changed my mind / ordered by mistake');

    // Verify inventory restored exactly once (initial + 2)
    const updatedProducts = getArray('products');
    const updatedJointReliefStock = updatedProducts.find(p => p.id === 'PROD-CUST-001').stockQuantity;
    assert.strictEqual(updatedJointReliefStock, initialJointReliefStock + 2);
  });

  // --- Sub-test 9: Duplicate cancellation rejected ---
  await t.test('Duplicate cancellation on already cancelled order returns 400', async () => {
    const res = await fetch(`${baseUrl}/api/orders/FBX-CUST-001/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRohan}`
      },
      body: JSON.stringify({ reason: 'Trying again' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /already Cancelled/i);
  });

  // --- Sub-test 10: In-transit order cannot be cancelled by customer ---
  await t.test('In-transit order cannot be cancelled online by customer', async () => {
    const res = await fetch(`${baseUrl}/api/orders/FBX-CUST-002/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRohan}`
      },
      body: JSON.stringify({ reason: 'Too late' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /in transit with courier/i);
  });

  // --- Sub-test 11: Delivered order cannot be cancelled by customer ---
  await t.test('Delivered order cannot be cancelled by customer', async () => {
    const res = await fetch(`${baseUrl}/api/orders/FBX-CUST-003/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRohan}`
      },
      body: JSON.stringify({ reason: 'Already received' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /Delivered orders cannot be cancelled/i);
  });

  // --- Sub-test 12: Direct executeOrderCancellation validation guards ---
  await t.test('executeOrderCancellation rejects undefined or empty orderId directly', async () => {
    const resUndefined = await executeOrderCancellation({ orderId: 'undefined', reason: 'Test' });
    assert.strictEqual(resUndefined.success, false);
    assert.strictEqual(resUndefined.status, 400);

    const resNull = await executeOrderCancellation({ orderId: null, reason: 'Test' });
    assert.strictEqual(resNull.success, false);
    assert.strictEqual(resNull.status, 400);

    const resEmpty = await executeOrderCancellation({ orderId: '   ', reason: 'Test' });
    assert.strictEqual(resEmpty.success, false);
    assert.strictEqual(resEmpty.status, 400);
  });
});
