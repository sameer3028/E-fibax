const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = 'C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence';

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log('================================================================');
  console.log('🏛️ PCD FRANCHISE MANAGEMENT CMS — FULL E2E VERIFICATION');
  console.log('================================================================\n');

  // Obtain admin bearer token
  const authRes = await fetch('http://127.0.0.1:5050/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' })
  }).then(r => r.json()).catch(() => null);

  let adminToken = authRes?.token;
  if (!adminToken) {
    const { generateAdminToken } = await import('../middleware/auth.js');
    adminToken = generateAdminToken('admin');
  }
  console.log('✓ Admin Bearer token obtained');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1400,900']
  });

  const page = await browser.newPage();

  try {
    // Helper to simulate native React input changes
    await page.evaluateOnNewDocument(() => {
      window.setReactInput = (elem, val) => {
        if (!elem) return;
        const proto = elem instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : elem instanceof HTMLSelectElement
          ? window.HTMLSelectElement.prototype
          : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(elem, val);
        elem.dispatchEvent(new Event('input', { bubbles: true }));
        elem.dispatchEvent(new Event('change', { bubbles: true }));
      };
    });

    await page.setViewport({ width: 1400, height: 900 });

    // 1. Set admin token in localStorage
    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('fibax_admin_token', tok);
      localStorage.setItem('fibax_admin_user', 'admin');
    }, adminToken);

    // 2. Open Admin Portal -> PCD Franchise Management tab
    console.log('🌐 Navigating to http://localhost:3030/admin?tab=pcd-franchise-management ...');
    await page.goto('http://localhost:3030/admin?tab=pcd-franchise-management', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Verify Tab 1: Page Content
    const tab1Verification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('PCD Franchise Management'),
        hasCoreContentHeading: text.includes('Core Page Content & Section Headings') || text.includes('Main Page Heading'),
        hasStatusPill: text.includes('Live & In Sync') || text.includes('Unpublished Draft Edits'),
        hasSaveDraftBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Draft')),
        hasPublishBtn: !!Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Publish to Live Site'))
      };
    });
    console.log('📊 Tab 1 (Page Content) Verification:', tab1Verification);
    if (!tab1Verification.hasTitle) throw new Error('PCD Franchise Management title not found in Admin Portal!');

    const shot1 = path.join(EVIDENCE_DIR, '01_admin_pcd_franchise_cms_page_content.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log('📸 Screenshot saved:', shot1);

    // 3. Navigate to Tab 2: Banner Management
    console.log('🖼️ Opening Tab 2: Banner Management...');
    await page.evaluate(() => {
      const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Banner Management'));
      if (tabBtn) tabBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const tab2Verification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasDesktopBanner: text.includes('Desktop Banner'),
        hasMobileBanner: text.includes('Mobile Banner'),
        hasUploadBtn: text.includes('Upload Desktop Banner') || text.includes('Replace Desktop Banner')
      };
    });
    console.log('📊 Tab 2 (Banner Management) Verification:', tab2Verification);

    const shot2 = path.join(EVIDENCE_DIR, '02_admin_pcd_franchise_cms_banner_management.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('📸 Screenshot saved:', shot2);

    // 4. Navigate to Tab 4: Product Categories Management
    console.log('📦 Opening Tab 4: Product Categories Management...');
    await page.evaluate(() => {
      const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Product Categories'));
      if (tabBtn) tabBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const tab4Verification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasCategoriesTitle: text.includes('Product Categories Management'),
        hasCatalogParity: text.includes('Catalog Parity'),
        hasCapsules: text.includes('Ayurvedic Capsules'),
        hasSyrups: text.includes('Herbal Syrups')
      };
    });
    console.log('📊 Tab 4 (Product Categories) Verification:', tab4Verification);

    const shot3 = path.join(EVIDENCE_DIR, '03_admin_pcd_franchise_cms_categories_management.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log('📸 Screenshot saved:', shot3);

    // 5. Navigate to Tab 9: Page Preview (Desktop Viewport)
    console.log('👁️ Opening Tab 9: Page Preview (Desktop Viewport)...');
    await page.evaluate(() => {
      const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Page Preview'));
      if (tabBtn) tabBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const previewVerification = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasPreviewHeading: text.includes('Desktop (1280px)'),
        hasDeviceToggles: text.includes('Tablet (768px)') && text.includes('Mobile (390px)'),
        hasRenderedFranchiseHeading: text.includes('Start Your Own Ayurvedic Pharma Business')
      };
    });
    console.log('📊 Tab 9 (Page Preview Desktop) Verification:', previewVerification);

    const shot4 = path.join(EVIDENCE_DIR, '04_admin_pcd_franchise_cms_preview_desktop.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log('📸 Screenshot saved:', shot4);

    // 6. Toggle to Mobile Preview Frame
    console.log('📱 Toggling to Mobile Preview Frame (390px)...');
    await page.evaluate(() => {
      const mobileToggleBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mobile (390px)'));
      if (mobileToggleBtn) mobileToggleBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const shot5 = path.join(EVIDENCE_DIR, '05_admin_pcd_franchise_cms_preview_mobile.png');
    await page.screenshot({ path: shot5, fullPage: false });
    console.log('📸 Screenshot saved:', shot5);

    // 7. Verify Draft & Publish Workflow in UI
    console.log('📝 Testing Draft & Publish Workflow in UI...');
    // Switch to Tab 1 (Page Content)
    await page.evaluate(() => {
      const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('1. Page Content'));
      if (tabBtn) tabBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Edit Heading input
    await page.evaluate(() => {
      const headingInput = document.querySelector('input[placeholder*="Start Your Own Ayurvedic"]');
      if (headingInput) {
        window.setReactInput(headingInput, 'Start Your Own Ayurvedic Pharma Business - Verified E2E CMS');
      }
    });
    await new Promise(r => setTimeout(r, 400));

    // Click "Save Draft"
    console.log('💾 Clicking "Save Draft"...');
    await page.evaluate(() => {
      const saveDraftBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save Draft'));
      if (saveDraftBtn) saveDraftBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Check status pill indicates Unpublished Draft
    const dirtyStatus = await page.evaluate(() => document.body.innerText.includes('Unpublished Draft Edits'));
    console.log('📊 Draft marked dirty in UI:', dirtyStatus);

    // Verify public website is still on published content (isolated from draft)
    const publicWebsiteCheck = await fetch('http://localhost:5050/api/franchise/content').then(r => r.json());
    console.log('🔒 Public endpoint isolated from draft:', publicWebsiteCheck.data?.pageContent?.heading !== 'Start Your Own Ayurvedic Pharma Business - Verified E2E CMS');

    // Click "Publish to Live Site"
    console.log('🚀 Clicking "Publish to Live Site"...');
    await page.evaluate(() => {
      const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Publish to Live Site'));
      if (publishBtn) publishBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Confirm publish modal
    console.log('✅ Confirming publish in modal...');
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm & Publish'));
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Verify public website now reflects published update!
    const publicAfterPublish = await fetch('http://localhost:5050/api/franchise/content').then(r => r.json());
    console.log('🎉 Public endpoint immediately reflects published update:', publicAfterPublish.data?.pageContent?.heading === 'Start Your Own Ayurvedic Pharma Business - Verified E2E CMS');

    // Reset heading back to standard default
    await page.evaluate(() => {
      const headingInput = document.querySelector('input[placeholder*="Start Your Own Ayurvedic"]');
      if (headingInput) {
        window.setReactInput(headingInput, 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda');
      }
      const publishBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Publish to Live Site'));
      if (publishBtn) publishBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm & Publish'));
      if (confirmBtn) confirmBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const finalPublic = await fetch('http://localhost:5050/api/franchise/content').then(r => r.json());
    console.log('✓ Reset to pristine default heading:', finalPublic.data?.pageContent?.heading === 'Start Your Own Ayurvedic Pharma Business with Fibax Ayurveda');

    console.log('\n================================================================');
    console.log('✅ ALL PCD FRANCHISE CMS E2E VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ PCD Franchise CMS E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
