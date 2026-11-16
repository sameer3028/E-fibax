import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import contentRoutes from '../routes/contentRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import { initStore, getArray, setArray, readJsonFile } from '../store.js';
import { DATA_DIR } from '../config/paths.js';
import { generateAdminToken } from '../middleware/auth.js';

test('Doctor Callback Requests Admin Management Test Suite', async (t) => {
  await initStore();

  const app = express();
  app.use(express.json());
  app.use('/api', contentRoutes);
  app.use('/api/admin', adminRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const adminToken = generateAdminToken('admin');
  const authHeaders = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  let testEnquiryId = null;

  await t.test('1. Security: GET /api/admin/enquiries rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/enquiries`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
  });

  await t.test('2. Public Storefront Submission: POST /api/enquiry saves full callback details', async () => {
    const payload = {
      name: 'Virender Sehwag',
      phone: '9876512345',
      city: 'Najafgarh, Delhi',
      type: 'doctor_callback',
      concern: 'Joint & Pain Care',
      preferredTime: 'Morning (10:00 AM - 1:00 PM)',
      notes: 'Experiencing chronic knee pain during morning walks. Please recommend herbal oils or churnas.'
    };

    const res = await fetch(`${baseUrl}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.id, 'Expected returned enquiry id');
    testEnquiryId = body.id;
  });

  await t.test('3. Admin API: GET /api/admin/enquiries returns normalized records and correct counts', async () => {
    const res = await fetch(`${baseUrl}/api/admin/enquiries`, {
      headers: authHeaders
    });

    assert.equal(res.status, 200);
    const cacheControl = res.headers.get('cache-control');
    assert.ok(cacheControl && cacheControl.includes('no-store'), 'Strict no-cache headers must be present');

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.count > 0, 'Total count must be > 0');
    assert.ok(body.newCount > 0, 'New count must be > 0');
    assert.ok(Array.isArray(body.data), 'Data must be an array');

    const created = body.data.find((e) => e.id === testEnquiryId || e.phone === '9876512345');
    assert.ok(created, 'Submitted callback request must appear in admin enquiries list');
    assert.equal(created.name, 'Virender Sehwag');
    assert.equal(created.city, 'Najafgarh, Delhi');
    assert.ok(created.concern.includes('Joint'), 'Concern must contain Joint');
    assert.equal(created.preferredTime, 'Morning (10:00 AM - 1:00 PM)');
    assert.ok(created.notes.includes('knee pain'));
    assert.equal(created.status, 'New');
  });

  await t.test('4. Security: PUT /api/admin/enquiries/:id rejects unauthenticated requests with 401', async () => {
    const res = await fetch(`${baseUrl}/api/admin/enquiries/${testEnquiryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Contacted' })
    });
    assert.equal(res.status, 401);
  });

  await t.test('5. Validation: PUT /api/admin/enquiries/:id rejects invalid status values with 400', async () => {
    const res = await fetch(`${baseUrl}/api/admin/enquiries/${testEnquiryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'BogusStatus' })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.includes('Invalid status'));
  });

  await t.test('6. Status Management: PUT /api/admin/enquiries/:id updates status to Contacted', async () => {
    const res = await fetch(`${baseUrl}/api/admin/enquiries/${testEnquiryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'Contacted' })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'Contacted');
  });

  await t.test('7. Admin Follow-up Notes: PUT /api/admin/enquiries/:id updates follow-up notes', async () => {
    const noteText = 'Called customer at 10:30 AM. Suggested Arth-Amrit Oil and Pain Care Vati. Patient agreed to place order.';
    const res = await fetch(`${baseUrl}/api/admin/enquiries/${testEnquiryId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Completed',
        followUpNotes: noteText
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'Completed');
    assert.equal(body.data.followUpNotes, noteText);

    // Verify subsequent GET reflects updated status and notes
    const getRes = await fetch(`${baseUrl}/api/admin/enquiries`, {
      headers: authHeaders
    });
    const getBody = await getRes.json();
    const updated = getBody.data.find((e) => e.id === testEnquiryId);
    assert.equal(updated.status, 'Completed');
    assert.equal(updated.followUpNotes, noteText);
  });

  await t.test('8. Orders Isolation: Callback enquiries are NOT mixed with orders.json', async () => {
    const orders = getArray('orders');
    const callbackInOrders = orders.find(
      (o) => o.id === testEnquiryId || o.customer?.phone === '9876512345' || o.phone === '9876512345'
    );
    assert.equal(callbackInOrders, undefined, 'Callback submissions must never pollute orders.json');
  });

  await t.test('9. Data Persistence: Enquiry survives and persists in disk storage', async () => {
    const filePath = join(DATA_DIR, 'enquiries.json');
    assert.ok(existsSync(filePath), 'enquiries.json file must exist in DATA_DIR');
    const diskEnquiries = JSON.parse(readFileSync(filePath, 'utf8'));
    const persisted = diskEnquiries.find((e) => e.id === testEnquiryId);
    assert.ok(persisted, 'Enquiry record must persist in storage on disk');
    assert.equal(persisted.name, 'Virender Sehwag');
    assert.equal(persisted.status, 'Completed');
  });

  await t.test('10. Baseline Enquiries Preservation: Existing customer enquiries remain intact', async () => {
    const enquiries = getArray('enquiries');
    const baseline = enquiries.find((e) => e.name && e.name.includes('Rajesh Sharma'));
    assert.ok(baseline, 'Baseline enquiry (Rajesh Sharma) must remain preserved');
  });

  server.close();
});
