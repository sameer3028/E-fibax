import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import legalRoutes, { sanitizeLegalHtml } from '../routes/legalRoutes.js';
import { generateAdminToken } from '../middleware/auth.js';
import { getSingleton, setSingleton } from '../store.js';

test('Legal Pages CMS End-to-End Test Suite', async (t) => {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api', legalRoutes);

  let server;
  let testPort;
  const adminToken = generateAdminToken('admin');
  const authHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  // Backup current legal_pages store to restore after tests
  const originalStore = JSON.parse(JSON.stringify(getSingleton('legal_pages') || {}));

  await t.test('Server starts and mounts legalRoutes', async () => {
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
    // Restore original legal pages state so tests leave zero persistent debris
    if (originalStore && (originalStore.terms || originalStore.privacy)) {
      setSingleton('legal_pages', originalStore);
    }
  });

  await t.test('1. Public API: GET /api/legal/terms returns 200, published status & cache headers', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/legal/terms`);
    assert.equal(res.status, 200);

    const cacheHeader = res.headers.get('cache-control');
    assert.ok(cacheHeader && cacheHeader.includes('max-age=60'));

    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data);
    assert.equal(json.data.slug, 'terms');
    assert.ok(json.data.content && json.data.content.length > 100);
    assert.ok(json.data.pageTitle);
    assert.ok(json.data.documentVersion);
  });

  await t.test('2. Public API: GET /api/legal/privacy returns 200, published status & full content', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/legal/privacy`);
    assert.equal(res.status, 200);

    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data);
    assert.equal(json.data.slug, 'privacy');
    assert.ok(json.data.content && json.data.content.length > 100);
  });

  await t.test('3. Public API: GET /api/legal/invalid returns 404', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/legal/invalid_slug`);
    assert.equal(res.status, 404);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  await t.test('4. Security: Unauthenticated access to /api/admin/legal/terms rejected with 401', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`);
    assert.equal(res.status, 401);
  });

  await t.test('5. Security: Unauthenticated PUT to /api/admin/legal/terms rejected with 401', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_draft', content: 'hacked' })
    });
    assert.equal(res.status, 401);
  });

  await t.test('6. Admin API: Authenticated GET /api/admin/legal/terms returns draft & history', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      headers: authHeaders
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.data);
    assert.ok(Array.isArray(json.data.history));
    assert.ok(json.data.draftContent);
    assert.ok(json.data.publishedContent);
  });

  await t.test('7. Draft Workflow: Saving draft does NOT affect public published endpoint', async () => {
    const draftPayload = {
      action: 'save_draft',
      pageTitle: 'Terms of Service (Work in Progress)',
      content: '<p>This is a confidential internal draft that must not be visible to public users.</p>',
      documentVersion: 'v2.5-draft'
    };

    const putRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(draftPayload)
    });
    assert.equal(putRes.status, 200);
    const putJson = await putRes.json();
    assert.equal(putJson.success, true);
    assert.equal(putJson.action, 'saved_draft');

    // Public endpoint MUST NOT show the draft content
    const pubRes = await fetch(`http://127.0.0.1:${testPort}/api/legal/terms`);
    assert.equal(pubRes.status, 200);
    const pubJson = await pubRes.json();
    assert.ok(!pubJson.data.content.includes('confidential internal draft'));

    // Admin preview endpoint MUST show the draft content
    const prevRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms/preview`, {
      headers: authHeaders
    });
    assert.equal(prevRes.status, 200);
    const prevJson = await prevRes.json();
    assert.ok(prevJson.data.content.includes('confidential internal draft'));
  });

  await t.test('8. Publishing Workflow: Publishing updates public endpoint and appends history', async () => {
    const publishPayload = {
      action: 'publish',
      pageTitle: 'Official Terms & Conditions (Updated)',
      content: '<h2>1. Updated Clause</h2><p>Official verified terms for our valued Ayurvedic customers.</p>',
      documentVersion: 'v2.5',
      lastUpdated: '14 November 2026'
    };

    const pubActionRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(publishPayload)
    });
    assert.equal(pubActionRes.status, 200);
    const pubActionJson = await pubActionRes.json();
    assert.equal(pubActionJson.success, true);
    assert.equal(pubActionJson.action, 'published');
    assert.ok(pubActionJson.data.history.length >= 1);

    // Public endpoint MUST reflect the published content immediately
    const pubCheckRes = await fetch(`http://127.0.0.1:${testPort}/api/legal/terms`);
    assert.equal(pubCheckRes.status, 200);
    const pubCheckJson = await pubCheckRes.json();
    assert.ok(pubCheckJson.data.content.includes('Official verified terms for our valued Ayurvedic customers.'));
    assert.equal(pubCheckJson.data.documentVersion, 'v2.5');
  });

  await t.test('9. XSS Sanitization: Malicious tags, iframes, inline event handlers are stripped', async () => {
    const dirtyHtml = `
      <h3>Safe Title</h3>
      <script>alert('xss')</script>
      <iframe src="https://evil.com"></iframe>
      <p onclick="stealCookies()" onmouseover="runBadCode()">Clean paragraph text</p>
      <a href="javascript:alert(1)">Click here</a>
    `;

    const clean = sanitizeLegalHtml(dirtyHtml);
    assert.ok(!clean.includes('<script>'), 'Script tag must be stripped');
    assert.ok(!clean.includes('alert('), 'Alert call must be stripped');
    assert.ok(!clean.includes('<iframe'), 'Iframe must be stripped');
    assert.ok(!clean.includes('onclick'), 'onclick handler must be stripped');
    assert.ok(!clean.includes('onmouseover'), 'onmouseover handler must be stripped');
    assert.ok(!clean.includes('javascript:'), 'javascript: URI must be sanitized');
    assert.ok(clean.includes('Clean paragraph text'), 'Safe text must be preserved');
  });

  await t.test('10. Unpublish Workflow: Unpublishing causes public endpoint to return unpublished status', async () => {
    const unpublishRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ action: 'unpublish' })
    });
    assert.equal(unpublishRes.status, 200);

    const pubRes = await fetch(`http://127.0.0.1:${testPort}/api/legal/terms`);
    assert.equal(pubRes.status, 200);
    const pubJson = await pubRes.json();
    assert.equal(pubJson.success, false);
    assert.equal(pubJson.status, 'unpublished');
    assert.ok(pubJson.message.includes('scheduled administrative review'));
  });

  await t.test('11. Revision History & Restore: 1-Click Restore recovers previous snapshot', async () => {
    // Re-publish with a test revision first
    await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        action: 'publish',
        pageTitle: 'Terms & Conditions Pre-Restore',
        content: '<p>Snapshot before accidental edit.</p>',
        documentVersion: 'v2.6'
      })
    });

    const getRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      headers: authHeaders
    });
    const getJson = await getRes.json();
    const history = getJson.data.history;
    assert.ok(history.length > 0);
    const snapshotToRestore = history[history.length - 1];

    // Restore that snapshot
    const restoreRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        action: 'restore_version',
        versionId: snapshotToRestore.id
      })
    });
    assert.equal(restoreRes.status, 200);
    const restoreJson = await restoreRes.json();
    assert.equal(restoreJson.success, true);
    assert.equal(restoreJson.action, 'restored');
  });

  await t.test('12. Independence: Terms & Privacy modifications remain completely decoupled', async () => {
    const privBefore = await (await fetch(`http://127.0.0.1:${testPort}/api/legal/privacy`)).json();
    assert.equal(privBefore.success, true);
    const initialPrivLength = privBefore.data.content.length;

    // Mutate terms
    await fetch(`http://127.0.0.1:${testPort}/api/admin/legal/terms`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        action: 'publish',
        pageTitle: 'Isolated Terms Test',
        content: '<p>Only terms modified.</p>',
        documentVersion: 'v3.0'
      })
    });

    // Verify privacy was NOT mutated in any way
    const privAfter = await (await fetch(`http://127.0.0.1:${testPort}/api/legal/privacy`)).json();
    assert.equal(privAfter.success, true);
    assert.equal(privAfter.data.content.length, initialPrivLength);
    assert.equal(privAfter.data.pageTitle, privBefore.data.pageTitle);
  });
});
