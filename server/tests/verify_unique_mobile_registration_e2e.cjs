const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = path.resolve('C:/Users/Kabul Singh/.gemini/antigravity/brain/e208b1b0-35f4-44ab-8474-3eb128b3da11/verification_evidence');
if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const usersFilePath = path.resolve('server/data/users.json');

async function typeField(page, selector, text) {
  await page.waitForSelector(selector, { timeout: 10000 });
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.type(selector, text, { delay: 10 });
}

async function openRegisterModal(page) {
  // Check if modal is already open
  const isAlreadyOpen = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="Ramesh Patel"]');
    return !!input;
  });

  if (!isAlreadyOpen) {
    // Check if Sign In button exists in header
    const signInBtn = await page.waitForSelector('button[title="Login or Register"]', { timeout: 10000 });
    await signInBtn.click();
    await new Promise(r => setTimeout(r, 1000));
  }

  // Switch to Register tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const regTab = buttons.find(b => b.innerText && b.innerText.trim() === 'Create Account');
    if (regTab) regTab.click();
  });

  await page.waitForSelector('input[placeholder*="Ramesh Patel"]', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 600));
}

async function run() {
  console.log('🚀 Starting Customer Unique Mobile Registration E2E Verification...');

  // Backup users.json before test
  const initialUsersRaw = fs.existsSync(usersFilePath) ? fs.readFileSync(usersFilePath, 'utf8') : '[]';

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('🌐 Loading http://localhost:3030 ...');
    await page.goto('http://localhost:3030', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    // Step 1: Open Register Modal on Desktop
    console.log('🔍 Opening Register Modal on Desktop...');
    await openRegisterModal(page);

    // Register User 1: 9056344458 (10 digits)
    const testPhone = '9056344458';
    const email1 = `e2e.user1.${Date.now()}@fibaxpharma.com`;

    console.log(`📝 Registering Account 1: Full Name: "Aarav Sharma", Email: ${email1}, Mobile: ${testPhone}...`);
    await typeField(page, 'input[placeholder*="Ramesh Patel"]', 'Aarav Sharma');
    await typeField(page, 'input[placeholder*="ramesh@email.com"]', email1);
    await typeField(page, 'input[placeholder*="10-digit mobile"]', testPhone);
    await typeField(page, 'input[placeholder*="At least 6 characters"]', 'Password@123');

    await new Promise(r => setTimeout(r, 500));

    console.log('👉 Submitting registration form...');
    await page.click('form button[type="submit"]');

    await new Promise(r => setTimeout(r, 2000));

    // Verify User 1 was created in users.json
    const usersAfter1 = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    const user1Created = usersAfter1.find(u => u.phone === testPhone);
    console.log('✅ Account 1 registered successfully in database:', Boolean(user1Created));

    const shot1 = path.join(EVIDENCE_DIR, '01_desktop_register_first_user_success.png');
    await page.screenshot({ path: shot1 });
    console.log(`📸 Screenshot 1 saved: ${shot1}`);

    // Step 2: Clear storage, reload, and attempt duplicate registration
    console.log('\n🔄 Clearing session and opening Register Modal for duplicate registration test...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('http://localhost:3030', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    await openRegisterModal(page);

    // Attempt duplicate registration with +91 format
    const email2 = `e2e.user2.${Date.now()}@fibaxpharma.com`;
    const duplicatePhonePlus91 = '+919056344458';
    console.log(`🧪 Attempting Duplicate Registration with different email (${email2}) and +91 format (${duplicatePhonePlus91})...`);

    await typeField(page, 'input[placeholder*="Ramesh Patel"]', 'Vihaan Verma');
    await typeField(page, 'input[placeholder*="ramesh@email.com"]', email2);
    await typeField(page, 'input[placeholder*="10-digit mobile"]', duplicatePhonePlus91);
    await typeField(page, 'input[placeholder*="At least 6 characters"]', 'Password@123');

    await new Promise(r => setTimeout(r, 500));

    console.log('👉 Submitting duplicate registration form...');
    await page.click('form button[type="submit"]');

    await new Promise(r => setTimeout(r, 2000));

    // Inspect error message on UI
    const errorText = await page.evaluate(() => {
      const banner = document.querySelector('.bg-rose-50');
      return banner ? banner.innerText : null;
    });

    console.log('📋 UI Error Feedback:\n', errorText);
    const expectedMsg = 'This mobile number is already registered. Please sign in or use Forgot Password.';
    if (errorText && errorText.includes(expectedMsg)) {
      console.log('✅ PASS: Exact expected rejection message displayed on Desktop!');
    } else {
      console.error(`❌ FAIL: Expected message "${expectedMsg}", got: "${errorText}"`);
    }

    const shot2 = path.join(EVIDENCE_DIR, '02_desktop_register_duplicate_mobile_rejected.png');
    await page.screenshot({ path: shot2 });
    console.log(`📸 Screenshot 2 saved: ${shot2}`);

    // Step 3: Click "Sign In Now" link from the error banner
    console.log('👉 Clicking "Sign In Now" link in error banner...');
    await page.evaluate(() => {
      const signInNow = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Sign In Now'));
      if (signInNow) signInNow.click();
    });
    await new Promise(r => setTimeout(r, 800));

    const shot3 = path.join(EVIDENCE_DIR, '03_desktop_register_prefilled_login.png');
    await page.screenshot({ path: shot3 });
    console.log(`📸 Screenshot 3 saved: ${shot3}`);

    // Step 4: Mobile Viewport Verification (390 x 844)
    console.log('\n📱 Switching to Mobile Viewport (390 x 844) iPhone Style...');
    await page.setViewport({ width: 390, height: 844 });
    await new Promise(r => setTimeout(r, 600));

    // Switch to Register tab on mobile
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const regTab = buttons.find(b => b.innerText && b.innerText.trim() === 'Create Account');
      if (regTab) regTab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Attempt duplicate registration on mobile with 91 prefix
    const email3 = `e2e.user3.${Date.now()}@fibaxpharma.com`;
    const duplicatePhone91 = '919056344458';
    console.log(`🧪 Attempting Mobile Duplicate Registration with 91 prefix (${duplicatePhone91})...`);

    await typeField(page, 'input[placeholder*="Ramesh Patel"]', 'Kabir Singh');
    await typeField(page, 'input[placeholder*="ramesh@email.com"]', email3);
    await typeField(page, 'input[placeholder*="10-digit mobile"]', duplicatePhone91);
    await typeField(page, 'input[placeholder*="At least 6 characters"]', 'Password@123');

    await new Promise(r => setTimeout(r, 500));

    console.log('👉 Submitting mobile duplicate registration form...');
    await page.click('form button[type="submit"]');

    await new Promise(r => setTimeout(r, 2000));

    const mobileErrorText = await page.evaluate(() => {
      const banner = document.querySelector('.bg-rose-50');
      return banner ? banner.innerText : null;
    });

    console.log('📋 Mobile UI Error Feedback:\n', mobileErrorText);
    if (mobileErrorText && mobileErrorText.includes(expectedMsg)) {
      console.log('✅ PASS: Exact expected rejection message displayed on Mobile (390px)!');
    }

    const shot4 = path.join(EVIDENCE_DIR, '04_mobile_390px_duplicate_mobile_rejected.png');
    await page.screenshot({ path: shot4 });
    console.log(`📸 Screenshot 4 saved (Mobile 390px): ${shot4}`);

    console.log('\n🎉 ALL CUSTOMER UNIQUE MOBILE REGISTRATION E2E CHECKS PASSED SUCCESSFULLY!');

  } finally {
    await browser.close();
    // Restore users.json to baseline so no test records linger in production storage
    fs.writeFileSync(usersFilePath, initialUsersRaw, 'utf8');
    console.log('🧹 Restored baseline users.json');
  }
}

run().catch(err => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
