import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'http';
import crypto from 'crypto';
import customerAuthRoutes, { forgotPasswordStore } from '../routes/customerAuthRoutes.js';
import { hashPassword, verifyPassword } from '../middleware/auth.js';
import { initStore, setArray, getArray } from '../store.js';
import { isSmtpConfigured } from '../services/emailService.js';
import {
  generateForgotPasswordOtpHtml,
  generateForgotPasswordOtpText
} from '../emailTemplates/forgotPasswordOtp.js';

test('Forgot Password Email OTP & Security Verification Suite', async (t) => {
  await initStore();

  const testUser = {
    id: 'user-forgot-test-01',
    name: 'Harpreet Singh',
    phone: '9888123456',
    email: 'harpreet.singh@fibaxpharma-test.com',
    salt: crypto.randomBytes(16).toString('hex'),
    passwordHash: '',
    createdAt: new Date().toISOString()
  };
  // Initial password: "InitialPassword@123"
  testUser.passwordHash = hashPassword('InitialPassword@123', testUser.salt);
  setArray('users', [testUser]);

  // Express test application
  const app = express();
  app.use(express.json());
  app.use('/api/auth', customerAuthRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/auth`;

  t.after(() => {
    server.close();
    forgotPasswordStore.clear();
  });

  // --- Subtest 1: Email Template Verification ---
  await t.test('1. Email templates render 6-digit OTP, security notices, and correct sender/reply-to details', () => {
    const html = generateForgotPasswordOtpHtml('Harpreet Singh', '849201', {
      replyToEmail: 'care@fibaxpharma.com'
    });
    assert.ok(html.includes('849201'), 'HTML template must contain the 6-digit OTP');
    assert.ok(html.includes('Harpreet Singh'), 'HTML template must contain customer name');
    assert.ok(html.includes('10 minutes'), 'HTML template must mention 10 minutes validity');
    assert.ok(html.includes('care@fibaxpharma.com'), 'HTML template must mention care@fibaxpharma.com');

    const text = generateForgotPasswordOtpText('Harpreet Singh', '849201', {
      replyToEmail: 'care@fibaxpharma.com'
    });
    assert.ok(text.includes('849201'), 'Text template must contain the 6-digit OTP');
    assert.ok(text.includes('care@fibaxpharma.com'), 'Text template must contain support email');
  });

  // --- Subtest 2: Input Validation on send-otp ---
  await t.test('2. POST /forgot-password/send-otp rejects empty, invalid, and unregistered emails', async () => {
    // Empty email
    const resEmpty = await fetch(`${baseUrl}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '' })
    });
    assert.strictEqual(resEmpty.status, 400);
    const bodyEmpty = await resEmpty.json();
    assert.strictEqual(bodyEmpty.success, false);

    // Invalid email format
    const resInvalid = await fetch(`${baseUrl}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail' })
    });
    assert.strictEqual(resInvalid.status, 400);

    // Unregistered email
    const resUnreg = await fetch(`${baseUrl}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent.user@fibaxpharma.com' })
    });
    assert.strictEqual(resUnreg.status, 404);
    const bodyUnreg = await resUnreg.json();
    assert.match(bodyUnreg.error, /No customer account found/i);
  });

  // --- Subtest 3: SMTP Unconfigured Guard (No fake success) ---
  await t.test('3. Unconfigured SMTP returns 503 and reports exact missing environment variables', async () => {
    const prevSim = process.env.TEST_SIMULATE_EMAIL;
    delete process.env.TEST_SIMULATE_EMAIL;

    const res = await fetch(`${baseUrl}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });

    assert.strictEqual(res.status, 503);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.notConfigured, true);
    assert.ok(Array.isArray(body.missing), 'Must provide missing environment variables array');
    assert.ok(body.missing.includes('SMTP_HOST'));
    assert.ok(body.missing.includes('SMTP_USER'));
    assert.ok(body.missing.includes('SMTP_PASSWORD'));

    process.env.TEST_SIMULATE_EMAIL = prevSim || 'true';
  });

  // --- Subtest 4: Successful OTP Generation & Security Guard ---
  await t.test('4. In simulation mode, 6-digit OTP is hashed and never returned in response', async () => {
    process.env.TEST_SIMULATE_EMAIL = 'true';
    forgotPasswordStore.clear();

    const res = await fetch(`${baseUrl}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.email, testUser.email.toLowerCase());
    assert.strictEqual(body.cooldownSeconds, 60);

    // Strict Security Audit: Plain OTP must NOT be in response payload
    assert.strictEqual(body.otp, undefined, 'Plain OTP must NOT be exposed in response');
    assert.strictEqual(body.testOtp, undefined, 'Plain OTP must NOT be exposed in response');

    // Stored record must be a cryptographic hash
    const record = forgotPasswordStore.get(testUser.email.toLowerCase());
    assert.ok(record, 'Record must exist in store');
    assert.ok(record.otpHash, 'Must have otpHash');
    assert.ok(record.otpSalt, 'Must have otpSalt');
    assert.strictEqual(record.attempts, 0, 'Initial attempts count must be 0');
    assert.ok(record.expiresAt > Date.now(), 'ExpiresAt must be in future');
  });

  // --- Subtest 5: 60-Second Cooldown Enforcement ---
  await t.test('5. Attempting to resend OTP within 60 seconds returns 429 Too Many Requests', async () => {
    const resCooldown = await fetch(`${baseUrl}/forgot-password/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email })
    });

    assert.strictEqual(resCooldown.status, 429);
    const body = await resCooldown.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.cooldownRemaining > 0, 'Must return remaining cooldown seconds');
    assert.match(body.error, /Please wait/i);
  });

  // --- Subtest 6: Invalid & Wrong OTP Handling with Attempt Counter ---
  await t.test('6. Wrong OTP increments attempt counter and enforces 5-attempt limit', async () => {
    // Malformed OTP format (non-6-digit)
    const resBadFormat = await fetch(`${baseUrl}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: '123' })
    });
    assert.strictEqual(resBadFormat.status, 400);

    // Wrong 6-digit OTP (attempts 1 to 4)
    for (let i = 1; i <= 4; i++) {
      const resWrong = await fetch(`${baseUrl}/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, otp: '000000' })
      });
      assert.strictEqual(resWrong.status, 400);
      const bodyWrong = await resWrong.json();
      assert.strictEqual(bodyWrong.success, false);
      assert.strictEqual(bodyWrong.attemptsLeft, 5 - i);
    }

    // 5th Wrong Attempt: must invalidate OTP completely
    const resFifthWrong = await fetch(`${baseUrl}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: '000000' })
    });
    assert.strictEqual(resFifthWrong.status, 400);
    const bodyFifth = await resFifthWrong.json();
    assert.strictEqual(bodyFifth.success, false);
    assert.strictEqual(bodyFifth.attemptsLeft, 0);
    assert.match(bodyFifth.error, /Maximum attempts exceeded/i);

    // Verify record was cleared from store
    const recordAfterBruteForce = forgotPasswordStore.get(testUser.email.toLowerCase());
    assert.strictEqual(recordAfterBruteForce, undefined, 'Record must be deleted after 5 failed attempts');
  });

  // --- Subtest 7: Expired OTP is Rejected ---
  await t.test('7. Expired OTP (> 10 minutes) is rejected and purged', async () => {
    // Seed expired record
    const otp = '654321';
    const otpSalt = crypto.randomBytes(16).toString('hex');
    const otpHash = crypto.createHmac('sha256', otpSalt).update(otp).digest('hex');

    forgotPasswordStore.set(testUser.email.toLowerCase(), {
      otpHash,
      otpSalt,
      expiresAt: Date.now() - 1000, // already expired
      lastSentAt: Date.now() - 70000,
      attempts: 0
    });

    const res = await fetch(`${baseUrl}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: '654321' })
    });
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.match(body.error, /expired/i);

    const recordAfter = forgotPasswordStore.get(testUser.email.toLowerCase());
    assert.strictEqual(recordAfter, undefined, 'Expired record must be purged');
  });

  // --- Subtest 8: Successful Verification & Single-Use Reset Token ---
  await t.test('8. Valid OTP verification produces a single-use resetToken and invalidates OTP', async () => {
    // Seed fresh valid OTP
    const validOtp = '789123';
    const otpSalt = crypto.randomBytes(16).toString('hex');
    const otpHash = crypto.createHmac('sha256', otpSalt).update(validOtp).digest('hex');

    forgotPasswordStore.set(testUser.email.toLowerCase(), {
      otpHash,
      otpSalt,
      expiresAt: Date.now() + 10 * 60 * 1000,
      lastSentAt: Date.now() - 70000,
      attempts: 0
    });

    const res = await fetch(`${baseUrl}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: validOtp })
    });
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.ok(body.resetToken, 'Must issue a resetToken');

    const resetToken = body.resetToken;

    // Verify OTP hash was cleared from store immediately (cannot be reused)
    const record = forgotPasswordStore.get(testUser.email.toLowerCase());
    assert.strictEqual(record.otpHash, null, 'OTP hash must be cleared upon successful verification');

    // Attempting to verify the exact same OTP again must be rejected
    const resReverify = await fetch(`${baseUrl}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, otp: validOtp })
    });
    assert.strictEqual(resReverify.status, 400);

    // --- Subtest 9: Reset Password Execution & Authentication Parity ---
    // Reject password < 6 characters
    const resShortPass = await fetch(`${baseUrl}/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        resetToken: resetToken,
        newPassword: '123'
      })
    });
    assert.strictEqual(resShortPass.status, 400);

    // Submit valid new password
    const newPassword = 'NewAyurvedaPassword@2026';
    const resReset = await fetch(`${baseUrl}/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        resetToken: resetToken,
        newPassword: newPassword
      })
    });
    assert.strictEqual(resReset.status, 200);
    const bodyReset = await resReset.json();
    assert.strictEqual(bodyReset.success, true);

    // Verify resetToken was consumed and purged (cannot be used again)
    const recordAfterReset = forgotPasswordStore.get(testUser.email.toLowerCase());
    assert.strictEqual(recordAfterReset, undefined, 'Reset session must be purged after use');

    // Verify re-attempting with the same reset token fails
    const resReuse = await fetch(`${baseUrl}/forgot-password/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        resetToken: resetToken,
        newPassword: 'AnotherPassword@999'
      })
    });
    assert.strictEqual(resReuse.status, 400);

    // Verify old password fails to log in
    const resOldLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        password: 'InitialPassword@123'
      })
    });
    assert.strictEqual(resOldLogin.status, 401);

    // Verify new password successfully logs in
    const resNewLogin = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testUser.email,
        password: newPassword
      })
    });
    assert.strictEqual(resNewLogin.status, 200);
    const bodyNewLogin = await resNewLogin.json();
    assert.strictEqual(bodyNewLogin.success, true);
    assert.ok(bodyNewLogin.token, 'Must return session token upon login');
    assert.strictEqual(bodyNewLogin.user.email, testUser.email.toLowerCase());
  });
});
