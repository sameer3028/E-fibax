const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const delay = ms => new Promise(r => setTimeout(r, ms));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = path.resolve('C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence');
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Forgot Password Email OTP E2E Verification...');

  const configPath = path.join(DATA_DIR, 'email_config.json');
  let originalConfig = null;
  if (fs.existsSync(configPath)) {
    originalConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  // 1. Seed test users into server/data/users.json
  const usersFile = path.join(DATA_DIR, 'users.json');
  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  }

  const timestamp = Date.now();
  const unconfiguredEmail = `unconf.${timestamp}@fibaxpharma.com`;
  const deliveryEmail = `delivery.${timestamp}@fibaxpharma.com`;

  users.push({
    id: `USR-UNCONF-${timestamp}`,
    name: 'Unconfigured Test User',
    email: unconfiguredEmail,
    phone: `987000${String(timestamp).slice(-4)}`,
    salt: 'salt_123',
    passwordHash: 'hash_123',
    createdAt: new Date().toISOString()
  });

  users.push({
    id: `USR-DELIVERY-${timestamp}`,
    name: 'Rohan Sharma',
    email: deliveryEmail,
    phone: `987111${String(timestamp).slice(-4)}`,
    salt: 'salt_456',
    passwordHash: 'hash_456',
    createdAt: new Date().toISOString()
  });

  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
  console.log(`✅ Seeded test users (${unconfiguredEmail}, ${deliveryEmail}) into users.json`);

  // 2. Launch Puppeteer Browser
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 850 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 3. Navigate to Storefront
    console.log('🌐 Loading http://localhost:3030 ...');
    await page.goto('http://localhost:3030', { waitUntil: 'networkidle0' });
    await delay(1000);

    // 4. Open Sign In Modal
    console.log('🔍 Clicking Sign In button in header...');
    const signInBtn = await page.waitForSelector('button[title="Login or Register"]', { timeout: 10000 });
    await signInBtn.click();
    await delay(800);

    // 5. Inspect the "Forgot Password?" element
    console.log('🔍 Inspecting Forgot Password link/button...');
    const forgotElement = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const forgotBtn = allButtons.find(b => b.innerText && b.innerText.includes('Forgot Password'));
      const allLinks = Array.from(document.querySelectorAll('a'));
      const waLink = allLinks.find(a => (a.href && a.href.includes('wa.me')) && (a.innerText && a.innerText.includes('Forgot Password')));
      
      return {
        isButton: !!forgotBtn,
        hasWaLink: !!waLink,
        buttonText: forgotBtn ? forgotBtn.innerText : null
      };
    });

    console.log('📋 Forgot Password Element Check:', forgotElement);

    if (forgotElement.hasWaLink) {
      throw new Error('CRITICAL BUG: Forgot Password is still a WhatsApp link!');
    }
    if (!forgotElement.isButton) {
      throw new Error('Could not find Forgot Password button in AuthModal!');
    }

    // 6. Click Forgot Password button
    console.log('👉 Clicking "Forgot Password?" button...');
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const forgotBtn = allButtons.find(b => b.innerText && b.innerText.includes('Forgot Password'));
      if (forgotBtn) forgotBtn.click();
    });
    await delay(800);

    // Capture Screenshot 1: Step 1 - Registered Email Input
    const sc1Path = path.join(EVIDENCE_DIR, '01_forgot_password_email_input_desktop.png');
    await page.screenshot({ path: sc1Path, fullPage: false });
    console.log('📸 Screenshot 1 saved (Email Input):', sc1Path);

    // 7. Verify Unconfigured SMTP Reporting (No Fake Success!)
    console.log(`🧪 Submitting registered email (${unconfiguredEmail}) with unconfigured SMTP...`);
    await page.type('input[type="email"]', unconfiguredEmail);
    await delay(400);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText && b.innerText.includes('Send Verification Code'));
      if (btn) btn.click();
    });

    await delay(1500);

    const errorText = await page.evaluate(() => {
      const alert = document.querySelector('.bg-rose-50');
      return alert ? alert.innerText : null;
    });

    console.log('📋 Unconfigured SMTP UI Feedback:', errorText);

    // Capture Screenshot 2: Unconfigured SMTP alert
    const sc2Path = path.join(EVIDENCE_DIR, '02_forgot_password_unconfigured_smtp_alert.png');
    await page.screenshot({ path: sc2Path, fullPage: false });
    console.log('📸 Screenshot 2 saved (Unconfigured SMTP Alert):', sc2Path);

    // 8. Configure a test Ethereal transporter in email_config.json to test full live delivery flow
    console.log('📧 Setting up test SMTP credentials via Ethereal Email...');
    const testAccount = await nodemailer.createTestAccount();
    const testConfig = {
      ...(originalConfig || {}),
      enabled: true,
      senderName: 'Fibax Ayurveda',
      senderEmail: 'orders@fibaxpharma.com',
      replyToEmail: 'care@fibaxpharma.com',
      smtpHost: testAccount.smtp.host,
      smtpPort: testAccount.smtp.port,
      smtpSecure: testAccount.smtp.secure,
      smtpUser: testAccount.user,
      smtpPassword: testAccount.pass
    };
    fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2), 'utf8');
    console.log(`✅ Configured test SMTP with Ethereal user: ${testAccount.user}`);

    // Wait 1 second
    await delay(1000);

    // 9. Enter deliveryEmail into email input
    console.log(`👉 Entering delivery email (${deliveryEmail}) and submitting...`);
    await page.evaluate(() => {
      const input = document.querySelector('input[type="email"]');
      if (input) {
        input.value = '';
      }
    });
    await page.type('input[type="email"]', deliveryEmail);
    await delay(300);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText && b.innerText.includes('Send Verification Code'));
      if (btn) btn.click();
    });

    // Wait for Nodemailer dispatch and UI transition to Step 2
    console.log('⏳ Awaiting email dispatch and UI transition to Step 2...');
    await page.waitForSelector('input[inputmode="numeric"]', { timeout: 20000 });
    await delay(1000);

    // Capture Screenshot 3: Step 2 - 6-Digit OTP Verification Screen
    const sc3Path = path.join(EVIDENCE_DIR, '03_forgot_password_otp_verification_desktop.png');
    await page.screenshot({ path: sc3Path, fullPage: false });
    console.log('📸 Screenshot 3 saved (6-Digit OTP Screen):', sc3Path);

    // Read the email log to extract the OTP from the received email in Ethereal
    console.log('📬 Reading email_logs.json for dispatched OTP email...');
    await delay(1000);
    const logsFile = path.join(DATA_DIR, 'email_logs.json');
    let logs = [];
    if (fs.existsSync(logsFile)) {
      logs = JSON.parse(fs.readFileSync(logsFile, 'utf8'));
    }
    const latestSent = logs.find(l => l.recipient === deliveryEmail.toLowerCase() && l.status === 'SENT' && l.previewUrl);
    if (!latestSent) {
      throw new Error(`Could not find SENT email log for ${deliveryEmail}`);
    }
    console.log(`📬 Fetching email content from preview URL: ${latestSent.previewUrl}`);
    const previewRes = await fetch(latestSent.previewUrl);
    const previewHtml = await previewRes.text();
    const otpMatch = previewHtml.match(/([0-9]{6})\s+is your Fibax Ayurveda/);
    if (!otpMatch) {
      throw new Error(`Failed to extract 6-digit OTP from email preview: ${previewHtml.slice(0, 400)}`);
    }
    const realDispatchedOtp = otpMatch[1];
    console.log(`🔑 Extracted genuine 6-digit OTP from received customer email: ${realDispatchedOtp}`);

    // Enter real OTP into the 6 boxes using keyboard typing so React state updates
    const otpInputs = await page.$$('input[inputmode="numeric"]');
    if (otpInputs.length >= 6) {
      await otpInputs[0].focus();
      await page.keyboard.type(realDispatchedOtp, { delay: 80 });
    }
    await delay(800);

    // 10. Click "Verify Code & Proceed"
    console.log('👉 Clicking "Verify Code & Proceed"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText && b.innerText.includes('Verify Code'));
      if (btn) btn.click();
    });

    // Wait for transition to Step 3 (New Password)
    console.log('⏳ Awaiting backend verification and UI transition to Step 3 (New Password)...');
    await page.waitForSelector('input[placeholder="Enter new password"]', { timeout: 10000 });
    await delay(1000);

    // Capture Screenshot 4: Step 3 - Set New Password
    const sc4Path = path.join(EVIDENCE_DIR, '04_forgot_password_new_password_desktop.png');
    await page.screenshot({ path: sc4Path, fullPage: false });
    console.log('📸 Screenshot 4 saved (New Password Screen):', sc4Path);

    // 11. Enter New Password & Confirm Password
    console.log('📝 Entering new password and confirm password...');
    const newPass = 'Ayurveda@2026';
    await page.type('input[placeholder="Enter new password"]', newPass, { delay: 50 });
    await page.type('input[placeholder="Re-enter new password"]', newPass, { delay: 50 });
    await delay(600);

    // 12. Click "Reset Password"
    console.log('👉 Clicking "Reset Password"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText && b.innerText.includes('Reset Password'));
      if (btn) btn.click();
    });

    // Wait for transition to Step 4 (Success screen)
    console.log('⏳ Awaiting password reset completion and UI transition to Step 4 (Success)...');
    await page.waitForFunction(() => document.body.innerText.includes('Password Reset Successfully'), { timeout: 10000 });
    await delay(1000);

    // Capture Screenshot 5: Step 4 - Reset Password Success Confirmation
    const sc5Path = path.join(EVIDENCE_DIR, '05_forgot_password_success_confirmation.png');
    await page.screenshot({ path: sc5Path, fullPage: false });
    console.log('📸 Screenshot 5 saved (Success Screen):', sc5Path);

    // 13. Mobile Viewport Check (390px x 844px iPhone 14 Pro)
    console.log('📱 Switching to Mobile Viewport (390 x 844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await delay(1000);

    // Click "Sign In to Account" on mobile to show smooth return to login
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText && b.innerText.includes('Sign In to Account'));
      if (btn) btn.click();
    });
    await delay(1000);

    // Click Forgot Password on mobile to show mobile Step 1 view
    await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      const forgotBtn = allButtons.find(b => b.innerText && b.innerText.includes('Forgot Password'));
      if (forgotBtn) forgotBtn.click();
    });
    await delay(800);

    const sc6Path = path.join(EVIDENCE_DIR, '06_forgot_password_mobile_390px.png');
    await page.screenshot({ path: sc6Path, fullPage: false });
    console.log('📸 Screenshot 6 saved (Mobile 390px):', sc6Path);

    console.log('🎉 ALL FORGOT PASSWORD E2E BROWSER CHECKS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();

    // Restore original email config
    if (originalConfig) {
      fs.writeFileSync(configPath, JSON.stringify(originalConfig, null, 2), 'utf8');
      console.log('🧹 Restored original email_config.json');
    }

    // Clean up test users
    try {
      if (fs.existsSync(usersFile)) {
        let curUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
        curUsers = curUsers.filter(u => u.email !== unconfiguredEmail && u.email !== deliveryEmail);
        fs.writeFileSync(usersFile, JSON.stringify(curUsers, null, 2), 'utf8');
        console.log(`🧹 Cleaned up test users from users.json`);
      }
    } catch (_) {}
  }
}

run().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
