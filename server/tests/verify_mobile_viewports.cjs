const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = path.resolve('C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence');
const delay = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const authModule = await import('../middleware/auth.js');
  const adminToken = authModule.generateAdminToken('admin');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const viewports = [
    { width: 320, height: 568, name: '320px_mobile_small' },
    { width: 360, height: 740, name: '360px_galaxy_s8' },
    { width: 375, height: 667, name: '375px_iphone_se' },
    { width: 412, height: 915, name: '412px_pixel_7' },
    { width: 430, height: 932, name: '430px_iphone_14_pro_max' }
  ];

  const page = await browser.newPage();
  await page.goto('http://localhost:3030/admin?tab=orders', { waitUntil: 'domcontentloaded' });
  await page.evaluate((token) => {
    localStorage.setItem('fibax_admin_token', token);
    localStorage.setItem('fibax_admin_user', 'admin');
  }, adminToken);
  await page.goto('http://localhost:3030/admin?tab=orders', { waitUntil: 'networkidle0' });
  await delay(1200);

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: true, hasTouch: true });
    await delay(500);
    const ssPath = path.join(EVIDENCE_DIR, `cancel_admin_mobile_${vp.name}.png`);
    await page.screenshot({ path: ssPath, fullPage: false });
    console.log(`📸 Captured: ${ssPath}`);
  }

  await browser.close();
  console.log('✅ Mobile multi-viewport screenshots captured.');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
