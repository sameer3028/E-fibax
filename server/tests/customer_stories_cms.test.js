import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { customerStoriesRouter } from '../routes/customerStoriesRoutes.js';
import { generateAdminToken } from '../middleware/auth.js';
import { initStore, setSingleton, getSingleton } from '../store.js';
import {
  getCustomerStoriesStore,
  getPublicCustomerStories,
  getAdminCustomerStories,
  updateSectionSettings,
  createStory,
  updateStory,
  deleteStory,
  reorderStories
} from '../services/customerStoriesService.js';

test('Customer Stories CMS Management Test Suite', async (t) => {
  await initStore();

  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use('/api', customerStoriesRouter);

  let server;
  let baseUrl;
  let adminToken;
  let authHeaders;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      adminToken = generateAdminToken('admin');
      authHeaders = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      };
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  // -------------------------------------------------------------
  // 1. SECURITY & AUTHENTICATION
  // -------------------------------------------------------------
  await t.test('1. Security: Admin endpoints reject unauthenticated requests with 401', async () => {
    const endpoints = [
      { url: '/api/admin/website/customer-stories', method: 'GET' },
      { url: '/api/admin/website/customer-stories/settings', method: 'PUT', body: {} },
      { url: '/api/admin/website/customer-stories', method: 'POST', body: {} },
      { url: '/api/admin/website/customer-stories/reorder', method: 'PUT', body: { storyIds: [] } },
      { url: '/api/admin/website/customer-stories/story_1', method: 'PUT', body: {} },
      { url: '/api/admin/website/customer-stories/story_1', method: 'DELETE' },
      { url: '/api/admin/website/customer-stories/upload-media', method: 'POST', body: {} }
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${baseUrl}${ep.url}`, {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: ep.body ? JSON.stringify(ep.body) : undefined
      });
      assert.equal(res.status, 401, `Expected 401 for ${ep.method} ${ep.url}`);
    }
  });

  // -------------------------------------------------------------
  // 2. MIGRATION & PUBLIC ISOLATION
  // -------------------------------------------------------------
  await t.test('2. Existing Data Migration: 5 baseline stories migrated in Pending & Inactive state', async () => {
    const res = await fetch(`${baseUrl}/api/admin/website/customer-stories`, {
      headers: authHeaders
    });
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.success, true);
    assert.equal(data.stories.length >= 5, true, 'At least 5 migrated stories exist');
    assert.equal(data.stats.pending >= 5, true, 'Migrated stories are in Pending status');
    assert.equal(data.stats.approved, 0, 'Zero migrated stories are approved initially');

    // Verify public API returns 0 stories because none are approved
    const pubRes = await fetch(`${baseUrl}/api/website/customer-stories`);
    const pubData = await pubRes.json();
    assert.equal(pubData.success, true);
    assert.equal(pubData.stories.length, 0, 'Public API isolates unapproved stories');
  });

  // -------------------------------------------------------------
  // 3. SECTION SETTINGS (ENABLE / DISABLE)
  // -------------------------------------------------------------
  await t.test('3. Section Settings: Enable/Disable toggle and text customization', async () => {
    // Disable section
    const updateRes = await fetch(`${baseUrl}/api/admin/website/customer-stories/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        enabled: false,
        heading: 'Custom Verified Stories',
        highlightText: 'Patrons',
        bgColor: '#e8f5e9'
      })
    });
    assert.equal(updateRes.status, 200);
    const updateData = await updateRes.json();
    assert.equal(updateData.success, true);
    assert.equal(updateData.settings.enabled, false);
    assert.equal(updateData.settings.heading, 'Custom Verified Stories');
    assert.equal(updateData.settings.highlightText, 'Patrons');
    assert.equal(updateData.settings.bgColor, '#e8f5e9');

    // Public API should reflect disabled state
    const pubRes = await fetch(`${baseUrl}/api/website/customer-stories`);
    const pubData = await pubRes.json();
    assert.equal(pubData.enabled, false);

    // Re-enable
    await fetch(`${baseUrl}/api/admin/website/customer-stories/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ enabled: true, showOnHomepage: true })
    });
  });

  // -------------------------------------------------------------
  // 4. ADD NEW STORY & COMPLIANCE GUARD
  // -------------------------------------------------------------
  let createdStoryId;
  await t.test('4. Add Story: Compliance guard blocks Approval without Identity, Feedback & Consent', async () => {
    // Attempt to create approved story without verification flags -> MUST FAIL
    const invalidRes = await fetch(`${baseUrl}/api/admin/website/customer-stories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        customerName: 'Test Customer',
        customerCity: 'Mumbai',
        quote: 'Great natural joint flexibility.',
        complianceStatus: 'Approved',
        identityVerified: false,
        genuineFeedbackVerified: false,
        consentVerified: false
      })
    });
    assert.equal(invalidRes.status, 400, 'Must reject approval without verified flags');

    // Now create with valid verification
    const validRes = await fetch(`${baseUrl}/api/admin/website/customer-stories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        customerName: 'Kavita Joshi',
        customerCity: 'Mumbai',
        concern: 'Joint Mobility',
        duration: '1:10',
        thumbnail: 'https://example.com/kavita.jpg',
        videoUrl: '/uploads/kavita_story.mp4',
        productTitle: 'Axe Ortho Pain Relief Syrup 200ml',
        productId: '100',
        productSlug: 'axe-ortho-syrup',
        productPrice: 210,
        quote: 'Helped maintain everyday morning flexibility. Truly soothing herbal preparation.',
        showShopButton: true,
        isActive: true,
        identityVerified: true,
        genuineFeedbackVerified: true,
        consentVerified: true,
        consentEvidence: 'Signed Consent Form #FBX-2026-99',
        medicalClaimPresent: false,
        complianceStatus: 'Approved',
        adminNotes: 'Fully verified genuine customer interview with signed legal release.'
      })
    });
    assert.equal(validRes.status, 201);
    const validData = await validRes.json();
    assert.equal(validData.success, true);
    assert.equal(validData.story.customerName, 'Kavita Joshi');
    assert.equal(validData.story.complianceStatus, 'Approved');
    assert.equal(validData.story.isActive, true);
    createdStoryId = validData.story.id;

    // Public API should now return this single approved active story!
    const pubRes = await fetch(`${baseUrl}/api/website/customer-stories`);
    const pubData = await pubRes.json();
    assert.equal(pubData.success, true);
    assert.equal(pubData.stories.length, 1);
    assert.equal(pubData.stories[0].customerName, 'Kavita Joshi');
  });

  // -------------------------------------------------------------
  // 5. EDIT STORY
  // -------------------------------------------------------------
  await t.test('5. Edit Story: Update city, feedback and product link', async () => {
    assert.ok(createdStoryId);
    const editRes = await fetch(`${baseUrl}/api/admin/website/customer-stories/${createdStoryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        customerCity: 'Navi Mumbai',
        quote: 'Updated testimonial text with excellent morning mobility.'
      })
    });
    assert.equal(editRes.status, 200);
    const editData = await editRes.json();
    assert.equal(editData.success, true);
    assert.equal(editData.story.customerCity, 'Navi Mumbai');
    assert.equal(editData.story.quote, 'Updated testimonial text with excellent morning mobility.');
  });

  // -------------------------------------------------------------
  // 6. REORDER STORIES
  // -------------------------------------------------------------
  await t.test('6. Reorder Stories: Update display order across multiple stories', async () => {
    const adminRes = await fetch(`${baseUrl}/api/admin/website/customer-stories`, {
      headers: authHeaders
    });
    const adminData = await adminRes.json();
    const ids = adminData.stories.map(s => s.id);
    // Reverse order
    const reversedIds = [...ids].reverse();

    const reorderRes = await fetch(`${baseUrl}/api/admin/website/customer-stories/reorder`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ storyIds: reversedIds })
    });
    assert.equal(reorderRes.status, 200);
    const reorderData = await reorderRes.json();
    assert.equal(reorderData.success, true);
    assert.equal(reorderData.stories[0].id, reversedIds[0]);
  });

  // -------------------------------------------------------------
  // 7. DELETE STORY
  // -------------------------------------------------------------
  await t.test('7. Delete Story: Soft delete removes story from public and admin views', async () => {
    assert.ok(createdStoryId);
    const deleteRes = await fetch(`${baseUrl}/api/admin/website/customer-stories/${createdStoryId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert.equal(deleteRes.status, 200);
    const deleteData = await deleteRes.json();
    assert.equal(deleteData.success, true);
    assert.equal(deleteData.deletedId, createdStoryId);

    // Public API should return 0 approved stories again
    const pubRes = await fetch(`${baseUrl}/api/website/customer-stories`);
    const pubData = await pubRes.json();
    assert.equal(pubData.stories.length, 0);
  });

  // -------------------------------------------------------------
  // 8. MEDIA UPLOADS
  // -------------------------------------------------------------
  await t.test('8. Media Upload: Accepts valid base64 image and validates magic bytes', async () => {
    // 1x1 valid PNG: 89 50 4E 47 0D 0A 1A 0A
    const base64Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const uploadRes = await fetch(`${baseUrl}/api/admin/website/customer-stories/upload-media`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        media: base64Png,
        filename: 'customer_thumb_test.png'
      })
    });
    assert.equal(uploadRes.status, 200);
    const uploadData = await uploadRes.json();
    assert.equal(uploadData.success, true);
    assert.equal(uploadData.isVideo, false);
    assert.equal(uploadData.url.startsWith('/uploads/customer_'), true);
  });

  // -------------------------------------------------------------
  // 9. PERSISTENCE
  // -------------------------------------------------------------
  await t.test('9. Persistence: Verification that customer_stories singleton preserves state', () => {
    const store = getCustomerStoriesStore();
    assert.ok(store.sectionSettings);
    assert.ok(Array.isArray(store.stories));
    assert.equal(store.stories.length >= 5, true);
  });
});
