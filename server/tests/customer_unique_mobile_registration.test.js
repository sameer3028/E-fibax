import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';
import {
  normalizeIndianMobileNumber,
  isValidIndianMobileNumber,
  findUserByMobile,
  findUserByEmail,
  findUsersByIdentifier,
  auditDuplicateCustomers,
  registerCustomerAtomic
} from '../services/userService.js';
import customerAuthRoutes, { readUsers, saveUsers } from '../routes/customerAuthRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import { generateAdminToken } from '../middleware/auth.js';

test('Customer Registration Unique Mobile Numbers & Normalization Suite', async (t) => {
  // Setup standalone Express app for integration testing
  const app = express();
  app.use(express.json());
  app.use('/api/auth', customerAuthRoutes);
  app.use('/api/admin', adminRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  // --- Subtest 1: Indian Mobile Normalization Unit Tests ---
  await t.test('1. Normalizes Indian mobile numbers across all standard formats', () => {
    // Standard 10 digits
    assert.strictEqual(normalizeIndianMobileNumber('9876543210'), '9876543210');
    assert.strictEqual(normalizeIndianMobileNumber(9876543210), '9876543210');

    // +91 Country Code
    assert.strictEqual(normalizeIndianMobileNumber('+919876543210'), '9876543210');
    assert.strictEqual(normalizeIndianMobileNumber('+91 98765 43210'), '9876543210');
    assert.strictEqual(normalizeIndianMobileNumber('+91-98765-43210'), '9876543210');

    // 91 without +
    assert.strictEqual(normalizeIndianMobileNumber('919876543210'), '9876543210');

    // Leading trunk 0
    assert.strictEqual(normalizeIndianMobileNumber('09876543210'), '9876543210');
    assert.strictEqual(normalizeIndianMobileNumber('+91 09876543210'), '9876543210');

    // User example from prompt: 9056344458
    assert.strictEqual(normalizeIndianMobileNumber('9056344458'), '9056344458');
    assert.strictEqual(normalizeIndianMobileNumber('+919056344458'), '9056344458');
    assert.strictEqual(normalizeIndianMobileNumber('919056344458'), '9056344458');
    assert.strictEqual(normalizeIndianMobileNumber('09056344458'), '9056344458');

    // Valid starting digits (6, 7, 8, 9)
    assert.strictEqual(normalizeIndianMobileNumber('6123456789'), '6123456789');
    assert.strictEqual(normalizeIndianMobileNumber('7123456789'), '7123456789');
    assert.strictEqual(normalizeIndianMobileNumber('8123456789'), '8123456789');
    assert.strictEqual(normalizeIndianMobileNumber('9123456789'), '9123456789');

    // Invalids
    assert.strictEqual(normalizeIndianMobileNumber(''), null);
    assert.strictEqual(normalizeIndianMobileNumber(null), null);
    assert.strictEqual(normalizeIndianMobileNumber(undefined), null);
    assert.strictEqual(normalizeIndianMobileNumber('12345'), null, 'Too short');
    assert.strictEqual(normalizeIndianMobileNumber('1234567890'), null, 'Invalid leading digit 1');
    assert.strictEqual(normalizeIndianMobileNumber('5123456789'), null, 'Invalid leading digit 5');
    assert.strictEqual(normalizeIndianMobileNumber('abcdefghij'), null, 'Non-digits');
  });

  // --- Subtest 2: Registration Enforces Unique Mobile Numbers ---
  await t.test('2. Registration rejects duplicate mobile numbers across different formats and emails', async () => {
    // Seed clean state
    saveUsers([]);

    // Account 1: Register with 10 digits
    const res1 = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Account One',
        email: 'account.one@fibaxpharma.com',
        phone: '9056344458',
        password: 'password123'
      })
    });

    assert.strictEqual(res1.status, 201);
    const body1 = await res1.json();
    assert.strictEqual(body1.success, true);
    assert.strictEqual(body1.user.phone, '9056344458', 'Stored phone must be normalized 10 digits');

    // Account 2: Attempt duplicate with +91 format and different email
    const res2 = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Account Two',
        email: 'account.two@fibaxpharma.com',
        phone: '+919056344458',
        password: 'password123'
      })
    });

    assert.strictEqual(res2.status, 400);
    const body2 = await res2.json();
    assert.strictEqual(body2.success, false);
    assert.strictEqual(body2.error, 'This mobile number is already registered. Please sign in or use Forgot Password.');

    // Account 3: Attempt duplicate with 91 format
    const res3 = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Account Three',
        email: 'account.three@fibaxpharma.com',
        phone: '919056344458',
        password: 'password123'
      })
    });

    assert.strictEqual(res3.status, 400);
    const body3 = await res3.json();
    assert.strictEqual(body3.error, 'This mobile number is already registered. Please sign in or use Forgot Password.');

    // Account 4: Attempt duplicate with 0 trunk format
    const res4 = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Account Four',
        email: 'account.four@fibaxpharma.com',
        phone: '09056344458',
        password: 'password123'
      })
    });

    assert.strictEqual(res4.status, 400);
    const body4 = await res4.json();
    assert.strictEqual(body4.error, 'This mobile number is already registered. Please sign in or use Forgot Password.');
  });

  // --- Subtest 3: Email Uniqueness Preservation ---
  await t.test('3. Email uniqueness is strictly preserved alongside phone uniqueness', async () => {
    // Attempt to register with Account One's email but a brand new unique phone
    const resEmailDup = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Account New Phone Same Email',
        email: 'account.one@fibaxpharma.com',
        phone: '9888999999',
        password: 'password123'
      })
    });

    assert.strictEqual(resEmailDup.status, 400);
    const body = await resEmailDup.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /An account with this email address already exists/i);
  });

  // --- Subtest 4: Concurrency Protection (Race Condition Elimination) ---
  await t.test('4. Handles 10 concurrent registrations for same mobile number safely', async () => {
    const targetMobile = '9876500001';
    const emailPrefix = 'concurrent_test_';

    // 10 concurrent requests with varied mobile prefixes (+91, 91, 0, 10 digits)
    const phoneVariants = [
      targetMobile,
      `+91${targetMobile}`,
      `91${targetMobile}`,
      `0${targetMobile}`,
      `+91 ${targetMobile}`,
      targetMobile,
      `+91${targetMobile}`,
      `91${targetMobile}`,
      `0${targetMobile}`,
      targetMobile
    ];

    const requests = phoneVariants.map((phone, idx) => {
      return fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `192.168.1.${idx + 1}`
        },
        body: JSON.stringify({
          name: `Concurrent User ${idx + 1}`,
          email: `${emailPrefix}${idx + 1}@fibaxpharma.com`,
          phone,
          password: 'password123'
        })
      });
    });

    const responses = await Promise.all(requests);
    const results = await Promise.all(responses.map(r => r.json().then(data => ({ status: r.status, data }))));

    const successes = results.filter(r => r.status === 201);
    const rejections = results.filter(r => r.status === 400);

    assert.strictEqual(successes.length, 1, 'Exactly one concurrent registration must succeed');
    assert.strictEqual(rejections.length, 9, 'All 9 remaining concurrent attempts must be rejected');

    rejections.forEach(rej => {
      assert.strictEqual(
        rej.data.error,
        'This mobile number is already registered. Please sign in or use Forgot Password.'
      );
    });

    // Check storage layer: verify only 1 user exists for targetMobile
    const users = readUsers();
    const matches = users.filter(u => u.phone === targetMobile);
    assert.strictEqual(matches.length, 1, 'Database must contain exactly 1 account for this mobile number');
  });

  // --- Subtest 5: Login Parity (Email & All Phone Formats) ---
  await t.test('5. Customer can log in using email or any valid format of their mobile number', async () => {
    // 1. Login with exact registered 10-digit mobile
    const res1 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '9056344458', password: 'password123' })
    });
    assert.strictEqual(res1.status, 200);
    const data1 = await res1.json();
    assert.strictEqual(data1.success, true);
    assert.strictEqual(data1.user.email, 'account.one@fibaxpharma.com');

    // 2. Login with +91 format
    const res2 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '+919056344458', password: 'password123' })
    });
    assert.strictEqual(res2.status, 200);
    const data2 = await res2.json();
    assert.strictEqual(data2.success, true);

    // 3. Login with 91 format
    const res3 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '919056344458', password: 'password123' })
    });
    assert.strictEqual(res3.status, 200);

    // 4. Login with 0 trunk format
    const res4 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: '09056344458', password: 'password123' })
    });
    assert.strictEqual(res4.status, 200);

    // 5. Login with registered email
    const res5 = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'account.one@fibaxpharma.com', password: 'password123' })
    });
    assert.strictEqual(res5.status, 200);
  });

  // --- Subtest 6: Profile Update Mobile Uniqueness Guard ---
  await t.test('6. Profile update prevents a customer from taking an already registered mobile number', async () => {
    // Register Account B
    const resB = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Account B',
        email: 'account.b@fibaxpharma.com',
        phone: '9877777777',
        password: 'password123'
      })
    });
    assert.strictEqual(resB.status, 201);
    const { token } = await resB.json();

    // Account B tries to update phone to Account One's phone (+91 90563 44458)
    const resUpdate = await fetch(`${baseUrl}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ phone: '+91 90563 44458' })
    });

    assert.strictEqual(resUpdate.status, 400);
    const bodyUpdate = await resUpdate.json();
    assert.strictEqual(bodyUpdate.success, false);
    assert.strictEqual(
      bodyUpdate.error,
      'This mobile number is already registered. Please sign in or use Forgot Password.'
    );
  });

  // --- Subtest 7: Audit Duplicate Customers Read-Only Guarantee ---
  await t.test('7. Audit duplicate report correctly identifies duplicates without modifying accounts', () => {
    const syntheticUsers = [
      { id: 'USR-DUP-01', name: 'User 1', email: 'u1@test.com', phone: '9056344458', createdAt: '2026-01-01' },
      { id: 'USR-DUP-02', name: 'User 2', email: 'u2@test.com', phone: '+919056344458', createdAt: '2026-02-01' },
      { id: 'USR-UNI-03', name: 'User 3', email: 'u3@test.com', phone: '9876543210', createdAt: '2026-03-01' }
    ];

    const syntheticOrders = [
      { orderId: 'FBX-ORD-101', customer: { id: 'USR-DUP-01', email: 'u1@test.com' } },
      { orderId: 'FBX-ORD-102', customer: { id: 'USR-DUP-02', email: 'u2@test.com' } }
    ];

    const usersCopyBefore = JSON.stringify(syntheticUsers);
    const report = auditDuplicateCustomers(syntheticUsers, syntheticOrders);

    assert.strictEqual(report.totalUsers, 3);
    assert.strictEqual(report.duplicateGroupsCount, 1);
    assert.strictEqual(report.totalAffectedAccounts, 2);

    const group = report.duplicateGroups[0];
    assert.strictEqual(group.normalizedPhone, '9056344458');
    assert.strictEqual(group.duplicateCount, 2);
    assert.strictEqual(group.accounts[0].id, 'USR-DUP-02');
    assert.strictEqual(group.accounts[0].orderCount, 1);
    assert.strictEqual(group.accounts[1].id, 'USR-DUP-01');
    assert.strictEqual(group.accounts[1].orderCount, 1);

    // Assert that syntheticUsers was NOT mutated
    assert.strictEqual(JSON.stringify(syntheticUsers), usersCopyBefore, 'Audit must be 100% read-only');
  });
});
