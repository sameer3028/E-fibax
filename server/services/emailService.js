import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { generateOrderConfirmationHtml, generateOrderConfirmationText } from '../emailTemplates/orderConfirmation.js';

const __dirname = path.resolve();
const CONFIG_FILE = path.join(__dirname, 'server', 'data', 'email_config.json');
const LOGS_FILE = path.join(__dirname, 'server', 'data', 'email_logs.json');
const ORDERS_FILE = path.join(__dirname, 'server', 'data', 'orders.json');

// Default email configuration
const DEFAULT_CONFIG = {
  enabled: true,
  orderConfirmationEnabled: true,
  senderName: process.env.SMTP_FROM_NAME || 'Fibax Ayurveda',
  senderEmail: process.env.SMTP_FROM_EMAIL || 'orders@fibaxpharma.com',
  replyToEmail: 'care@fibaxpharma.com',
  supportEmail: 'care@fibaxpharma.com',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || ''
};

// Helper: Read email configuration
export function readEmailConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...data };
    }
  } catch (err) {
    console.error('Error reading email_config.json:', err.message);
  }
  return { ...DEFAULT_CONFIG };
}

// Helper: Save email configuration
export function saveEmailConfig(config) {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving email_config.json:', err.message);
    return false;
  }
}

