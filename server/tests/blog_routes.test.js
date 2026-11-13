import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { initStore } from '../store.js';
import blogRoutes, {
  sanitizeBlogHtml,
  slugify,
  calculateReadTime,
  getBlogs
} from '../routes/blogRoutes.js';
import { generateAdminToken } from '../middleware/auth.js';

test('Blog System Unit & Integration Tests', async (t) => {
  await initStore();
  const initialBlogs = await getBlogs();

  const app = express();
  app.use(express.json());
  app.use('/api', blogRoutes);

  let server;
  let testPort;
  const adminToken = generateAdminToken('admin');
  const authHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  await t.test('Server starts and mounts blogRoutes', async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        testPort = server.address().port;
        resolve();
      });
    });
    assert.ok(testPort > 0);
  });

  await t.test('Utility: sanitizeBlogHtml strips malicious scripts and event handlers', () => {
    const dirty = '<h2>Header</h2><script>alert(1)</script><img src="x" onerror="evil()" /><a href="javascript:void(0)" target="_blank">Click</a>';
    const clean = sanitizeBlogHtml(dirty);
    assert.equal(clean.includes('<script>'), false);
    assert.equal(clean.includes('onerror='), false);
    assert.equal(clean.includes('javascript:'), false);
    assert.ok(clean.includes('<h2>Header</h2>'));
    assert.ok(clean.includes('rel="noopener noreferrer"'));
  });

  await t.test('Utility: slugify generates clean kebab-case URL slug', () => {
    assert.equal(slugify('5 Ayurvedic Herbs & Spices!'), '5-ayurvedic-herbs-and-spices');
    assert.ok(slugify('').startsWith('post-'));
  });

  await t.test('Utility: calculateReadTime estimates based on 200 WPM', () => {
    const text = new Array(400).fill('word').join(' ');
    assert.equal(calculateReadTime(text), '2 min read');
  });

  await t.test('Public API: GET /api/blogs returns published posts', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/blogs`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
    assert.ok(Array.isArray(data.categories));
  });

  await t.test('Public API: GET /api/blogs/categories returns active categories', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/blogs/categories`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.length >= 10);
    assert.ok(data.totalPosts > 0);
  });

  await t.test('Public API: GET /api/blogs/:slug returns single article', async () => {
    const published = initialBlogs.find(b => b.status === 'published');
    assert.ok(published, 'Should have at least one published blog');
    const res = await fetch(`http://127.0.0.1:${testPort}/api/blogs/${published.slug}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.title, published.title);
    assert.ok(Array.isArray(data.relatedPosts));
  });

  let createdPostId;

  await t.test('Admin API: POST /api/admin/blogs creates blog with sanitization & auto SEO', async () => {
    const payload = {
      title: 'Unit Test Ashwagandha Rejuvenation Protocol',
      category: 'Vitality & Stamina',
      tag: 'Test Protocol',
      excerpt: 'Clinical protocol testing unit verification.',
      content: '<p>Testing Ashwagandha root extract.</p><script>alert("xss")</script>',
      status: 'draft'
    };

    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload)
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.id);
    assert.equal(data.data.content.includes('<script>'), false);
    assert.ok(data.data.seo.canonicalUrl);
    createdPostId = data.data.id;
  });

  await t.test('Admin API: POST /api/admin/blogs/:id/duplicate creates draft copy', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/${createdPostId}/duplicate`, {
      method: 'POST',
      headers: authHeaders
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.data.title.includes('(Copy)'));
    assert.equal(data.data.status, 'draft');

    // Clean duplicate immediately
    const cleanRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/${data.data.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert.equal(cleanRes.status, 200);
    const cleanData = await cleanRes.json();
    assert.equal(cleanData.success, true);
  });

  await t.test('Admin API: POST /api/admin/blogs/:id/publish-toggle toggles status', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/${createdPostId}/publish-toggle`, {
      method: 'POST',
      headers: authHeaders
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.status, 'published');
  });

  await t.test('Admin API: Categories cascade safety check blocks deleting category in use', async () => {
    const catsRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/categories`, { headers: authHeaders });
    const catsData = await catsRes.json();
    const vitalityCat = catsData.data.find(c => c.name === 'Vitality & Stamina');

    const delRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/categories/${vitalityCat.id}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert.equal(delRes.status, 400);
    const delData = await delRes.json();
    assert.equal(delData.success, false);
    assert.ok(delData.error.includes('Cannot delete category'));
  });

  await t.test('Admin API: DELETE /api/admin/blogs/:id permanently deletes blog post', async () => {
    assert.ok(createdPostId, 'createdPostId should be present');
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/${createdPostId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.message.includes('deleted successfully'));

    // Verify it no longer exists
    const verifyRes = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/${createdPostId}`, {
      headers: authHeaders
    });
    assert.equal(verifyRes.status, 404);
  });

  await t.test('Admin API: DELETE /api/admin/blogs/:id returns 404 for non-existent ID', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/non_existent_id_999`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.error, 'Blog post not found');
  });

  await t.test('Admin API: DELETE /api/admin/blogs/:id rejects unauthorized requests with 401', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/admin/blogs/blog_1`, {
      method: 'DELETE'
    });
    assert.equal(res.status, 401);
  });

  await t.test('Teardown test server', async () => {
    if (server) {
      server.close();
    }
  });
});
