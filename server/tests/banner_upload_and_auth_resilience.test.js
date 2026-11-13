import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer } from 'http';
import {
  generateAdminToken,
  getAdminSessionFromRequest,
  activeAdminSessions,
  requireAdminAuth
} from '../middleware/auth.js';
import contentRoutes from '../routes/contentRoutes.js';

test('Banner Upload & Admin Auth Resilience Suite', async (t) => {
  let server;
  let baseUrl;
  let validAdminToken;

  await t.test('Setup test server with contentRoutes', async () => {
    const app = express();
    app.use(express.json({ limit: '50mb' }));
    app.use('/api', contentRoutes);

    server = createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    assert.ok(port > 0, 'Test server must bind to random port');
  });

  await t.test('Admin token generation produces HMAC signed resilient token', () => {
    validAdminToken = generateAdminToken('admin');
    assert.ok(validAdminToken.startsWith('adm_'), 'Admin token must use resilient adm_ prefix');
    assert.ok(activeAdminSessions.has(validAdminToken), 'Admin session must be in active map');

    const mockReq = { headers: { authorization: `Bearer ${validAdminToken}` } };
    const session = getAdminSessionFromRequest(mockReq);
    assert.ok(session, 'Valid token must be verified');
    assert.equal(session.username, 'admin');
  });

  await t.test('Token survives in-memory map purge (simulating server restart / PM2 reload)', () => {
    // Purge in-memory Map completely
    activeAdminSessions.clear();
    assert.equal(activeAdminSessions.size, 0, 'In-memory map must be empty');

    // Verification must STILL succeed due to cryptographic HMAC stateless verification and disk backup
    const mockReq = { headers: { authorization: `Bearer ${validAdminToken}` } };
    const session = getAdminSessionFromRequest(mockReq);
    assert.ok(session, 'Token MUST verify even after memory map was cleared on server restart');
    assert.equal(session.username, 'admin');
  });

  await t.test('Tampered or forged tokens are strictly rejected', () => {
    const fakeToken = validAdminToken.slice(0, -6) + 'xxxxxx';
    const mockReq = { headers: { authorization: `Bearer ${fakeToken}` } };
    const session = getAdminSessionFromRequest(mockReq);
    assert.equal(session, null, 'Tampered token signature must fail verification');
  });

  await t.test('Admin API: PUT /api/website/home-banners/:id succeeds with valid Bearer token', async () => {
    const updatePayload = {
      title: 'Updated Multivitamin Hero Banner',
      desktopImage: '/banners/banner-multivitamin.jpg',
      mobileImage: '/banners/banner-multivitamin-mobile.png',
      heading: 'Natural Daily Nutrition'
    };

    const res = await fetch(`${baseUrl}/api/website/home-banners/banner_multivitamin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify(updatePayload)
    });

    assert.equal(res.status, 200, 'Must return HTTP 200 with valid admin token');
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.title, 'Updated Multivitamin Hero Banner');
  });

  await t.test('Admin API: PUT /api/website/home-banners/:id auto-persists base64 images into /uploads/', async () => {
    // 1x1 transparent PNG data URL
    const tinyBase64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAoptbAAAAAElFTkSuQmCC';

    const payload = {
      desktopImage: tinyBase64Png,
      mobileImage: tinyBase64Png
    };

    const res = await fetch(`${baseUrl}/api/website/home-banners/banner_multivitamin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    // Base64 must have been converted into static /uploads/ file path
    assert.ok(data.data.desktopImage.startsWith('/uploads/'), 'Base64 desktop image must be auto-saved to /uploads/');
    assert.ok(data.data.mobileImage.startsWith('/uploads/'), 'Base64 mobile image must be auto-saved to /uploads/');

    // Clean up temporary test files created by base64 auto-save
    try {
      const fs = await import('fs');
      const path = await import('path');
      const deskBase = path.basename(data.data.desktopImage);
      const mobBase = path.basename(data.data.mobileImage);
      [deskBase, mobBase].forEach(f => {
        ['server/uploads', 'client/public/uploads'].forEach(dir => {
          const p = path.join(process.cwd(), dir, f);
          if (fs.existsSync(p)) fs.unlinkSync(p);
        });
      });
    } catch (_) {}

    // Restore original clean images
    await fetch(`${baseUrl}/api/website/home-banners/banner_multivitamin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${validAdminToken}`
      },
      body: JSON.stringify({
        desktopImage: '/banners/banner-multivitamin.jpg',
        mobileImage: '/banners/banner-multivitamin-mobile.png'
      })
    });
  });

  await t.test('Admin API: Rejects unauthenticated requests with HTTP 401', async () => {
    const res = await fetch(`${baseUrl}/api/website/home-banners/banner_multivitamin`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
        // No Authorization header
      },
      body: JSON.stringify({ title: 'Hacked Banner' })
    });

    assert.equal(res.status, 401, 'Must reject request with HTTP 401');
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, 'Unauthorized: Admin authentication required.');
  });

  await t.test('Teardown test server', async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });
});
