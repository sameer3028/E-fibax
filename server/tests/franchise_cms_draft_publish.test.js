import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import franchiseRoutes from '../routes/franchiseRoutes.js';
import { generateAdminToken } from '../middleware/auth.js';
import { getFranchiseCmsFull, getDefaultFranchisePublishedConfig } from '../services/franchiseService.js';
import { initStore, setSingleton } from '../store.js';

test('PCD Franchise Draft & Publish CMS Suite', async (t) => {
  initStore();

  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use('/api', franchiseRoutes);

  let server;
  let baseUrl;
  let adminToken;
  let authHeaders;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      adminToken = generateAdminToken('superadmin');
      authHeaders = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      };
      resolve();
    });
  });

  t.after(async () => {
    // Reset CMS state to default after tests
    const def = getDefaultFranchisePublishedConfig();
    setSingleton('franchise_page_cms', {
      published: def,
      draft: JSON.parse(JSON.stringify(def)),
      history: []
    });
    await new Promise((resolve) => server.close(resolve));
  });

  await t.test('1. Security: Unauthenticated access to /api/admin/franchise/cms is rejected with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/franchise/cms`);
    assert.equal(res.status, 401);
  });

  await t.test('2. Authenticated GET /api/admin/franchise/cms returns published, draft, history, and isDraftDirty', async () => {
    const res = await fetch(`${baseUrl}/api/admin/franchise/cms`, { headers: authHeaders });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.published);
    assert.ok(body.draft);
    assert.ok(Array.isArray(body.history));
    assert.equal(typeof body.isDraftDirty, 'boolean');
    assert.ok(body.published.pageContent.heading);
  });

  await t.test('3. Draft Isolation: PUT /api/admin/franchise/cms/draft updates draft WITHOUT affecting public endpoint', async () => {
    const draftUpdate = {
      pageContent: {
        heading: 'Brand New Draft Franchise Title',
        subtitle: 'Draft Subtitle For Preview'
      }
    };

    const res = await fetch(`${baseUrl}/api/admin/franchise/cms/draft`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(draftUpdate)
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.isDraftDirty, true);
    assert.equal(body.draft.hero.heading, 'Brand New Draft Franchise Title');

    // Public website endpoint MUST remain on published content!
    const publicRes = await fetch(`${baseUrl}/api/franchise/content`);
    const publicBody = await publicRes.json();
    assert.equal(publicBody.success, true);
    assert.notEqual(publicBody.data.hero.heading, 'Brand New Draft Franchise Title');
    assert.equal(publicBody.data.hero.heading, 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda');

    // Preview mode endpoint returns the draft!
    const draftPreviewRes = await fetch(`${baseUrl}/api/franchise/content?mode=draft`);
    const draftPreviewBody = await draftPreviewRes.json();
    assert.equal(draftPreviewBody.data.hero.heading, 'Brand New Draft Franchise Title');
  });

  await t.test('4. Publish Workflow: POST /api/admin/franchise/cms/publish promotes draft to live public website', async () => {
    const publishRes = await fetch(`${baseUrl}/api/admin/franchise/cms/publish`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ summary: 'Automated test publication' })
    });

    assert.equal(publishRes.status, 200);
    const publishBody = await publishRes.json();
    assert.equal(publishBody.success, true);
    assert.equal(publishBody.isDraftDirty, false);
    assert.equal(publishBody.published.hero.heading, 'Brand New Draft Franchise Title');

    // Now public website immediately serves the published update!
    const liveRes = await fetch(`${baseUrl}/api/franchise/content`);
    const liveBody = await liveRes.json();
    assert.equal(liveBody.data.hero.heading, 'Brand New Draft Franchise Title');
  });

  await t.test('5. Revert Workflow: POST /api/admin/franchise/cms/revert discards draft changes', async () => {
    // Edit draft again
    await fetch(`${baseUrl}/api/admin/franchise/cms/draft`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        pageContent: { heading: 'Unwanted Experimental Draft Title' }
      })
    });

    // Revert draft
    const revertRes = await fetch(`${baseUrl}/api/admin/franchise/cms/revert`, {
      method: 'POST',
      headers: authHeaders
    });

    assert.equal(revertRes.status, 200);
    const revertBody = await revertRes.json();
    assert.equal(revertBody.success, true);
    assert.equal(revertBody.isDraftDirty, false);
    assert.equal(revertBody.draft.hero.heading, 'Brand New Draft Franchise Title');
  });

  await t.test('6. Image Upload: POST /api/admin/franchise/upload-image validates and stores secure media', async () => {
    // 1x1 transparent PNG base64
    const pngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const uploadRes = await fetch(`${baseUrl}/api/admin/franchise/upload-image`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        image: pngBase64,
        filename: 'franchise_hero_test.png'
      })
    });

    assert.equal(uploadRes.status, 200);
    const uploadBody = await uploadRes.json();
    assert.equal(uploadBody.success, true);
    assert.match(uploadBody.url, /^\/uploads\/franchise-franchise_hero_test/);
  });
});
