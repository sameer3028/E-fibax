import path from 'path';
import nodemailer from 'nodemailer';
import { generateOrderConfirmationHtml, generateOrderConfirmationText } from '../emailTemplates/orderConfirmation.js';
import { generateAdminOrderAlertHtml, generateAdminOrderAlertText } from '../emailTemplates/adminOrderAlert.js';
import { readJsonFile, writeJsonFile } from '../store.js';

const __dirname = path.resolve();
const CONFIG_FILE = path.join(__dirname, 'server', 'data', 'email_config.json');
const LOGS_FILE = path.join(__dirname, 'server', 'data', 'email_logs.json');
const ORDERS_FILE = path.join(__dirname, 'server', 'data', 'orders.json');

// Default email configuration
const DEFAULT_CONFIG = {
  enabled: true,
  orderConfirmationEnabled: true,
  adminAlertEnabled: true,
  adminAlertEmail: 'fibaxpharma@gmail.com',
  senderName: process.env.SMTP_FROM_NAME || 'Fibax Ayurveda',
  senderEmail: process.env.SMTP_FROM_EMAIL || 'orders@fibaxpharma.com',
  replyToEmail: 'care@fibaxpharma.com',
  supportEmail: 'care@fibaxpharma.com',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  lastAdminAlertStatus: null,
  lastAdminAlertTimestamp: null,
  lastAdminAlertRecipient: 'fibaxpharma@gmail.com'
};

// Helper: Check if SMTP is configured with actual host and credentials
export function isSmtpConfigured(config = null) {
  const cfg = config || readEmailConfig();
  const host = (cfg.smtpHost || process.env.SMTP_HOST || '').trim();
  const user = (cfg.smtpUser || process.env.SMTP_USER || '').trim();
  const pass = (cfg.smtpPassword || process.env.SMTP_PASSWORD || '').trim();
  return Boolean(host && user && pass);
}

// Helper: Read email configuration
export function readEmailConfig() {
  try {
    const data = readJsonFile(CONFIG_FILE, null);
    if (data) {
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
    return writeJsonFile(CONFIG_FILE, config);
  } catch (err) {
    console.error('Error saving email_config.json:', err.message);
    return false;
  }
}

// Helper: Read email logs
export function readEmailLogs() {
  return readJsonFile(LOGS_FILE, []);
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
    writeJsonFile(LOGS_FILE, trimmedLogs);
  } catch (err) {
    console.error('Error logging email execution:', err.message);
  }
}

// Helper: Helper to update order in orders.json
function updateOrderEmailFields(orderId, emailFields) {
  try {
    const orders = readJsonFile(ORDERS_FILE, []);
    const idx = orders.findIndex(o => String(o.orderId).toUpperCase() === String(orderId).toUpperCase());
    if (idx !== -1) {
      orders[idx] = {
        ...orders[idx],
        ...emailFields,
        updatedAt: new Date().toISOString()
      };
      writeJsonFile(ORDERS_FILE, orders);
    }
  } catch (err) {
    console.error(`Error updating order #${orderId} email status:`, err.message);
  }
}

// Helper: Update last admin alert status in config
function updateAdminAlertConfigStatus(status, recipient) {
  try {
    const config = readEmailConfig();
    config.lastAdminAlertStatus = status;
    config.lastAdminAlertTimestamp = new Date().toISOString();
    if (recipient) config.lastAdminAlertRecipient = recipient;
    saveEmailConfig(config);
  } catch (err) {
    console.error('Error updating config alert status:', err.message);
  }
}

