import test from 'node:test';
import assert from 'node:assert';
import {
  getDefaultConfig,
  readEmailConfig,
  isSmtpConfigured,
  verifySmtpConnection
} from '../services/emailService.js';

test('Hostinger SMTP Configuration & Environment Resolution Suite', async (t) => {
  const origEnv = { ...process.env };

  t.afterEach(() => {
    // Restore environment variables after each subtest
    for (const key of Object.keys(process.env)) {
      if (!(key in origEnv)) delete process.env[key];
    }
    Object.assign(process.env, origEnv);
  });

  await t.test('1. Environment variable mapping for Hostinger SMTP (Port 465 SSL)', () => {
    process.env.SMTP_HOST = 'smtp.hostinger.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_SECURE = 'true';
    process.env.SMTP_USER = 'info@fibaxpharma.com';
    process.env.MAIL_FROM_NAME = 'Fibax Ayurveda';
    process.env.MAIL_FROM_EMAIL = 'info@fibaxpharma.com';
    process.env.MAIL_REPLY_TO = 'care@fibaxpharma.com';

    const config = getDefaultConfig();

    assert.strictEqual(config.smtpHost, 'smtp.hostinger.com');
    assert.strictEqual(config.smtpPort, 465);
    assert.strictEqual(config.smtpSecure, true);
    assert.strictEqual(config.smtpUser, 'info@fibaxpharma.com');
    assert.strictEqual(config.senderName, 'Fibax Ayurveda');
    assert.strictEqual(config.senderEmail, 'info@fibaxpharma.com');
    assert.strictEqual(config.replyToEmail, 'care@fibaxpharma.com');
  });

  await t.test('2. Missing SMTP_PASSWORD reports notConfigured without throwing', async () => {
    process.env.SMTP_HOST = 'smtp.hostinger.com';
    process.env.SMTP_USER = 'info@fibaxpharma.com';
    delete process.env.SMTP_PASSWORD;

    assert.strictEqual(isSmtpConfigured(), false);

    const result = await verifySmtpConnection();
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.notConfigured, true);
    assert.ok(result.missing.includes('SMTP_PASSWORD'));
    assert.strictEqual(result.password, undefined, 'Password must never be returned');
  });

  await t.test('3. Fallback support for SMTP_FROM_* and MAIL_FROM_* naming conventions', () => {
    delete process.env.MAIL_FROM_NAME;
    delete process.env.MAIL_FROM_EMAIL;
    delete process.env.MAIL_REPLY_TO;

    process.env.SMTP_FROM_NAME = 'Fibax Ayurveda Alternative';
    process.env.SMTP_FROM_EMAIL = 'orders@fibaxpharma.com';
    process.env.SMTP_REPLY_TO = 'support@fibaxpharma.com';

    const config = getDefaultConfig();
    assert.strictEqual(config.senderName, 'Fibax Ayurveda Alternative');
    assert.strictEqual(config.senderEmail, 'orders@fibaxpharma.com');
    assert.strictEqual(config.replyToEmail, 'support@fibaxpharma.com');
  });
});
