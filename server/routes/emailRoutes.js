import { Router } from 'express';
import {
  readEmailConfig,
  saveEmailConfig,
  sendTestEmail,
  readEmailLogs
} from '../services/emailService.js';
import { requireAdminAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/email/config - Get email configuration (password masked) (Admin only)
router.get('/config', requireAdminAuth, (req, res) => {
  try {
    const config = readEmailConfig();
    const maskedConfig = {
      ...config,
      smtpPassword: config.smtpPassword ? '••••••••' : ''
    };
    res.json({ success: true, data: maskedConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/email/config - Save email configuration (Admin only)
router.post('/config', requireAdminAuth, (req, res) => {
  try {
    const existing = readEmailConfig();
    const newConfig = { ...existing, ...(req.body || {}) };
    if (req.body?.smtpPassword === '••••••••') {
      newConfig.smtpPassword = existing.smtpPassword;
    }
    const saved = saveEmailConfig(newConfig);
    if (!saved) return res.status(500).json({ success: false, error: 'Failed to save email configuration.' });

    const maskedConfig = {
      ...newConfig,
      smtpPassword: newConfig.smtpPassword ? '••••••••' : ''
    };
    res.json({ success: true, message: 'Email configuration saved successfully.', data: maskedConfig });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/email/test - Send test email (Admin only)
router.post('/test', requireAdminAuth, async (req, res) => {
  try {
    const { toEmail } = req.body || {};
    if (!toEmail) {
      return res.status(400).json({ success: false, error: 'Recipient email address is required.' });
    }
    const result = await sendTestEmail(toEmail);
    res.json({ success: true, message: `Test email sent successfully to ${toEmail}.`, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/email/logs - Get email delivery execution logs (Admin only)
router.get('/logs', requireAdminAuth, (req, res) => {
  try {
    const logs = readEmailLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