// Create Nodemailer Transporter
async function createTransporter(config) {
  const host = (config.smtpHost || process.env.SMTP_HOST || '').trim();
  const user = (config.smtpUser || process.env.SMTP_USER || '').trim();
  const pass = (config.smtpPassword || process.env.SMTP_PASSWORD || '').trim();
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

  // 4. Check if SMTP is configured
  if (!isSmtpConfigured(config)) {
    console.log(`ℹ️ SMTP credentials not configured. Customer confirmation for Order #${order.orderId} skipped in unconfigured state.`);
    updateOrderEmailFields(order.orderId, {
      orderConfirmationEmailSent: false,
      orderConfirmationEmailStatus: 'NOT_CONFIGURED',
      orderConfirmationEmailError: 'SMTP credentials not configured in settings.'
    });
    logEmailExecution({
      orderId: order.orderId,
      type: 'Order Confirmation',
      recipient: recipientEmail,
      status: 'NOT_CONFIGURED',
      details: 'SMTP not configured in Admin Settings. Live email delivery skipped.'
    });
    return { success: false, notConfigured: true, reason: 'smtp_not_configured' };
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
    if (previewUrl) console.log(`🔗 Preview: ${previewUrl}`);

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

    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Send Admin New Order Alert Email
 * @param {Object} order Canonical order object
 * @param {Boolean} forceSend Set true to bypass idempotency check (for manual admin resend)
 */
export async function sendAdminNewOrderAlert(order, forceSend = false) {
  if (!order || !order.orderId) {
    return { success: false, error: 'Invalid order object' };
  }

  // 1. Idempotency Protection Check
  if (order.adminOrderAlertSent && !forceSend) {
    console.log(`ℹ️ Admin alert for Order #${order.orderId} was already sent at ${order.adminOrderAlertSentAt}. Skipping duplicate alert.`);
    return { success: true, skipped: true, reason: 'already_sent' };
  }

  const config = readEmailConfig();
  const adminRecipient = (config.adminAlertEmail || 'fibaxpharma@gmail.com').trim();

  // 2. Settings Toggle Guard
  if (config.enabled === false || config.adminAlertEnabled === false) {
    console.log(`ℹ️ Admin New Order Alert disabled in Admin Settings. Skipping alert for Order #${order.orderId}.`);
    updateOrderEmailFields(order.orderId, {
      adminOrderAlertSent: false,
      adminOrderAlertStatus: 'SKIPPED_CONFIG_DISABLED',
      adminOrderAlertRecipient: adminRecipient
    });
    updateAdminAlertConfigStatus('SKIPPED_CONFIG_DISABLED', adminRecipient);
    return { success: false, skipped: true, reason: 'config_disabled' };
  }

  // 3. Admin Recipient Email Validation
  if (!adminRecipient || !adminRecipient.includes('@')) {
    console.error(`❌ Admin notification email is invalid for Order #${order.orderId}: "${adminRecipient}"`);
    updateOrderEmailFields(order.orderId, {
      adminOrderAlertSent: false,
      adminOrderAlertStatus: 'FAILED_INVALID_EMAIL',
      adminOrderAlertRecipient: adminRecipient,
      adminOrderAlertError: 'Invalid admin recipient email configured.'
    });
    updateAdminAlertConfigStatus('FAILED_INVALID_EMAIL', adminRecipient);
    logEmailExecution({
      orderId: order.orderId,
      type: 'Admin Order Alert',
      recipient: adminRecipient || 'None',
      status: 'FAILED',
      error: 'Invalid admin recipient email configured.'
    });
    return { success: false, error: 'Invalid admin recipient email' };
  }

  // 4. Check if SMTP is configured
  if (!isSmtpConfigured(config)) {
    console.log(`ℹ️ SMTP credentials not configured. Admin alert for Order #${order.orderId} logged in NOT_CONFIGURED state (no live dispatch).`);
    updateOrderEmailFields(order.orderId, {
      adminOrderAlertSent: false,
      adminOrderAlertSentAt: null,
      adminOrderAlertStatus: 'NOT_CONFIGURED',
      adminOrderAlertRecipient: adminRecipient,
      adminOrderAlertError: 'SMTP credentials not configured in settings.'
    });
    updateAdminAlertConfigStatus('NOT_CONFIGURED', adminRecipient);
    logEmailExecution({
      orderId: order.orderId,
      type: 'Admin Order Alert',
      recipient: adminRecipient,
      status: 'NOT_CONFIGURED',
      details: 'SMTP not configured in Admin Settings. Live email delivery simulated/skipped.'
    });
    return { success: false, notConfigured: true, reason: 'smtp_not_configured', recipient: adminRecipient };
  }

  // 5. Live Email Dispatch via Nodemailer Transporter
  try {
    const transporter = await createTransporter(config);
    const html = generateAdminOrderAlertHtml(order, config);
    const text = generateAdminOrderAlertText(order, config);

    const fromAddress = `"${config.senderName || 'Fibax Ayurveda'}" <${config.senderEmail || 'orders@fibaxpharma.com'}>`;
    const subject = `NEW ORDER RECEIVED | Order #${order.orderId} | Fibax Ayurveda`;

    const mailOptions = {
      from: fromAddress,
      to: adminRecipient,
      replyTo: config.replyToEmail || 'care@fibaxpharma.com',
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

    console.log(`⚡ Admin New Order Alert SENT for #${order.orderId} to ${adminRecipient} (MsgID: ${info.messageId || 'sent'})`);
    if (previewUrl) console.log(`🔗 Preview: ${previewUrl}`);

    const sentTimestamp = new Date().toISOString();
    updateOrderEmailFields(order.orderId, {
      adminOrderAlertSent: true,
      adminOrderAlertSentAt: sentTimestamp,
      adminOrderAlertStatus: 'SENT',
      adminOrderAlertRecipient: adminRecipient,
      adminOrderAlertError: null
    });

    updateAdminAlertConfigStatus('SENT', adminRecipient);

    logEmailExecution({
      orderId: order.orderId,
      type: 'Admin Order Alert',
      recipient: adminRecipient,
      status: 'SENT',
      messageId: info.messageId || null,
      previewUrl: previewUrl || null
    });

    return {
      success: true,
      messageId: info.messageId,
      recipient: adminRecipient,
      previewUrl: previewUrl
    };
  } catch (err) {
    console.error(`❌ Error sending admin alert for Order #${order.orderId}:`, err.message);

    updateOrderEmailFields(order.orderId, {
      adminOrderAlertSent: false,
      adminOrderAlertStatus: 'FAILED',
      adminOrderAlertRecipient: adminRecipient,
      adminOrderAlertError: err.message
    });

    updateAdminAlertConfigStatus('FAILED', adminRecipient);

    logEmailExecution({
      orderId: order.orderId,
      type: 'Admin Order Alert',
      recipient: adminRecipient,
      status: 'FAILED',
      error: err.message
    });

    // DO NOT THROW: Non-blocking return so order creation remains 100% successful
    return {
      success: false,
      error: err.message,
      recipient: adminRecipient
    };
  }
}

/**
 * Send Test Admin Order Alert
 */
export async function sendTestAdminAlert(recipientEmail) {
  const config = readEmailConfig();
  const targetRecipient = (recipientEmail || config.adminAlertEmail || 'fibaxpharma@gmail.com').trim();
  if (!targetRecipient || !targetRecipient.includes('@')) {
    throw new Error('Please provide a valid recipient email address for admin alert test.');
  }

  if (!isSmtpConfigured(config)) {
    logEmailExecution({
      orderId: 'TEST-ADMIN-ALERT',
      type: 'Admin Alert Test',
      recipient: targetRecipient,
      status: 'NOT_CONFIGURED',
      details: 'Test simulated. SMTP credentials not configured in settings.'
    });
    return {
      success: false,
      notConfigured: true,
      error: 'SMTP credentials are not configured. Please fill in your SMTP Host, User and Password in Email Settings to send live admin alerts.'
    };
  }

  const transporter = await createTransporter(config);
  const mockOrder = {
    orderId: 'FBX-TEST-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    createdAt: new Date().toISOString(),
    customer: {
      name: 'Fibax Verification Customer',
      phone: '9876543210',
      email: 'customer.test@fibaxpharma.com'
    },
    shipping: {
      address: '123 Ayurveda Marg, Wellness Hub',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160022'
    },
    items: [
      {
        id: '101',
        title: 'Axe Ortho Pain Relief- 30 Capsules',
        sku: 'AXE-ORTHO-30',
        variant: 'Standard Pack',
        price: 425,
        quantity: 2
      },
      {
        id: '3430',
        title: 'Fibax Multivitamin Syrup 500ml',
        sku: 'FBX-MULTI-500',
        variant: '500ml Family Pack',
        price: 345,
        quantity: 1
      }
    ],
    payment: {
      method: 'COD',
      status: 'Pending Cash Collection',
      transactionId: 'TEST-REF-' + Date.now()
    },
    totals: {
      subtotal: 1195,
      discountAmount: 100,
      couponCode: 'WELCOME100',
      shippingFee: 0,
      codFee: 0,
      grandTotal: 1095
    }
  };

  const html = generateAdminOrderAlertHtml(mockOrder, config);
  const text = generateAdminOrderAlertText(mockOrder, config);

  const fromAddress = `"${config.senderName || 'Fibax Ayurveda'}" <${config.senderEmail || 'orders@fibaxpharma.com'}>`;
  const subject = `[TEST] NEW ORDER RECEIVED | Order #${mockOrder.orderId} | Fibax Ayurveda`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: targetRecipient,
    replyTo: config.replyToEmail || 'care@fibaxpharma.com',
    subject: subject,
    text: text,
    html: html
  });

  const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

  logEmailExecution({
    orderId: mockOrder.orderId,
    type: 'Admin Alert Test',
    recipient: targetRecipient,
    status: 'SENT',
    messageId: info.messageId || null,
    previewUrl: previewUrl || null
  });

  updateAdminAlertConfigStatus('TEST_SENT', targetRecipient);

  return {
    success: true,
    messageId: info.messageId,
    recipient: targetRecipient,
    previewUrl: previewUrl
  };
}

/**
 * Send Test Email (Customer Confirmation Test)
 */
export async function sendTestEmail(recipientEmail) {
  if (!recipientEmail || !recipientEmail.includes('@')) {
    throw new Error('Please provide a valid test recipient email address.');
  }

  const config = readEmailConfig();

  if (!isSmtpConfigured(config)) {
    logEmailExecution({
      orderId: 'TEST-EMAIL',
      type: 'Customer Test Email',
      recipient: recipientEmail,
      status: 'NOT_CONFIGURED',
      details: 'Test simulated. SMTP credentials not configured in settings.'
    });
    return {
      success: false,
      notConfigured: true,
      error: 'SMTP credentials are not configured. Please fill in your SMTP Host, User and Password in Email Settings to send live test emails.'
    };
  }

  const transporter = await createTransporter(config);

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
    replyTo: config.replyToEmail || 'care@fibaxpharma.com',
    subject: 'Test Email — Fibax Ayurveda Email System Verification',
    text: 'This is a test email from Fibax Ayurveda. Your transactional email integration is working correctly!',
    html: testHtml
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

  logEmailExecution({
    orderId: 'TEST-EMAIL',
    type: 'Customer Test Email',
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
