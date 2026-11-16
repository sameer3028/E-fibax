import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import contentRoutes from '../routes/contentRoutes.js';
import { initStore, readJsonFile } from '../store.js';
import { DATA_DIR } from '../config/paths.js';
import { generateAdminToken } from '../middleware/auth.js';

test('Fibax Wellness Club Banner CMS Test Suite', async (t) => {
  await initStore();

  const app = express();
  app.use(express.json());
  app.use('/api', contentRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const adminToken = generateAdminToken('admin');
  const authHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  await t.test('1. Public API: GET /api/website/wellness-club returns active banner config', async () => {
    const res = await fetch(`${baseUrl}/api/website/wellness-club`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.enabled, true);
    assert.equal(body.status, 'active');
    assert.ok(body.data);
    assert.equal(body.data.heading.main, 'FIBAX WELLNESS CLUB');
    assert.ok(Array.isArray(body.data.benefits));
    assert.equal(body.data.coupon.code, 'WELCOME10');
    assert.equal(body.data.productCard.name, 'Safed Musli Vitality Powder');
  });

  await t.test('2. Security: Unauthenticated access to /api/admin/website/wellness-club is rejected with 401', async () => {
    const getRes = await fetch(`${baseUrl}/api/admin/website/wellness-club`);
    assert.equal(getRes.status, 401);

    const putRes = await fetch(`${baseUrl}/api/admin/website/wellness-club`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ heading: { main: 'Hacked Heading' } })
    });
    assert.equal(putRes.status, 401);
  });

  await t.test('3. Admin API: Authenticated GET /api/admin/website/wellness-club returns complete config', async () => {
    const res = await fetch(`${baseUrl}/api/admin/website/wellness-club`, {
      headers: authHeaders
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data);
    assert.equal(body.data.heading.main, 'FIBAX WELLNESS CLUB');
  });

  await t.test('4. Admin API: PUT updates banner content, benefits, coupon, and product card', async () => {
    const updatePayload = {
      heading: {
        main: 'VIP AYURVEDA CLUB',
        highlight: 'GET FLAT ₹150 OFF',
        suffix: 'ON ALL HERBAL TEAS'
      },
      description: 'Exclusive natural wellness community for direct dispatch.',
      benefits: [
        { id: 'b1', text: 'Express 24-hr Delhivery', icon: 'truck', enabled: true },
        { id: 'b2', text: 'Free Doctor Callback', icon: 'phone', enabled: true },
        { id: 'b3', text: '100% Ayurvedic Purity', icon: 'shield', enabled: true }
      ],
      coupon: {
        show: true,
        code: 'AYUSH150',
        label: 'Copy Code'
      },
      productCard: {
        show: true,
        topLabel: 'Priority Pack',
        statusLabel: 'IN STOCK',
        image: '/uploads/triphla-juice.png',
        altText: 'Triphala Juice',
        name: 'Triphala Kashayam 500ml',
        price: '450',
        originalPrice: '520',
        bottomPromoMessage: 'Extra 10% Off Applied!'
      },
      design: {
        bgColor: '#0c2e1b',
        textColor: '#f9f9f9',
        highlightColor: '#facc15',
        badgeBgColor: '#f59e0b',
        btnColor: '#ea580c'
      }
    };

    const res = await fetch(`${baseUrl}/api/admin/website/wellness-club`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updatePayload)
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.heading.main, 'VIP AYURVEDA CLUB');
    assert.equal(body.data.heading.highlight, 'GET FLAT ₹150 OFF');
    assert.equal(body.data.benefits.length, 3);
    assert.equal(body.data.coupon.code, 'AYUSH150');
    assert.equal(body.data.productCard.name, 'Triphala Kashayam 500ml');

    // Verify public endpoint reflects changes immediately
    const pubRes = await fetch(`${baseUrl}/api/website/wellness-club`);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.data.heading.main, 'VIP AYURVEDA CLUB');
    assert.equal(pubBody.data.coupon.code, 'AYUSH150');
  });

  await t.test('5. Pause Control: Pausing banner hides it on public website while preserving settings', async () => {
    const pauseRes = await fetch(`${baseUrl}/api/admin/website/wellness-club`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'paused', enabled: false })
    });
    assert.equal(pauseRes.status, 200);
    const pauseBody = await pauseRes.json();
    assert.equal(pauseBody.data.status, 'paused');
    assert.equal(pauseBody.data.enabled, false);

    // Public website check: must be paused and return data: null
    const pubRes = await fetch(`${baseUrl}/api/website/wellness-club`);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.enabled, false);
    assert.equal(pubBody.status, 'paused');
    assert.equal(pubBody.data, null);

    // Admin endpoint check: full content is preserved safely
    const adminCheck = await fetch(`${baseUrl}/api/admin/website/wellness-club`, { headers: authHeaders });
    const adminBody = await adminCheck.json();
    assert.equal(adminBody.data.status, 'paused');
    assert.equal(adminBody.data.heading.main, 'VIP AYURVEDA CLUB');
    assert.equal(adminBody.data.coupon.code, 'AYUSH150');
  });

  await t.test('6. Reactivate Control: Reactivating banner restores public visibility', async () => {
    const activeRes = await fetch(`${baseUrl}/api/admin/website/wellness-club`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'active', enabled: true })
    });
    assert.equal(activeRes.status, 200);
    const activeBody = await activeRes.json();
    assert.equal(activeBody.data.status, 'active');
    assert.equal(activeBody.data.enabled, true);

    // Public website check: now visible with restored content
    const pubRes = await fetch(`${baseUrl}/api/website/wellness-club`);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.enabled, true);
    assert.equal(pubBody.status, 'active');
    assert.equal(pubBody.data.heading.main, 'VIP AYURVEDA CLUB');
  });

  await t.test('7. Data Persistence: Verify file on disk in DATA_DIR preserves settings', async () => {
    const filePath = join(DATA_DIR, 'wellness_club.json');
    const diskContent = JSON.parse(readFileSync(filePath, 'utf8'));
    assert.equal(diskContent.heading.main, 'VIP AYURVEDA CLUB');
    assert.equal(diskContent.coupon.code, 'AYUSH150');
    assert.equal(diskContent.productCard.name, 'Triphala Kashayam 500ml');
  });

  // Teardown
  server.close();
});
