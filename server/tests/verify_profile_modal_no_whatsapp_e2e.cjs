const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');
const http = require('http');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence';

async function requestJson(url, options = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve({ raw: body, status: res.statusCode });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

(async () => {
  console.log('🚀 Starting Customer Profile Modal WhatsApp Removal E2E Verification...');

  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  // 1. Authenticate a customer via dev OTP
  console.log('🔑 Authenticating customer via dev OTP endpoint...');
  await requestJson('http://localhost:5050/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: '9876543210' })
  });

  const verifyRes = await requestJson('http://localhost:5050/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone: '9876543210', otp: '1234' })
  });

  if (!verifyRes.success || !verifyRes.token) {
    throw new Error('Failed to obtain customer auth token: ' + JSON.stringify(verifyRes));
  }
  const token = verifyRes.token;
  const user = verifyRes.user;
  console.log(`✅ Authenticated customer: ${user.name} (${user.phone})`);

  // Launch browser
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // ========================================================
    // PART 1: DESKTOP VERIFICATION (1280 x 900)
    // ========================================================
    console.log('\n🖥️ --- DESKTOP VERIFICATION (1280 x 900) ---');
    const desktopPage = await browser.newPage();
    await desktopPage.setViewport({ width: 1280, height: 900 });

    console.log('🌐 Loading http://localhost:3030 and injecting customer session...');
    await desktopPage.goto('http://localhost:3030', { waitUntil: 'networkidle2' });

    // Inject session into localStorage
    await desktopPage.evaluate((t, u) => {
      localStorage.setItem('fibax_auth_token', t);
      localStorage.setItem('fibax_user', JSON.stringify(u));
    }, token, user);

    // Reload page to activate authenticated state
    await desktopPage.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('🔍 Clicking customer profile button in Header (title="My Account & Profile")...');
    await desktopPage.waitForSelector('button[title="My Account & Profile"]', { timeout: 5000 });
    await desktopPage.click('button[title="My Account & Profile"]');

    await desktopPage.waitForSelector('h1', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 800));

    const desktopTitle = await desktopPage.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent.trim() : null;
    });
    console.log(`📋 Profile Modal Header Title: "${desktopTitle}"`);

    // Inspect "Other Information" and verify "Ayurvedic Doctor on WhatsApp" is ABSENT
    const desktopCheck = await desktopPage.evaluate(() => {
      const modal = document.querySelector('.bg-\\[\\#F4F6F5\\]') || document.querySelector('.fixed.inset-0');
      if (!modal) return { modalFound: false };

      const text = modal.innerText || modal.textContent;
      const html = modal.innerHTML;

      return {
        modalFound: true,
        hasOtherInfo: text.toLowerCase().includes('other information'),
        hasSuggestProducts: text.includes('Suggest Products'),
        hasAboutFibax: text.includes('About Fibax Ayurveda'),
        hasPrivacyPolicy: text.includes('Privacy Policy'),
        hasTermsConditions: text.includes('Terms & Conditions'),
        hasLogOut: text.includes('Log Out'),
        hasDoctorWhatsAppHeading: text.includes('Ayurvedic Doctor on WhatsApp'),
        hasDoctorGuidanceText: text.includes('Free personalized dosage'),
        hasDoctorPhoneNumber: text.includes('+91 88725 44458'),
        hasDoctorWhatsAppLink: html.includes('wa.me/918872544458?text=Hello%20Fibax%20Ayurveda%20Doctor'),
        itemsInOtherInfo: Array.from(modal.querySelectorAll('h3')).find(h => h.textContent.toLowerCase().includes('other information'))
          ?.closest('.rounded-2xl')?.querySelectorAll('button')?.length || 0
      };
    });

    console.log('📊 Desktop Verification Inspection Results:', desktopCheck);

    if (!desktopCheck.modalFound) throw new Error('Profile modal container not found on Desktop');
    if (!desktopCheck.hasOtherInfo) throw new Error('Missing "Other Information" section on Desktop');
    if (!desktopCheck.hasSuggestProducts) throw new Error('Missing "Suggest Products" item on Desktop');
    if (!desktopCheck.hasAboutFibax) throw new Error('Missing "About Fibax Ayurveda" item on Desktop');
    if (!desktopCheck.hasPrivacyPolicy) throw new Error('Missing "Privacy Policy" item on Desktop');
    if (!desktopCheck.hasTermsConditions) throw new Error('Missing "Terms & Conditions" item on Desktop');
    if (!desktopCheck.hasLogOut) throw new Error('Missing "Log Out" button on Desktop');

    // Confirm WhatsApp removal
    if (desktopCheck.hasDoctorWhatsAppHeading) throw new Error('FAILED: "Ayurvedic Doctor on WhatsApp" heading is still present on Desktop!');
    if (desktopCheck.hasDoctorGuidanceText) throw new Error('FAILED: Doctor guidance text is still present on Desktop!');
    if (desktopCheck.hasDoctorPhoneNumber) throw new Error('FAILED: Doctor phone number +91 88725 44458 is still present on Desktop!');
    if (desktopCheck.hasDoctorWhatsAppLink) throw new Error('FAILED: Doctor WhatsApp link is still present on Desktop!');

    console.log('✅ PASS: All 4 items (Suggest Products, About, Privacy, Terms) and Log Out exist.');
    console.log('✅ PASS: "Ayurvedic Doctor on WhatsApp" section is COMPLETELY REMOVED from Desktop Profile Modal!');

    // Scroll modal down to show Other Information section
    await desktopPage.evaluate(() => {
      const scrollable = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture Desktop Screenshot
    const desktopScreenshotPath = path.join(ARTIFACT_DIR, '01_desktop_profile_modal_no_whatsapp.png');
    await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: false });
    console.log(`📸 Screenshot saved: ${desktopScreenshotPath}`);
    await desktopPage.close();

    // ========================================================
    // PART 2: MOBILE VERIFICATION (390 x 844 iPhone Viewport)
    // ========================================================
    console.log('\n📱 --- MOBILE VERIFICATION (390 x 844) ---');
    const mobilePage = await browser.newPage();
    await mobilePage.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

    console.log('🌐 Loading http://localhost:3030 and injecting customer session on mobile...');
    await mobilePage.goto('http://localhost:3030', { waitUntil: 'networkidle2' });

    // Inject session into localStorage
    await mobilePage.evaluate((t, u) => {
      localStorage.setItem('fibax_auth_token', t);
      localStorage.setItem('fibax_user', JSON.stringify(u));
    }, token, user);

    await mobilePage.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    console.log('🔍 Clicking customer profile button in Header on mobile...');
    await mobilePage.waitForSelector('button[title="My Account & Profile"]', { timeout: 5000 });
    await mobilePage.click('button[title="My Account & Profile"]');

    await mobilePage.waitForSelector('h1', { timeout: 5000 });
    await new Promise(r => setTimeout(r, 800));

    // Scroll down to the bottom of the modal to verify the "Other Information" and "Log Out" sections
    await mobilePage.evaluate(() => {
      const scrollable = document.querySelector('.flex-1.overflow-y-auto');
      if (scrollable) scrollable.scrollTop = scrollable.scrollHeight;
    });
    await new Promise(r => setTimeout(r, 600));

    const mobileCheck = await mobilePage.evaluate(() => {
      const modal = document.querySelector('.bg-\\[\\#F4F6F5\\]') || document.querySelector('.fixed.inset-0');
      if (!modal) return { modalFound: false };
      const text = modal.innerText || modal.textContent;
      const html = modal.innerHTML;

      return {
        modalFound: true,
        hasOtherInfo: text.toLowerCase().includes('other information'),
        hasSuggestProducts: text.includes('Suggest Products'),
        hasAboutFibax: text.includes('About Fibax Ayurveda'),
        hasPrivacyPolicy: text.includes('Privacy Policy'),
        hasTermsConditions: text.includes('Terms & Conditions'),
        hasLogOut: text.includes('Log Out'),
        hasDoctorWhatsAppHeading: text.includes('Ayurvedic Doctor on WhatsApp'),
        hasDoctorGuidanceText: text.includes('Free personalized dosage'),
        hasDoctorPhoneNumber: text.includes('+91 88725 44458'),
        hasDoctorWhatsAppLink: html.includes('wa.me/918872544458?text=Hello%20Fibax%20Ayurveda%20Doctor'),
        itemsInOtherInfo: Array.from(modal.querySelectorAll('h3')).find(h => h.textContent.toLowerCase().includes('other information'))
          ?.closest('.rounded-2xl')?.querySelectorAll('button')?.length || 0
      };
    });

    console.log('📊 Mobile Verification Inspection Results:', mobileCheck);

    if (!mobileCheck.modalFound) throw new Error('Profile modal container not found on Mobile');
    if (!mobileCheck.hasOtherInfo) throw new Error('Missing "Other Information" section on Mobile');
    if (!mobileCheck.hasSuggestProducts) throw new Error('Missing "Suggest Products" item on Mobile');
    if (!mobileCheck.hasAboutFibax) throw new Error('Missing "About Fibax Ayurveda" item on Mobile');
    if (!mobileCheck.hasPrivacyPolicy) throw new Error('Missing "Privacy Policy" item on Mobile');
    if (!mobileCheck.hasTermsConditions) throw new Error('Missing "Terms & Conditions" item on Mobile');
    if (!mobileCheck.hasLogOut) throw new Error('Missing "Log Out" button on Mobile');

    // Confirm WhatsApp removal on mobile
    if (mobileCheck.hasDoctorWhatsAppHeading) throw new Error('FAILED: "Ayurvedic Doctor on WhatsApp" heading is still present on Mobile!');
    if (mobileCheck.hasDoctorGuidanceText) throw new Error('FAILED: Doctor guidance text is still present on Mobile!');
    if (mobileCheck.hasDoctorPhoneNumber) throw new Error('FAILED: Doctor phone number +91 88725 44458 is still present on Mobile!');
    if (mobileCheck.hasDoctorWhatsAppLink) throw new Error('FAILED: Doctor WhatsApp link is still present on Mobile!');

    console.log('✅ PASS: All 4 items (Suggest Products, About, Privacy, Terms) and Log Out exist on Mobile.');
    console.log('✅ PASS: "Ayurvedic Doctor on WhatsApp" section is COMPLETELY REMOVED from Mobile Profile Modal!');

    // Capture Mobile Screenshot
    const mobileScreenshotPath = path.join(ARTIFACT_DIR, '02_mobile_profile_modal_no_whatsapp.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`📸 Screenshot saved: ${mobileScreenshotPath}`);

    console.log('\n🎉 ALL VERIFICATION CRITERIA MET AND VERIFIED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
})();
