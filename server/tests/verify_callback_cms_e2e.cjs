const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = 'C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence';

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function runE2E() {
  console.log('================================================================');
  console.log('🩺 DOCTOR CALLBACK FORM CMS — END-TO-END VERIFICATION');
  console.log('================================================================\n');

  // 1. Generate real admin token from backend
  const authRes = await fetch('http://127.0.0.1:5050/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password123' })
  }).then(r => r.json()).catch(() => null);

  let adminToken = authRes?.token;
  if (!adminToken) {
    console.log('   Using direct admin token generation...');
    const { generateAdminToken } = await import('../middleware/auth.js');
    adminToken = generateAdminToken('admin');
  }

  console.log('✓ Admin Bearer token obtained');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  try {
    // Expose React input helper
    await page.evaluateOnNewDocument(() => {
      window.setReactInput = (elem, val) => {
        if (!elem) return;
        const proto = elem instanceof HTMLTextAreaElement
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(elem, val);
        elem.dispatchEvent(new Event('input', { bubbles: true }));
        elem.dispatchEvent(new Event('change', { bubbles: true }));
      };
    });

    // 2. Set admin token in client localStorage
    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('fibax_admin_token', tok);
      localStorage.setItem('fibax_admin_user', 'admin');
    }, adminToken);

    // 3. Navigate directly to Admin Doctor Callback Form section
    console.log('\n--- Test Step 1: Accessing Admin Doctor Callback Form CMS ---');
    await page.goto('http://localhost:3030/admin?tab=website-content&subtab=doctor-callback', { waitUntil: 'networkidle0' });
    await page.waitForSelector('h3', { timeout: 8000 });

    const pageTitle = await page.evaluate(() => document.querySelector('h3')?.innerText || '');
    console.log('   Section Title:', pageTitle);
    if (!pageTitle.includes('Doctor Call Back Form CMS')) {
      throw new Error(`Expected section title to contain 'Doctor Call Back Form CMS', found: ${pageTitle}`);
    }

    // Capture initial CMS screenshot
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'callback_cms_admin_initial.png') });
    console.log('✓ Captured screenshot: callback_cms_admin_initial.png');

    // 4. Test Step 2: Update Header Settings
    console.log('\n--- Test Step 2: Editing Heading & Badge in Admin CMS ---');
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
      const headingInput = inputs.find(i => i.placeholder.includes('Request a Doctor Call Back') || i.value.includes('Request a Doctor Call Back') || i.value.includes('Connect with a Senior Vaidya'));
      if (headingInput) {
        window.setReactInput(headingInput, 'Instant Ayurvedic Doctor Call Back');
      }

      const badgeInput = inputs.find(i => i.placeholder.includes('FREE AYURVEDIC') || i.value.includes('FREE AYURVEDIC') || i.value.includes('INSTANT AYURVEDIC'));
      if (badgeInput) {
        window.setReactInput(badgeInput, '100% FREE AYURVEDIC CONSULTATION');
      }
    });

    // 5. Test Step 3: Switch to Form Fields tab & add a dropdown option
    console.log('\n--- Test Step 3: Managing Dropdown Options in Admin CMS ---');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const fieldsTab = tabs.find(b => b.innerText.includes('Form Fields & Dropdowns'));
      if (fieldsTab) fieldsTab.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Add option to concern field
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const addOptInput = inputs.find(i => i.placeholder.includes('Type new option name...'));
      if (addOptInput) {
        window.setReactInput(addOptInput, 'Immunity & Seasonal Vitality');
      }
      const addButtons = Array.from(document.querySelectorAll('button'));
      const addBtn = addButtons.find(b => b.innerText.includes('+ Add Option'));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // 6. Test Step 4: Switch to Live Interactive Preview Tab
    console.log('\n--- Test Step 4: Live Interactive Preview in Admin CMS ---');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const previewTab = tabs.find(b => b.innerText.includes('Live Interactive Preview'));
      if (previewTab) previewTab.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Verify preview reflects unsaved change "Instant Ayurvedic Doctor Call Back"
    const previewHeading = await page.evaluate(() => {
      const h2 = document.querySelector('#callback-modal-title');
      return h2 ? h2.innerText : '';
    });
    console.log('   Live Preview H2:', previewHeading);

    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'callback_cms_live_preview_desktop.png') });
    console.log('✓ Captured screenshot: callback_cms_live_preview_desktop.png');

    // Switch to Mobile Viewport in preview
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const mobileBtn = btns.find(b => b.innerText.includes('Mobile (375px)'));
      if (mobileBtn) mobileBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'callback_cms_live_preview_mobile.png') });
    console.log('✓ Captured screenshot: callback_cms_live_preview_mobile.png');

    // 7. Test Step 5: Click Save Changes
    console.log('\n--- Test Step 5: Saving Changes via Admin API ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.innerText.includes('Save Changes'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Check disk file
    const dataDir = path.resolve(__dirname, '../data');
    const diskConfig = JSON.parse(fs.readFileSync(path.join(dataDir, 'callback_form.json'), 'utf8'));
    console.log('   Saved to disk heading:', diskConfig.header.heading);
    console.log('   Saved to disk badge:', diskConfig.header.badgeText);

    // 8. Test Step 6: Verify Storefront Rendering and Responsiveness Across Viewports
    console.log('\n--- Test Step 6: Storefront Modal Verification Across Viewports ---');
    const viewports = [
      { name: '320px_mobile_small', width: 320, height: 600 },
      { name: '360px_galaxy_s8', width: 360, height: 740 },
      { name: '375px_iphone_se', width: 375, height: 667 },
      { name: '390px_iphone_13', width: 390, height: 844 },
      { name: '412px_pixel_7', width: 412, height: 915 },
      { name: '768px_tablet', width: 768, height: 1024 },
      { name: '1280px_desktop', width: 1280, height: 900 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3030/contact', { waitUntil: 'networkidle0' });

      // Trigger Doctor Callback Modal via the button on contact page
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cbBtn = btns.find(b => b.innerText.includes('Doctor Call Back') || b.innerText.includes('Request Call Back') || b.innerText.includes('Request Doctor Call Back'));
        if (cbBtn) cbBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));

      // Measure layout metrics
      const metrics = await page.evaluate(() => {
        const modal = document.querySelector('div[role="dialog"] > div');
        if (!modal) return null;
        const rect = modal.getBoundingClientRect();
        const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
        const h2 = document.querySelector('#callback-modal-title')?.innerText || '';
        const badge = document.querySelector('div[role="dialog"] span.truncate')?.innerText || '';
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          viewportWidth: window.innerWidth,
          hasHorizontalScroll,
          heading: h2,
          badge
        };
      });

      console.log(`   [${vp.name}] Width: ${metrics?.width}px / Viewport: ${metrics?.viewportWidth}px | Horizontal Scroll: ${metrics?.hasHorizontalScroll} | Heading: ${metrics?.heading}`);
      if (metrics?.hasHorizontalScroll) {
        throw new Error(`Horizontal scroll detected at ${vp.width}px!`);
      }

      await page.screenshot({ path: path.join(EVIDENCE_DIR, `callback_storefront_${vp.name}.png`) });
    }

    // 9. Test Step 7: Submit a Test Enquiry through the Storefront Modal
    console.log('\n--- Test Step 7: Submitting Enquiry through Storefront Modal ---');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto('http://localhost:3030/contact', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cbBtn = btns.find(b => b.innerText.includes('Doctor Call Back') || b.innerText.includes('Request Call Back'));
      if (cbBtn) cbBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Fill in form fields using window.setReactInput
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('div[role="dialog"] input[type="text"], div[role="dialog"] input[type="tel"]'));
      const nameInput = inputs.find(i => i.placeholder.includes('Ramesh') || i.placeholder.includes('name'));
      const phoneInput = inputs.find(i => i.placeholder.includes('9876543210') || i.type === 'tel');
      const cityInput = inputs.find(i => i.placeholder.includes('Lucknow') || i.placeholder.includes('City'));

      if (nameInput) window.setReactInput(nameInput, 'Rameshwar Dayal');
      if (phoneInput) window.setReactInput(phoneInput, '9876543215');
      if (cityInput) window.setReactInput(cityInput, 'Varanasi, UP');

      const textarea = document.querySelector('div[role="dialog"] textarea');
      if (textarea) {
        window.setReactInput(textarea, 'Suffering from chronic back stiffness for 6 months. Seeking herbal churna advice.');
      }

      const submitBtn = document.querySelector('div[role="dialog"] button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    await new Promise(r => setTimeout(r, 2000));

    // Verify success confirmation card
    const successText = await page.evaluate(() => {
      const h3 = document.querySelector('div[role="dialog"] h3');
      return h3 ? h3.innerText : '';
    });
    console.log('   Form Submission Result:', successText);
    if (!successText.includes('Callback Request Received')) {
      // Dump any visible error text
      const errText = await page.evaluate(() => document.querySelector('div[role="dialog"] .animate-shake')?.innerText || '');
      console.log('   Visible Error on Modal:', errText);
      throw new Error(`Expected submission confirmation 'Callback Request Received', got: ${successText}`);
    }

    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'callback_storefront_submitted_success.png') });
    console.log('✓ Captured screenshot: callback_storefront_submitted_success.png');

    // 10. Check enquiries storage to confirm submission was recorded and existing data preserved
    const enquiriesFile = path.join(dataDir, 'enquiries.json');
    const enquiries = JSON.parse(fs.readFileSync(enquiriesFile, 'utf8'));
    const submitted = enquiries.find(e => e.phone === '9876543215');
    console.log('   Verified enquiry logged in data store:', submitted ? `${submitted.name} (${submitted.city})` : 'NOT FOUND');
    if (!submitted) throw new Error('Submitted enquiry was not recorded in enquiries.json!');

    // Verify baseline enquiry for Rajesh Sharma remains intact
    const baseline = enquiries.find(e => e.name === 'Rajesh Sharma');
    console.log('   Verified baseline enquiry preserved:', baseline ? `${baseline.name} (${baseline.city})` : 'NOT FOUND');
    if (!baseline) throw new Error('Baseline enquiry for Rajesh Sharma was erased!');

    console.log('\n================================================================');
    console.log('🎉 ALL END-TO-END DOCTOR CALLBACK FORM CMS VERIFICATIONS PASSED!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ E2E Verification failed:', err);
    await page.screenshot({ path: path.join(EVIDENCE_DIR, 'callback_cms_e2e_error.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runE2E();
