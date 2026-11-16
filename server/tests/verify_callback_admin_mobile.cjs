const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = 'C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence';

const VIEWPORTS = [
  { width: 320, height: 700, name: '320px_mobile_small' },
  { width: 360, height: 740, name: '360px_galaxy_s8' },
  { width: 375, height: 667, name: '375px_iphone_se' },
  { width: 390, height: 844, name: '390px_iphone_13' },
  { width: 412, height: 915, name: '412px_pixel_7' },
  { width: 430, height: 932, name: '430px_iphone_14_pro_max' }
];

async function runMobileAudit() {
  console.log('📱 Auditing Doctor Callback Admin UI on Mobile Viewports...');

  const { generateAdminToken } = await import('../middleware/auth.js');
  const adminToken = generateAdminToken('admin');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();

  try {
    // Inject token
    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('fibax_admin_token', tok);
      localStorage.setItem('fibax_admin_user', 'admin');
    }, adminToken);

    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
      await page.goto('http://localhost:3030/admin?tab=users&subtab=callbacks', { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 1000));

      const screenshotPath = path.join(EVIDENCE_DIR, `callback_admin_mobile_${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Saved screenshot for ${vp.name}`);
    }

    console.log('✅ Mobile viewport audit completed successfully!');
  } finally {
    await browser.close();
  }
}

runMobileAudit().catch(err => {
  console.error('❌ Mobile audit error:', err);
  process.exit(1);
});
