import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import franchiseRoutes from '../routes/franchiseRoutes.js';
import { initStore, getArray, setArray } from '../store.js';
import { generateAdminToken, getAdminConfig } from '../middleware/auth.js';

test('PCD Pharma Franchise Suite', async (t) => {
  await initStore();

  const app = express();
  app.use(express.json());
  app.use('/api', franchiseRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  getAdminConfig();
  const adminToken = generateAdminToken('admin');
  const authHeaders = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  // Reset franchise leads collection
  setArray('franchise_leads', []);

  await t.test('1. Public: GET /api/franchise/content returns complete CMS configuration', async () => {
    const res = await fetch(`${baseUrl}/api/franchise/content`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.hero);
    assert.equal(body.data.hero.heading, 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda');
    assert.ok(Array.isArray(body.data.benefits));
    assert.equal(body.data.benefits.length, 6);
    assert.ok(Array.isArray(body.data.processSteps));
    assert.equal(body.data.processSteps.length, 5);
    assert.ok(Array.isArray(body.data.faqs));
    assert.ok(body.data.faqs.length >= 6);
  });

  await t.test('2. Public: POST /api/franchise/enquiry validates mandatory consent checkbox', async () => {
    const invalidPayload = {
      name: 'Rohan Verma',
      phone: '9876543210',
      email: 'rohan@example.com',
      state: 'Punjab',
      city: 'Ludhiana',
      consent: false
    };
    const res = await fetch(`${baseUrl}/api/franchise/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /consent|agree/i);
  });

  await t.test('3. Public: POST /api/franchise/enquiry validates Indian mobile number normalization', async () => {
    const invalidPhone = {
      name: 'Rohan Verma',
      phone: '12345',
      email: 'rohan@example.com',
      state: 'Punjab',
      city: 'Ludhiana',
      consent: true
    };
    const res = await fetch(`${baseUrl}/api/franchise/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPhone)
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.error, /10-digit Indian mobile/i);
  });

  await t.test('4. Public: POST /api/franchise/enquiry succeeds with normalized phone and generates Lead ID', async () => {
    const validLead = {
      name: 'Vikramjit Singh',
      phone: '+91 98765 43210',
      whatsapp: '9876543210',
      sameAsMobile: true,
      email: 'vikramjit@pharma-distributors.in',
      state: 'Punjab',
      city: 'Amritsar',
      businessType: 'Pharma Distributor',
      experience: '5 to 10 years',
      investmentRange: '₹1,00,000 - ₹2,50,000',
      message: 'Looking for exclusive franchise rights for Amritsar district.',
      consent: true
    };

    const res = await fetch(`${baseUrl}/api/franchise/enquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.10.5'
      },
      body: JSON.stringify(validLead)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.leadId);
    assert.match(body.leadId, /^FBX-PCD-/);
    assert.equal(body.lead.phone, '9876543210');
    assert.equal(body.lead.city, 'Amritsar');
    assert.equal(body.lead.state, 'Punjab');
    assert.equal(body.lead.status, 'New');

    // Verify storage persistence
    const stored = getArray('franchise_leads');
    assert.equal(stored.length, 1);
    assert.equal(stored[0].id, body.leadId);
  });

  await t.test('5. Anti-Spam: Duplicate submission within 10 minutes returns existing lead safely', async () => {
    const duplicateSubmission = {
      name: 'Vikramjit Singh',
      phone: '9876543210',
      email: 'vikramjit@pharma-distributors.in',
      state: 'Punjab',
      city: 'Amritsar',
      consent: true
    };

    const res = await fetch(`${baseUrl}/api/franchise/enquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '192.168.10.5'
      },
      body: JSON.stringify(duplicateSubmission)
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.isDuplicate, true);

    // Verify no duplicate record created in storage
    const stored = getArray('franchise_leads');
    assert.equal(stored.length, 1);
  });

  await t.test('6. Security: Admin GET /api/admin/franchise/leads rejects unauthenticated callers', async () => {
    const res = await fetch(`${baseUrl}/api/admin/franchise/leads`);
    assert.equal(res.status, 401);
  });

  await t.test('7. Admin: GET /api/admin/franchise/leads returns list and stats with valid Bearer token', async () => {
    const res = await fetch(`${baseUrl}/api/admin/franchise/leads`, {
      headers: authHeaders
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.stats);
    assert.equal(body.stats.total, 1);
    assert.equal(body.stats.newCount, 1);
    assert.ok(Array.isArray(body.leads));
    assert.equal(body.leads[0].city, 'Amritsar');
  });

  await t.test('8. Admin: PUT /api/admin/franchise/leads/:id updates status, staff, and notes', async () => {
    const stored = getArray('franchise_leads');
    const leadId = stored[0].id;

    const updates = {
      status: 'Contacted',
      assignedStaff: 'Harpreet Singh (North BDM)',
      followUpDate: '2026-11-25',
      newNote: 'Spoke with client. Very interested in Syrup & Capsule lines. Meeting set for next Tuesday.'
    };

    const res = await fetch(`${baseUrl}/api/admin/franchise/leads/${leadId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updates)
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.lead.status, 'Contacted');
    assert.equal(body.lead.assignedStaff, 'Harpreet Singh (North BDM)');
    assert.equal(body.lead.followUpDate, '2026-11-25');
    assert.ok(body.lead.internalNotes.length >= 2);
    assert.match(body.lead.internalNotes[0].text, /Syrup & Capsule lines/);
  });

  await t.test('9. Admin: GET /api/admin/franchise/leads/export/csv exports clean CSV with headers', async () => {
    const res = await fetch(`${baseUrl}/api/admin/franchise/leads/export/csv`, {
      headers: authHeaders
    });

    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/csv/);
    const text = await res.text();
    assert.ok(text.includes('Lead ID'));
    assert.ok(text.includes('Vikramjit Singh'));
    assert.ok(text.includes('Amritsar'));
  });

  await t.test('10. Admin: PUT /api/admin/franchise/content saves editable CMS configuration', async () => {
    const newSettings = {
      hero: {
        heading: 'Become a Fibax Ayurveda Franchise Partner',
        subtitle: 'Leading Ayurvedic PCD opportunities across Northern India.'
      },
      isActive: true
    };

    const res = await fetch(`${baseUrl}/api/admin/franchise/content`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(newSettings)
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.hero.heading, 'Become a Fibax Ayurveda Franchise Partner');

    // Verify public endpoint reflects updated content
    const publicRes = await fetch(`${baseUrl}/api/franchise/content`);
    const publicBody = await publicRes.json();
    assert.equal(publicBody.data.hero.heading, 'Become a Fibax Ayurveda Franchise Partner');

    // Restore original CMS content so default remains intact
    await fetch(`${baseUrl}/api/admin/franchise/content`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        hero: {
          heading: 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda',
          subtitle: 'Explore PCD Pharma Franchise opportunities with a growing Ayurvedic product portfolio and dedicated business support.'
        },
        isActive: true
      })
    });
  });

  await t.test('11. Admin: DELETE /api/admin/franchise/leads/:id deletes lead cleanly', async () => {
    const stored = getArray('franchise_leads');
    const leadId = stored[0].id;

    const res = await fetch(`${baseUrl}/api/admin/franchise/leads/${leadId}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.deletedLeadId, leadId);

    const postDelete = getArray('franchise_leads');
    assert.equal(postDelete.length, 0);
  });

  await new Promise((resolve) => server.close(resolve));
});
