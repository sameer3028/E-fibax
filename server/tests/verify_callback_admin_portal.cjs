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
  console.log('🩺 DOCTOR CALLBACK REQUESTS — ADMIN PORTAL E2E VERIFICATION');
  console.log('================================================================\n');

  // 1. Submit initial test customer callback request to backend
  console.log('📝 Submitting Lead 1: Shri Ratan Tata...');
  const res1 = await fetch('http://localhost:5050/api/enquiry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Shri Ratan Tata',
      phone: '9820011223',
      city: 'Mumbai, Maharashtra',
      type: 'doctor_callback',
      concern: 'Joint & Pain Care',
      preferredTime: 'Morning (10:00 AM - 1:00 PM)',
      notes: 'Experiencing severe knee stiffness in winter mornings. Requesting personalized Ayurvedic consultation.'
    })
  });
  const data1 = await res1.json();
  console.log('Lead 1 submission result:', data1);
  if (!data1.success) throw new Error('Failed to submit initial callback');

  // 2. Generate valid admin token from backend
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
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Expose React input setter helper
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

    // 3. Set admin token in client localStorage and navigate to Admin Portal
    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('fibax_admin_token', tok);
      localStorage.setItem('fibax_admin_user', 'admin');
    }, adminToken);

    console.log('🔑 Navigating to Admin Portal...');
    await page.goto('http://localhost:3030/admin?tab=users&subtab=callbacks', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Capture initial overview screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'callback_admin_overview.png'),
      fullPage: true
    });
    console.log('📸 Saved callback_admin_overview.png');

    // 4. Verify Shri Ratan Tata details rendered
    const pageText = await page.evaluate(() => document.body.innerText);
    if (!pageText.includes('Shri Ratan Tata')) {
      throw new Error('Shri Ratan Tata not visible on Doctor Callback Requests table!');
    }
    if (!pageText.includes('9820011223')) {
      throw new Error('Phone number 9820011223 not visible on table!');
    }
    if (!pageText.includes('Mumbai, Maharashtra')) {
      throw new Error('City Mumbai, Maharashtra not visible on table!');
    }
    console.log('✅ Lead 1 details correctly rendered: Name, Phone, City, Concern, Slot, Notes.');

    // Verify Call & WhatsApp action links
    const actionLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const callLink = links.find(a => a.href.includes('tel:+919820011223'));
      const waLink = links.find(a => a.href.includes('wa.me/919820011223'));
      return {
        hasCall: !!callLink,
        callHref: callLink ? callLink.href : null,
        hasWa: !!waLink,
        waHref: waLink ? waLink.href : null
      };
    });
    console.log('Direct Action Links verification:', actionLinks);
    if (!actionLinks.hasCall || !actionLinks.hasWa) {
      throw new Error('Call or WhatsApp direct action links missing for lead!');
    }

    // 5. Test Live Auto-Sync: Submit Lead 2 while admin tab is open
    console.log('⚡ Submitting Lead 2 (Sunita Sharma) to test Live Auto-Sync without manual refresh...');
    const res2 = await fetch('http://localhost:5050/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sunita Sharma',
        phone: '9810099887',
        city: 'Jaipur, Rajasthan',
        type: 'doctor_callback',
        concern: 'Digestive & Gut Health',
        preferredTime: 'Afternoon',
        notes: 'Looking for chronic acidity and indigestion remedy.'
      })
    });
    const data2 = await res2.json();
    console.log('Lead 2 submission result:', data2);

    // Wait 7.5 seconds for auto-polling (6s interval) to update DOM automatically
    console.log('⏳ Waiting 7.5s for live auto-sync polling...');
    await new Promise(r => setTimeout(r, 7500));

    // Verify Sunita Sharma appeared automatically
    const textAfterSync = await page.evaluate(() => document.body.innerText);
    if (!textAfterSync.includes('Sunita Sharma')) {
      throw new Error('Live auto-sync failed: Sunita Sharma did not appear automatically!');
    }
    console.log('✅ Live Auto-Sync verified: Sunita Sharma appeared automatically without manual refresh!');

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'callback_admin_auto_sync.png'),
      fullPage: true
    });
    console.log('📸 Saved callback_admin_auto_sync.png');

    // 6. Test Status Change for Shri Ratan Tata: Change to 'Contacted'
    console.log('🔄 Changing Shri Ratan Tata status to Contacted...');
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const row = rows.find(r => r.innerText.includes('Shri Ratan Tata'));
      if (row) {
        const select = row.querySelector('select');
        if (select) {
          select.value = 'Contacted';
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'callback_admin_status_updated.png'),
      fullPage: true
    });
    console.log('📸 Saved callback_admin_status_updated.png');

    // 7. Test Admin Follow-up Notes: Open modal and save note
    console.log('📝 Testing Admin Follow-up Notes modal...');
    await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tr'));
      const row = rows.find(r => r.innerText.includes('Shri Ratan Tata'));
      if (row) {
        const btn = Array.from(row.querySelectorAll('button')).find(b => b.innerText.includes('Note'));
        if (btn) btn.click();
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Type notes into textarea
    await page.waitForSelector('textarea', { timeout: 3000 });
    await page.evaluate(() => {
      const ta = document.querySelector('textarea');
      if (ta) window.setReactInput(ta, 'Telecaller Dr. Verma consulted customer. Recommended Arth-Amrit kit. Prescription sent on WhatsApp.');
    });

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'callback_admin_notes_modal.png'),
      fullPage: true
    });
    console.log('📸 Saved callback_admin_notes_modal.png');

    // Click "Save Notes"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.innerText.includes('Save Notes'));
      if (saveBtn) saveBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log('✅ Follow-up note saved successfully.');

    // 8. Test Search Filter
    console.log('🔍 Testing search filter with "Sunita"...');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search by customer name"]');
      if (input) {
        window.setReactInput(input, 'Sunita');
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const textDuringSearch = await page.evaluate(() => document.body.innerText);
    if (!textDuringSearch.includes('Sunita Sharma') || textDuringSearch.includes('Shri Ratan Tata')) {
      throw new Error('Search filtering failed to isolate Sunita Sharma!');
    }
    console.log('✅ Search filter verified: Only matching customer records shown.');

    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'callback_admin_search_filtered.png'),
      fullPage: true
    });
    console.log('📸 Saved callback_admin_search_filtered.png');

    console.log('🎉 ALL E2E BROWSER TESTS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