// Helper: Read email logs
export function readEmailLogs() {
  try {
    if (fs.existsSync(LOGS_FILE)) {
      return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading email_logs.json:', err.message);
  }
  return [];
}

// Helper: Append to email logs
export function logEmailExecution(logEntry) {
  try {
    const logs = readEmailLogs();
    logs.unshift({
      id: 'EML-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5).toUpperCase(),
      timestamp: new Date().toISOString(),
      ...logEntry
    });
    // Keep last 500 logs
    const trimmedLogs = logs.slice(0, 500);
    const dir = path.dirname(LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOGS_FILE, JSON.stringify(trimmedLogs, null, 2), 'utf8');
  } catch (err) {
    console.error('Error logging email execution:', err.message);
  }
}

// Helper: Helper to update order in orders.json
function updateOrderEmailFields(orderId, emailFields) {
  try {
    if (!fs.existsSync(ORDERS_FILE)) return;
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    const idx = orders.findIndex(o => String(o.orderId).toUpperCase() === String(orderId).toUpperCase());
    if (idx !== -1) {
      orders[idx] = {
        ...orders[idx],
        ...emailFields,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
    }
  } catch (err) {
    console.error(`Error updating order #${orderId} email status:`, err.message);
  }
}

// Create Nodemailer Transporter
async function createTransporter(config) {
  const host = config.smtpHost || process.env.SMTP_HOST;
  const user = config.smtpUser || process.env.SMTP_USER;
  const pass = config.smtpPassword || process.env.SMTP_PASSWORD;
  const port = Number(config.smtpPort || process.env.SMTP_PORT || 587);
  const secure = config.smtpSecure || process.env.SMTP_SECURE === 'true';

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  // Fast JSON / Stream transport fallback for dev environment when SMTP is not configured
  return nodemailer.createTransport({
    jsonTransport: true
  });
}

/**
 * Send Order Confirmation Email
 * @param {Object} order Canonical order object
 * @param {Boolean} forceSend Set true to bypass idempotency check (for manual admin resend)
 */
export async function sendOrderConfirmationEmail(order, forceSend = false) {
  if (!order || !order.orderId) {
    return { success: false, error: 'Invalid order object' };
  }

  // 1. Idempotency Protection Check
  if (order.orderConfirmationEmailSent && !forceSend) {
    console.log(`ℹ️ Confirmation email for Order #${order.orderId} was already sent at ${order.orderConfirmationEmailSentAt}. Skipping duplicate send.`);
    return { success: true, skipped: true, reason: 'already_sent' };
  }

  const config = readEmailConfig();

  // 2. Settings Toggle Guard
  if (config.enabled === false || config.orderConfirmationEnabled === false) {
    console.log(`ℹ️ Order confirmation email disabled in Admin Settings. Skipping Order #${order.orderId}.`);
    updateOrderEmailFields(order.orderId, {
      orderConfirmationEmailSent: false,
      orderConfirmationEmailStatus: 'SKIPPED_CONFIG_DISABLED'
    });
    return { success: false, skipped: true, reason: 'config_disabled' };
  }

  // 3. Customer Email Validation
  const recipientEmail = (order.customer?.email || '').trim().toLowerCase();
  if (!recipientEmail || !recipientEmail.includes('@') || recipientEmail.endsWith('@customer.fibaxpharma.com')) {
    console.log(`ℹ️ Customer email unavailable or system generated for Order #${order.orderId} — order confirmation email not sent.`);
    updateOrderEmailFields(order.orderId, {
      orderConfirmationEmailSent: false,
      orderConfirmationEmailStatus: 'SKIPPED_NO_EMAIL'
    });
    logEmailExecution({
      orderId: order.orderId,
      type: 'Order Confirmation',
      recipient: recipientEmail || 'None',
      status: 'SKIPPED_NO_EMAIL',
      details: 'Customer email unavailable or system placeholder.'
    });
    return { success: false, skipped: true, reason: 'no_email' };
  }

  try {
    const transporter = await createTransporter(config);
    const html = generateOrderConfirmationHtml(order, config);
    const text = generateOrderConfirmationText(order, config);

    const fromAddress = `"${config.senderName || 'Fibax Ayurveda'}" <${config.senderEmail || 'orders@fibaxpharma.com'}>`;
    const subject = `Order Confirmed – #${order.orderId} | Fibax Ayurveda`;

    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      replyTo: config.replyToEmail || 'care@fibaxpharma.com',
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

    console.log(`📧 Order Confirmation Email SENT for #${order.orderId} to ${recipientEmail} (MsgID: ${info.messageId || 'sent'})`);
    if (previewUrl) console.log(`🔗 Ethereal Email Preview: ${previewUrl}`);

    // Update canonical order record with sent status
    const sentTimestamp = new Date().toISOString();
    updateOrderEmailFields(order.orderId, {
      orderConfirmationEmailSent: true,
      orderConfirmationEmailSentAt: sentTimestamp,
      orderConfirmationEmailStatus: 'SENT',
      orderConfirmationEmailError: null
    });

    logEmailExecution({
      orderId: order.orderId,
      type: 'Order Confirmation',
      recipient: recipientEmail,
      status: 'SENT',
      messageId: info.messageId || null,
      previewUrl: previewUrl || null
    });

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl
    };
  } catch (err) {
    console.error(`❌ Error sending confirmation email for Order #${order.orderId}:`, err.message);

    updateOrderEmailFields(order.orderId, {
      orderConfirmationEmailSent: false,
      orderConfirmationEmailStatus: 'FAILED',
      orderConfirmationEmailError: err.message
    });

    logEmailExecution({
      orderId: order.orderId,
      type: 'Order Confirmation',
      recipient: recipientEmail,
      status: 'FAILED',
      error: err.message
    });

    // DO NOT THROW: Return failure object safely so canonical order creation remains 100% successful
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Send Test Email (Admin Function)
 */
export async function sendTestEmail(recipientEmail) {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    throw new Error('Please provide a valid test recipient email address.');
  }

  const config = readEmailConfig();
  const transporter = await createTransporter(config);
  const baseUrl = process.env.APP_URL || 'http://localhost:3030';

  const testHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
    <div style="text-align: center; background-color: #0f382c; padding: 20px; border-radius: 8px;">
      <h2 style="color: #ffffff; margin: 0;">Fibax Ayurveda</h2>
    </div>
    <div style="padding: 20px 0;">
      <h3 style="color: #0f382c;">This is a test email from Fibax Ayurveda.</h3>
      <p style="color: #4b5563; line-height: 1.5;">
        If you are receiving this message, your Fibax Ayurveda transactional email system and SMTP configuration are active and working correctly!
      </p>
      <div style="background-color: #f9fafb; padding: 12px; border-radius: 8px; font-size: 13px; color: #6b7280; margin-top: 16px;">
        <strong>Configuration Details:</strong><br/>
        Sender Name: ${config.senderName || 'Fibax Ayurveda'}<br/>
        Sender Email: ${config.senderEmail || 'orders@fibaxpharma.com'}<br/>
        Timestamp: ${new Date().toLocaleString('en-IN')}
      </div>
    </div>
    <div style="text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px;">
      Fibax Ayurveda Admin Email Test Engine
    </div>
  </div>`;

  const mailOptions = {
    from: `"${config.senderName || 'Fibax Ayurveda'}" <${config.senderEmail || 'orders@fibaxpharma.com'}>`,
    to: recipientEmail,
    subject: 'Test Email — Fibax Ayurveda Email System Verification',
    text: 'This is a test email from Fibax Ayurveda. Your transactional email integration is working correctly!',
    html: testHtml
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

  logEmailExecution({
    orderId: 'TEST-EMAIL',
    type: 'Admin Test Email',
    recipient: recipientEmail,
    status: 'SENT',
    messageId: info.messageId || null,
    previewUrl: previewUrl || null
  });

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl
  };
}
