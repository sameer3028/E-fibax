import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import contentRoutes from '../routes/contentRoutes.js';
import { generateAdminToken } from '../middleware/auth.js';

test('Hero Banner Responsive System & Cache Invalidation Tests', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api', contentRoutes);

  let server;
  let testPort;
  const adminToken = generateAdminToken('admin');
  const authHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  await t.test('Server starts and mounts contentRoutes', async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        testPort = server.address().port;
        resolve();
      });
    });
    assert.ok(testPort > 0);
  });

  t.after(() => {
    if (server) server.close();
  });

  await t.test('Public API: GET /api/website/home-banners/active sends strict no-cache headers', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/website/home-banners/active`);
    assert.equal(res.status, 200);

    const cacheControl = res.headers.get('cache-control');
    assert.ok(cacheControl, 'Cache-Control header must be present');
    assert.ok(cacheControl.includes('no-store'), 'Must include no-store');
    assert.ok(cacheControl.includes('no-cache'), 'Must include no-cache');
    assert.ok(cacheControl.includes('must-revalidate'), 'Must include must-revalidate');

    const pragma = res.headers.get('pragma');
    assert.equal(pragma, 'no-cache');
  });

  await t.test('Public API: GET /api/website/home-banners/active returns sanitized image strings', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/website/home-banners/active`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 3);

    for (const banner of json.data) {
      assert.equal(typeof banner.desktopImage, 'string');
      assert.equal(typeof banner.mobileImage, 'string');
      // No untrimmed whitespace
      assert.equal(banner.desktopImage, banner.desktopImage.trim());
      assert.equal(banner.mobileImage, banner.mobileImage.trim());
    }

    // Verify slide 1 has dedicated mobile banner (4:5 ratio)
    const slide1 = json.data[0];
    assert.ok(slide1.mobileImage.length > 0, 'Slide 1 should have mobile image');
    assert.ok(slide1.desktopImage.length > 0, 'Slide 1 should have desktop image');

    // Verify slide 3 has no mobile banner (testing fallback)
    const slide3 = json.data[2];
    assert.equal(slide3.mobileImage, '', 'Slide 3 should have empty mobile image for fallback testing');
    assert.ok(slide3.desktopImage.length > 0, 'Slide 3 must have desktop image');
  });

  await t.test('Admin API: PUT /api/website/home-banners/:id updates mobile image & updates timestamp', async () => {
    const testTimestamp = new Date().toISOString();
    const updatePayload = {
      mobileImage: '/uploads/test-mobile-replaced-' + Date.now() + '.png'
    };

    const res = await fetch(`http://127.0.0.1:${testPort}/api/website/home-banners/banner_triphala`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updatePayload)
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.mobileImage, updatePayload.mobileImage);
    assert.ok(json.data.updatedAt >= testTimestamp);

    // Revert banner_triphala mobileImage back to empty for fallback testing
    await fetch(`http://127.0.0.1:${testPort}/api/website/home-banners/banner_triphala`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ mobileImage: '' })
    });
  });

  await t.test('Admin API: GET /api/website/home-banners also sends strict no-cache headers', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/website/home-banners`);
    assert.equal(res.status, 200);
    const cacheControl = res.headers.get('cache-control');
    assert.ok(cacheControl.includes('no-cache'));
  });
});
