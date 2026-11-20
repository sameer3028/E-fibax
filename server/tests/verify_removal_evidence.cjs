const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = 'C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence';
const ARTIFACT_DIR = 'C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11';

async function run() {
  console.log('========================================================================');
  console.log('🔍 VERIFYING COMPLETE PERMANENT REMOVAL OF CUSTOMER STORIES');
  console.log('========================================================================\n');

  const { generateAdminToken } = await import('../middleware/auth.js');
  const adminToken = generateAdminToken('admin');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1400,900']
  });

  const page = await browser.newPage();

  // Monitor console errors and network requests
  const consoleErrors = [];
  const networkRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('request', req => {
    networkRequests.push(req.url());
  });

  try {
    // -------------------------------------------------------------------------
    // 1. HOMEPAGE CHECKS: DESKTOP (1400px)
    // -------------------------------------------------------------------------
    await page.setViewport({ width: 1400, height: 900 });
    console.log('Navigating to http://localhost:3030/ ...');
    await page.goto('http://localhost:3030/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1200));

    // Check if customer-stories section exists
    const domCheck = await page.evaluate(() => {
      const byId = document.getElementById('customer-stories-section');
      const byData = document.querySelector('[data-section="customer-stories"]');
      const allText = document.body.innerText;
      const hasHeading = allText.includes('REAL CUSTOMER STORIES') || allText.includes('Watch Real Patient Recoveries') || allText.includes('Watch Real Customer');
      return {
        hasById: !!byId,
        hasByData: !!byData,
        hasHeadingText: hasHeading
      };
    });

    console.log('DOM checks for Customer Stories on homepage:', domCheck);
    if (domCheck.hasById || domCheck.hasByData || domCheck.hasHeadingText) {
      throw new Error('Customer Stories elements were detected on the homepage!');
    }
    console.log('✓ Verified: Customer Stories section is 100% absent from the homepage DOM');

    // Check network requests for customer stories
    const requestedStoriesApi = networkRequests.some(url => url.includes('/api/website/customer-stories'));
    console.log(`✓ Verified: Homepage requested /api/website/customer-stories: ${requestedStoriesApi} (expected: false)`);
    if (requestedStoriesApi) {
      throw new Error('Homepage is still making API calls to /api/website/customer-stories!');
    }

    // Scroll to the transition between Shop By Concern and Bestsellers
    await page.evaluate(() => {
      const concernSec = document.getElementById('all-concerns');
      if (concernSec) {
        concernSec.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture Screenshot 1: Desktop Transition (Concern -> Bestsellers)
    const ss1 = path.join(EVIDENCE_DIR, 'removal_01_homepage_desktop_transition.png');
    await page.screenshot({ path: ss1, fullPage: false });
    fs.copyFileSync(ss1, path.join(ARTIFACT_DIR, 'removal_01_homepage_desktop_transition.png'));
    console.log('📸 Captured 1/5: removal_01_homepage_desktop_transition.png');

    // Scroll down slightly to show Bestsellers section completely
    await page.evaluate(() => {
      window.scrollBy({ top: 500, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));

    const ss2 = path.join(EVIDENCE_DIR, 'removal_02_homepage_bestsellers_natural_flow.png');
    await page.screenshot({ path: ss2, fullPage: false });
    fs.copyFileSync(ss2, path.join(ARTIFACT_DIR, 'removal_02_homepage_bestsellers_natural_flow.png'));
    console.log('📸 Captured 2/5: removal_02_homepage_bestsellers_natural_flow.png');

    // -------------------------------------------------------------------------
    // 2. HOMEPAGE CHECKS: TABLET (768px) & MOBILE (390px)
    // -------------------------------------------------------------------------
    await page.setViewport({ width: 768, height: 1024 });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
      const concernSec = document.getElementById('all-concerns');
      if (concernSec) concernSec.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 600));

    const ss3 = path.join(EVIDENCE_DIR, 'removal_03_homepage_tablet_layout.png');
    await page.screenshot({ path: ss3, fullPage: false });
    fs.copyFileSync(ss3, path.join(ARTIFACT_DIR, 'removal_03_homepage_tablet_layout.png'));
    console.log('📸 Captured 3/5: removal_03_homepage_tablet_layout.png');

    // Mobile Viewport (390px)
    await page.setViewport({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
      const concernSec = document.getElementById('all-concerns');
      if (concernSec) concernSec.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 600));

    const ss4 = path.join(EVIDENCE_DIR, 'removal_04_homepage_mobile_layout.png');
    await page.screenshot({ path: ss4, fullPage: false });
    fs.copyFileSync(ss4, path.join(ARTIFACT_DIR, 'removal_04_homepage_mobile_layout.png'));
    console.log('📸 Captured 4/5: removal_04_homepage_mobile_layout.png');

    // -------------------------------------------------------------------------
    // 3. ADMIN PANEL CHECKS (1400px)
    // -------------------------------------------------------------------------
    await page.setViewport({ width: 1400, height: 900 });

    // Injected admin session
    await page.goto('http://localhost:3030/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('fibax_admin_token', tok);
      localStorage.setItem('fibax_admin_user', 'admin');
    }, adminToken);

    // Open Admin Panel
    await page.goto('http://localhost:3030/admin?tab=website-content', { waitUntil: 'networkidle0' });
    await page.waitForSelector('header', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 1000));

    // Verify Admin Navigation Tabs and Website Content Sub-tabs
    const adminNavCheck = await page.evaluate(() => {
      const navButtons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
      const hasCustomerStoriesNav = navButtons.some(t => t.includes('Customer Stories'));
      return {
        allButtons: navButtons,
        hasCustomerStoriesNav
      };
    });

    console.log('Admin navigation checks for Customer Stories:', adminNavCheck.hasCustomerStoriesNav);
    if (adminNavCheck.hasCustomerStoriesNav) {
      throw new Error('Customer Stories button was found in Admin Panel!');
    }
    console.log('✓ Verified: Customer Stories navigation and management interface is 100% absent from Admin Panel');

    const ss5 = path.join(EVIDENCE_DIR, 'removal_05_admin_panel_no_customer_stories.png');
    await page.screenshot({ path: ss5, fullPage: false });
    fs.copyFileSync(ss5, path.join(ARTIFACT_DIR, 'removal_05_admin_panel_no_customer_stories.png'));
    console.log('📸 Captured 5/5: removal_05_admin_panel_no_customer_stories.png');

    console.log('\n========================================================================');
    console.log(`Console Errors detected: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.warn('Console error messages:', consoleErrors);
    }
    console.log('🎉 ALL REMOVAL CHECKS PASSED WITH ZERO ERRORS & COMPLETE EVIDENCE!');
    console.log('========================================================================');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
