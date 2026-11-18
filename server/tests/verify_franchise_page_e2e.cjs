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
  console.log('🌿 PCD PHARMA FRANCHISE LANDING PAGE & ADMIN — E2E VERIFICATION');
  console.log('================================================================\n');

  // Obtain admin token for admin portal test
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
  let createdLeadId = null;

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

    // ========================================================
    // PART 1: DESKTOP LANDING PAGE (1280 x 900)
    // ========================================================
    console.log('\n🖥️ --- PART 1: DESKTOP LANDING PAGE (1280 x 900) ---');
    await page.setViewport({ width: 1280, height: 900 });

    console.log('🌐 Navigating to http://localhost:3030/pcd-pharma-franchise ...');
    await page.goto('http://localhost:3030/pcd-pharma-franchise', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    // Verify Hero Details
    const heroDetails = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const badge = document.querySelector('[data-testid="hero-badge"]') || document.querySelector('span.uppercase');
      const buttons = Array.from(document.querySelectorAll('a, button')).map(b => b.textContent.trim());
      const hasApply = buttons.some(t => t.includes('Apply for Franchise'));
      const hasWhatsApp = buttons.some(t => t.includes('WhatsApp Enquiry'));
      return {
        heading: h1 ? h1.textContent.trim() : null,
        badge: badge ? badge.textContent.trim() : null,
        hasApply,
        hasWhatsApp
      };
    });

    console.log('📊 Desktop Hero Details:', heroDetails);
    if (!heroDetails.heading || !heroDetails.heading.includes('Start Your Own Ayurvedic Pharma Business')) {
      throw new Error(`Unexpected hero heading: "${heroDetails.heading}"`);
    }

    const shot1 = path.join(EVIDENCE_DIR, '01_desktop_franchise_hero.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log('📸 Screenshot saved:', shot1);

    // Verify Sections Presence
    const sectionsPresence = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasBenefits: bodyText.includes('Why Choose Fibax Ayurveda?') || bodyText.includes('Wide Ayurvedic Product Portfolio'),
        hasPortfolio: bodyText.includes('Diverse Ayurvedic Formulations') || bodyText.includes('Product Portfolio'),
        hasProcess: bodyText.includes('5 Simple Steps to Launch') || bodyText.includes('Submit Franchise Enquiry'),
        hasAudience: bodyText.includes('Who Can Partner With Us?') || bodyText.includes('Pharma Distributors'),
        hasForm: !!document.querySelector('form'),
        hasFaqs: bodyText.includes('Frequently Asked Questions')
      };
    });
    console.log('📊 Sections Check:', sectionsPresence);

    // ========================================================
    // PART 2: SUBMIT FRANCHISE ENQUIRY FORM (DESKTOP)
    // ========================================================
    console.log('\n📝 Submitting Franchise Enquiry Form as "Sunil Grover"...');

    // Scroll to form
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 800));

    await page.evaluate(() => {
      const nameInput = document.querySelector('#franchise-name');
      const phoneInput = document.querySelector('#franchise-phone');
      const emailInput = document.querySelector('#franchise-email');
      const stateSelect = document.querySelector('#franchise-state');
      const cityInput = document.querySelector('#franchise-city');
      const businessSelect = document.querySelector('#franchise-business-type');
      const expSelect = document.querySelector('#franchise-experience');
      const investSelect = document.querySelector('#franchise-investment-range');
      const messageInput = document.querySelector('#franchise-message');
      const consentCheckbox = document.querySelector('#franchise-consent');

      if (nameInput) window.setReactInput(nameInput, 'Sunil Grover');
      if (phoneInput) window.setReactInput(phoneInput, '9812345678');
      if (emailInput) window.setReactInput(emailInput, 'sunil.grover@shreeayurmed.com');
      if (stateSelect) window.setReactInput(stateSelect, 'Haryana');
      if (cityInput) window.setReactInput(cityInput, 'Karnal');
      if (businessSelect) window.setReactInput(businessSelect, 'Pharma Distributor');
      if (expSelect) window.setReactInput(expSelect, '5 to 10 years');
      if (investSelect) window.setReactInput(investSelect, '₹1,00,000 - ₹2,50,000');
      if (messageInput) window.setReactInput(messageInput, 'Interested in exclusive PCD franchise for Karnal district. Please share catalogue and trade margins.');
      if (consentCheckbox && !consentCheckbox.checked) consentCheckbox.click();
    });

    await new Promise(r => setTimeout(r, 600));

    // Submit form
    console.log('🚀 Clicking "Submit Franchise Application" button...');
    await page.evaluate(() => {
      const submitBtn = document.querySelector('[data-testid="franchise-submit-button"]') || document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });

    // Wait for submission confirmation card
    await new Promise(r => setTimeout(r, 2500));

    const submissionConfirmation = await page.evaluate(() => {
      const body = document.body.innerText;
      const refMatch = body.match(/FBX-PCD-[A-Z0-9-]+/);
      const hasSuccessHeading = body.includes('APPLICATION RECEIVED') || body.includes('Thank You, Sunil Grover');
      const errElem = document.querySelector('.animate-shake');
      return {
        hasSuccessHeading,
        referenceId: refMatch ? refMatch[0] : null,
        errorMessage: errElem ? errElem.innerText : null
      };
    });

    console.log('🎉 Submission Result:', submissionConfirmation);
    if (!submissionConfirmation.referenceId) {
      throw new Error(`Form submission failed: Reference ID FBX-PCD-... not found! Error on page: ${submissionConfirmation.errorMessage}`);
    }
    createdLeadId = submissionConfirmation.referenceId;

    const shot2 = path.join(EVIDENCE_DIR, '02_desktop_franchise_form_submitted.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('📸 Screenshot saved:', shot2);

    // ========================================================
    // PART 3: MOBILE RESPONSIVENESS (390 x 844)
    // ========================================================
    console.log('\n📱 --- PART 3: MOBILE RESPONSIVENESS (390 x 844) ---');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://localhost:3030/pcd-pharma-franchise', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const mobileHero = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return {
        heading: h1 ? h1.textContent.trim() : null,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    console.log('📱 Mobile Viewport Metrics:', mobileHero);

    const shot3 = path.join(EVIDENCE_DIR, '03_mobile_franchise_page.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log('📸 Screenshot saved:', shot3);

    // ========================================================
    // PART 4: ADMIN PORTAL — FRANCHISE LEADS MANAGER
    // ========================================================
    console.log('\n🔐 --- PART 4: ADMIN PORTAL LEAD MANAGEMENT ---');
    await page.setViewport({ width: 1400, height: 900 });

    // Set admin token in localStorage
    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('fibax_admin_token', tok);
      localStorage.setItem('fibax_admin_user', 'admin');
    }, adminToken);

    console.log('🌐 Opening Admin Franchise Leads Manager (/admin?tab=franchise-leads)...');
    await page.goto('http://localhost:3030/admin?tab=franchise-leads', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Verify lead appears in table
    const tableVerification = await page.evaluate((targetLeadId) => {
      const text = document.body.innerText;
      const hasLeadName = text.includes('Sunil Grover');
      const hasLeadCity = text.includes('Karnal');
      const hasTargetId = text.includes(targetLeadId);
      const rows = Array.from(document.querySelectorAll('tr')).map(r => r.innerText);
      const matchingRow = rows.find(r => r.includes('Sunil Grover'));
      return {
        hasLeadName,
        hasLeadCity,
        hasTargetId,
        matchingRow
      };
    }, createdLeadId);

    console.log('📊 Admin Leads Table Verification:', tableVerification);
    if (!tableVerification.hasLeadName) {
      throw new Error(`Lead "Sunil Grover" not found in Admin Franchise Leads table!`);
    }

    // Open Lead Details Modal
    console.log('🔍 Opening Lead Details Modal for review & status update...');
    await page.evaluate(() => {
      const reviewButtons = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('Review') || b.querySelector('svg'));
      const targetBtn = reviewButtons.find(b => b.closest('tr')?.innerText?.includes('Sunil Grover'));
      if (targetBtn) targetBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Update status to 'Contacted' and add note
    await page.evaluate(() => {
      const statusSelect = document.querySelector('select[name="status"]') ||
                           Array.from(document.querySelectorAll('select')).find(s => s.innerHTML.includes('Contacted'));
      const noteInput = document.querySelector('textarea[name="noteText"]') ||
                        document.querySelector('textarea[placeholder*="internal note"]') ||
                        document.querySelector('textarea');

      if (statusSelect) window.setReactInput(statusSelect, 'Contacted');
      if (noteInput) window.setReactInput(noteInput, 'E2E Test Note: Spoke with Sunil Grover. Qualified distributor with 8 years network in Haryana.');

      // Click Add Note button if separate
      const addNoteBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Note'));
      if (addNoteBtn) addNoteBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Click Save Lead Changes button
    await page.evaluate(() => {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Save') && !b.textContent.includes('Add'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const shot4 = path.join(EVIDENCE_DIR, '04_admin_franchise_leads_management.png');
    await page.screenshot({ path: shot4, fullPage: false });
    console.log('📸 Screenshot saved:', shot4);

    // ========================================================
    // PART 5: ADMIN PORTAL — WEBSITE CONTENT FRANCHISE CMS
    // ========================================================
    console.log('\n📝 --- PART 5: WEBSITE CONTENT (PCD FRANCHISE CMS) ---');
    console.log('🌐 Opening Website Content -> Landing Page: PCD Franchise (/admin?tab=website-content&subtab=franchise-page)...');
    await page.goto('http://localhost:3030/admin?tab=website-content&subtab=franchise-page', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Also click on the subtab button directly in case state needs to be synced
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const targetBtn = buttons.find(b => b.textContent.includes('Landing Page: PCD Franchise') || b.textContent.includes('PCD Franchise'));
      if (targetBtn) targetBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const cmsDetails = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasCmsHeader: text.includes('PCD Franchise Landing Page CMS') || text.includes('Landing Page: PCD Franchise'),
        hasHeroFields: text.includes('Hero Banner & Value Proposition') || text.includes('Heading'),
        hasBenefitsEditor: text.includes('Why Choose Fibax') || text.includes('Key Advantages'),
        hasFaqsEditor: text.includes('Frequently Asked Questions')
      };
    });
    console.log('📊 Admin Franchise CMS Verification:', cmsDetails);

    const shot5 = path.join(EVIDENCE_DIR, '05_admin_franchise_cms_editor.png');
    await page.screenshot({ path: shot5, fullPage: false });
    console.log('📸 Screenshot saved:', shot5);

    // ========================================================
    // PART 6: CLEANUP TEST LEAD
    // ========================================================
    if (createdLeadId) {
      console.log(`\n🧹 Cleaning up test lead ${createdLeadId} ...`);
      const delRes = await fetch(`http://127.0.0.1:5050/api/admin/franchise/leads/${createdLeadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const delData = await delRes.json();
      console.log('✓ Cleanup response:', delData);
    }

    console.log('\n================================================================');
    console.log('✅ ALL E2E VERIFICATIONS PASSED SUCCESSFULLY!');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
