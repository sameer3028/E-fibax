import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { initStore, storageDriver, getArray } from '../store.js';
import productRoutes from '../routes/productRoutes.js';
import shippingRoutes from '../routes/shippingRoutes.js';
import paymentRoutes from '../routes/paymentRoutes.js';

test('Server Integration & Route Mounting Tests', async (t) => {
  await initStore();

  const app = express();
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      storageDriver: storageDriver()
    });
  });

  app.use('/api/products', productRoutes);
  app.use('/api/shipping', shippingRoutes);
  app.use('/api/payment', paymentRoutes);

  let server;
  let testPort;

  await t.test('Server starts and binds to random test port', async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        testPort = server.address().port;
        resolve();
      });
    });
    assert.ok(testPort > 0, 'Port must be assigned');
  });

  await t.test('GET /api/health returns healthy payload', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'healthy');
    assert.equal(data.storageDriver, 'json');
  });

  await t.test('GET /api/products returns product array', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data), 'Data should be an array of products');
    assert.ok(data.data.length > 0, 'Should have products');
  });

  await t.test('GET /api/shipping/config returns sanitized public configuration for anonymous callers', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/shipping/config`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.freeShippingThreshold !== undefined, 'freeShippingThreshold must be present');
    assert.equal(data.data.apiToken, undefined, 'Private Delhivery token must NOT be leaked to public');
  });

  await t.test('GET /api/payment/config returns public payment configuration', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/payment/config`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.currency, 'INR');
    assert.equal(data.companyName, 'Fibax Ayurveda');
  });

  // Close test server
  if (server) {
    server.close();
  }
});
