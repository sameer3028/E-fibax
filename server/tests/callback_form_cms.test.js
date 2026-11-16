import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import contentRoutes from '../routes/contentRoutes.js';
import { initStore, getArray } from '../store.js';
import { DATA_DIR } from '../config/paths.js';
import { generateAdminToken } from '../middleware/auth.js';

test('Doctor Callback Form CMS Test Suite', async (t) => {
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

  await t.test('1. Public API: GET /api/website/callback-form returns active config and no-cache headers', async () => {
    const res = await fetch(`${baseUrl}/api/website/callback-form`);
    assert.equal(res.status, 200);
    assert.ok(res.headers.get('cache-control')?.includes('no-cache'));

    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.enabled, true);
    assert.equal(body.status, 'active');
    assert.ok(body.data);
    assert.equal(body.data.header.heading, 'Request a Doctor Call Back');
    assert.ok(Array.isArray(body.data.fields));
    assert.equal(body.data.submitButton.text, 'Request Call Back Now');
    assert.ok(body.data.privacy.message.includes('100% private'));
  });

  await t.test('2. Security: Unauthenticated access to admin callback form endpoints is rejected with 401', async () => {
    const getRes = await fetch(`${baseUrl}/api/admin/website/callback-form`);
    assert.equal(getRes.status, 401);

    const putRes = await fetch(`${baseUrl}/api/admin/website/callback-form`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ header: { heading: 'Hacked Callback' } })
    });
    assert.equal(putRes.status, 401);
  });

  await t.test('3. Admin API: Authenticated GET /api/admin/website/callback-form returns full config', async () => {
    const res = await fetch(`${baseUrl}/api/admin/website/callback-form`, {
      headers: authHeaders
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data);
    assert.equal(body.data.header.badgeText, 'FREE AYURVEDIC CARE CALLBACK');
    assert.ok(body.data.fields.some(f => f.id === 'name' && f.required === true));
  });

  await t.test('4. Admin API: PUT updates header, field labels, dropdowns, custom fields, and button styling', async () => {
    const updatePayload = {
      header: {
        badgeText: 'INSTANT AYURVEDIC DOCTOR CONSULTATION',
        badgeIcon: 'sparkles',
        heading: 'Connect with a Senior Vaidya',
        description: 'Get tailored Ayurvedic herbal advice directly from certified experts within 15 minutes.',
        bgColor: '#0f3822',
        headingColor: '#fef08a',
        descriptionColor: '#e2e8f0',
        badgeBgColor: 'rgba(254, 240, 138, 0.2)',
        badgeTextColor: '#fef08a'
      },
      fields: [
        {
          id: 'name',
          name: 'name',
          type: 'text',
          label: 'Patient Full Name',
          placeholder: 'Enter patient name',
          required: true,
          enabled: true,
          system: true,
          order: 1
        },
        {
          id: 'phone',
          name: 'phone',
          type: 'tel',
          label: 'WhatsApp Mobile Number',
          placeholder: '10-digit mobile number',
          countryCode: '+91',
          required: true,
          enabled: true,
          system: true,
          order: 2
        },
        {
          id: 'concern',
          name: 'concern',
          type: 'select',
          label: 'Primary Health Area',
          placeholder: 'Select issue',
          required: true,
          enabled: true,
          system: true,
          order: 3,
          options: [
            'Joint & Pain Care',
            'Digestive & Gut Health',
            'Chronic Diabetes Support',
            'Immunity & Vitality'
          ]
        },
        {
          id: 'preferredTime',
          name: 'preferredTime',
          type: 'select',
          label: 'Preferred Discussion Slot',
          required: false,
          enabled: true,
          system: true,
          order: 4,
          options: [
            'Immediate (15-30 Mins)',
            'Today Evening (5-8 PM)',
            'Tomorrow Morning'
          ]
        },
        {
          id: 'custom_age',
          name: 'custom_age',
          type: 'number',
          label: 'Patient Age (Years)',
          placeholder: 'e.g. 45',
          required: false,
          enabled: true,
          system: false,
          order: 5
        },
        {
          id: 'notes',
          name: 'notes',
          type: 'textarea',
          label: 'Current Symptoms & Medications',
          placeholder: 'Describe duration, current medicines...',
          maxLength: 500,
          required: false,
          enabled: true,
          system: true,
          order: 6
        }
      ],
      submitButton: {
        text: 'Book Free Vaidya Call Now',
        icon: 'phone',
        bgColor: '#f97316',
        textColor: '#ffffff',
        enabled: true
      },
      privacy: {
        enabled: true,
        message: 'Your health records are strictly confidential under Indian medical guidelines.',
        textColor: '#4b5563',
        icon: 'shield'
      },
      design: {
        modalBgColor: '#ffffff',
        headerBgColor: '#0f3822',
        formBgColor: '#fcfbf7',
        borderRadius: '28px',
        desktopWidth: '540px',
        maxHeight: '92vh',
        inputBorderColor: '#cbd5e1',
        inputBgColor: '#ffffff',
        buttonBorderRadius: '14px'
      }
    };

    const res = await fetch(`${baseUrl}/api/admin/website/callback-form`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updatePayload)
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.header.heading, 'Connect with a Senior Vaidya');
    assert.equal(body.data.header.badgeText, 'INSTANT AYURVEDIC DOCTOR CONSULTATION');
    assert.equal(body.data.fields.length, 6);
    assert.ok(body.data.fields.some(f => f.id === 'custom_age'));
    assert.equal(body.data.submitButton.text, 'Book Free Vaidya Call Now');

    // Public endpoint verification
    const pubRes = await fetch(`${baseUrl}/api/website/callback-form`);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.data.header.heading, 'Connect with a Senior Vaidya');
    assert.equal(pubBody.data.submitButton.text, 'Book Free Vaidya Call Now');
  });

  await t.test('5. Pause Control: Pausing hides modal on public website while preserving admin settings', async () => {
    const pauseRes = await fetch(`${baseUrl}/api/admin/website/callback-form`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'paused', enabled: false })
    });
    assert.equal(pauseRes.status, 200);
    const pauseBody = await pauseRes.json();
    assert.equal(pauseBody.data.status, 'paused');
    assert.equal(pauseBody.data.enabled, false);

    // Public API returns paused with data: null
    const pubRes = await fetch(`${baseUrl}/api/website/callback-form`);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.enabled, false);
    assert.equal(pubBody.status, 'paused');
    assert.equal(pubBody.data, null);

    // Admin API still returns the full configuration
    const adminCheck = await fetch(`${baseUrl}/api/admin/website/callback-form`, { headers: authHeaders });
    const adminBody = await adminCheck.json();
    assert.equal(adminBody.data.status, 'paused');
    assert.equal(adminBody.data.header.heading, 'Connect with a Senior Vaidya');
  });

  await t.test('6. Reactivate Control: Reactivating restores public visibility', async () => {
    const activeRes = await fetch(`${baseUrl}/api/admin/website/callback-form`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: 'active', enabled: true })
    });
    assert.equal(activeRes.status, 200);
    const activeBody = await activeRes.json();
    assert.equal(activeBody.data.status, 'active');
    assert.equal(activeBody.data.enabled, true);

    const pubRes = await fetch(`${baseUrl}/api/website/callback-form`);
    const pubBody = await pubRes.json();
    assert.equal(pubBody.enabled, true);
    assert.equal(pubBody.status, 'active');
    assert.equal(pubBody.data.header.heading, 'Connect with a Senior Vaidya');
  });

  await t.test('7. Viewport Visibility Flags: showOnDesktop & showOnMobile persistence', async () => {
    const res = await fetch(`${baseUrl}/api/admin/website/callback-form`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ showOnDesktop: false, showOnMobile: true })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.showOnDesktop, false);
    assert.equal(body.data.showOnMobile, true);

    // Restore desktop visibility
    await fetch(`${baseUrl}/api/admin/website/callback-form`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ showOnDesktop: true, showOnMobile: true })
    });
  });

  await t.test('8. Safe Callback Submission: Submitting enquiry with dynamic fields logs safely', async () => {
    const initialEnquiriesCount = getArray('enquiries').length;

    const enquiryRes = await fetch(`${baseUrl}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Suresh Raina',
        phone: '9876543219',
        city: 'Kanpur, UP',
        experience: 'Callback Request - Joint & Pain Care',
        message: 'Preferred Slot: Immediate (15-30 Mins) | Notes: Mild knee stiffness for 2 weeks | Patient Age (Years): 38'
      })
    });

    assert.equal(enquiryRes.status, 201);
    const enquiryBody = await enquiryRes.json();
    assert.equal(enquiryBody.success, true);

    const currentEnquiries = getArray('enquiries');
    assert.equal(currentEnquiries.length, initialEnquiriesCount + 1);
    const logged = currentEnquiries.find(e => e.phone === '9876543219');
    assert.ok(logged);
    assert.equal(logged.name, 'Suresh Raina');
    assert.ok(logged.message.includes('Patient Age'));
  });

  await t.test('9. Existing Enquiries Preservation: Baseline customer enquiries remain intact', async () => {
    const enquiries = getArray('enquiries');
    assert.ok(enquiries.length >= 3);
    const rajesh = enquiries.find(e => e.name === 'Rajesh Sharma');
    assert.ok(rajesh, 'Existing enquiry for Rajesh Sharma must not be erased');
  });

  await t.test('10. Data Persistence: Verify callback_form.json in DATA_DIR persists configuration', async () => {
    const filePath = join(DATA_DIR, 'callback_form.json');
    assert.ok(existsSync(filePath));
    const diskContent = JSON.parse(readFileSync(filePath, 'utf8'));
    assert.equal(diskContent.header.heading, 'Connect with a Senior Vaidya');
    assert.equal(diskContent.submitButton.text, 'Book Free Vaidya Call Now');
  });

  server.close();
});
