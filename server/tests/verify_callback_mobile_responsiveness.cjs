const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = 'C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence';

async function runVerification() {
  console.log('================================================================');
  console.log('📱 FIBAX AYURVEDA — REQUEST CALL BACK RESPONSIVENESS QA VERIFICATION');
  console.log('================================================================\n');

  // 1. Start ephemeral express server serving client/dist
  const app = express();
  app.use(express.json());
  
  // Mock API endpoints needed by storefront
  app.get('/api/website/home-banners/active', (req, res) => res.json([]));
  app.get('/api/products', (req, res) => res.json({ success: true, count: 0, data: [] }));
  app.get('/api/shipping/config', (req, res) => res.json({ freeShippingThreshold: 500, standardShippingRate: 50 }));
  app.get('/api/payment/config', (req, res) => res.json({ keyId: 'rzp_test_123', currency: 'INR' }));
  
  let lastEnquiry = null;
  app.post('/api/enquiry', (req, res) => {
    lastEnquiry = req.body;
    console.log('   [API] Received Callback Enquiry:', JSON.stringify(lastEnquiry));
    res.json({ success: true, message: 'Enquiry received successfully' });
  });

  const distDir = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5178, '127.0.0.1', resolve));
  const baseUrl = 'http://127.0.0.1:5178/contact';
  console.log(`✓ Local test server running on ${baseUrl}\n`);

  // 2. Launch headless Chrome via puppeteer-core
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,900']
  });

  const VIEWPORTS = [
    { width: 320, height: 650, name: '320px (iPhone SE 1st gen / Small Android)' },
    { width: 360, height: 740, name: '360px (Galaxy S8 / Standard Small)' },
    { width: 375, height: 667, name: '375px (iPhone SE 2nd / iPhone 8)' },
    { width: 390, height: 844, name: '390px (iPhone 12 / 13 / 14 / 15)' },
    { width: 412, height: 915, name: '412px (Pixel 7 / Galaxy S22 Ultra)' },
    { width: 430, height: 932, name: '430px (iPhone 14 / 15 Pro Max)' },
    { width: 1280, height: 800, name: '1280px (Standard Desktop View)' }
  ];

  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`--- Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });

    // Verify page has no horizontal overflow
    const pageMetrics = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        clientWidth: doc.clientWidth,
        scrollWidth: doc.scrollWidth,
        hasHorizontalScroll: doc.scrollWidth > doc.clientWidth
      };
    });

    console.log(`   Page Horizontal Scroll: ${pageMetrics.hasHorizontalScroll ? '⚠️ DETECTED' : '✅ NONE'} (Client: ${pageMetrics.clientWidth}px, Scroll: ${pageMetrics.scrollWidth}px)`);

    // Trigger Callback Modal: find button with "Request Doctor Call Back" or footer "Request Call Back"
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const trigger = buttons.find(b => b.innerText.includes('Request Doctor Call Back') || b.innerText.includes('Request Call Back'));
      if (trigger) {
        trigger.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      console.error('   ❌ Could not find callback trigger button');
      await page.close();
      continue;
    }

    // Wait for modal dialog to appear
    await page.waitForSelector('[role="dialog"]', { visible: true, timeout: 3000 });

    // Inspect Modal Dimensions & Assertions
    const modalMetrics = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const card = dialog.querySelector('.bg-white.rounded-2xl, .bg-white.rounded-3xl');
      const header = card ? card.querySelector('.bg-gradient-to-r') : null;
      const title = card ? card.querySelector('#callback-modal-title') : null;
      const textarea = card ? card.querySelector('textarea') : null;
      const submitBtn = card ? card.querySelector('button[type="submit"]') : null;
      const phoneInput = card ? card.querySelector('input[type="tel"]') : null;
      const phonePrefix = card ? card.querySelector('.pointer-events-none') : null;
      const selects = card ? Array.from(card.querySelectorAll('select')) : [];

      const cardRect = card ? card.getBoundingClientRect() : null;
      const textareaRect = textarea ? textarea.getBoundingClientRect() : null;
      const submitRect = submitBtn ? submitBtn.getBoundingClientRect() : null;
      const phoneInputRect = phoneInput ? phoneInput.getBoundingClientRect() : null;
      const phonePrefixRect = phonePrefix ? phonePrefix.getBoundingClientRect() : null;

      // Check if textarea has internal scrollbar: scrollHeight > clientHeight
      const textareaHasScrollbar = textarea ? (textarea.scrollHeight > textarea.clientHeight + 2) : false;

      // Check if all content fits within card
      const cardFitsViewport = cardRect ? (cardRect.left >= 0 && cardRect.right <= window.innerWidth + 1) : false;
      const submitFitsCard = (submitRect && cardRect) ? (submitRect.left >= cardRect.left - 1 && submitRect.right <= cardRect.right + 1) : false;
      const textareaFitsCard = (textareaRect && cardRect) ? (textareaRect.left >= cardRect.left - 1 && textareaRect.right <= cardRect.right + 1) : false;

      return {
        cardFitsViewport,
        cardWidth: cardRect ? Math.round(cardRect.width) : 0,
        cardLeft: cardRect ? Math.round(cardRect.left) : 0,
        cardRight: cardRect ? Math.round(cardRect.right) : 0,
        titleText: title ? title.innerText : '',
        textareaWidth: textareaRect ? Math.round(textareaRect.width) : 0,
        textareaHeight: textareaRect ? Math.round(textareaRect.height) : 0,
        textareaScrollHeight: textarea ? textarea.scrollHeight : 0,
        textareaClientHeight: textarea ? textarea.clientHeight : 0,
        textareaHasScrollbar,
        textareaFitsCard,
        submitWidth: submitRect ? Math.round(submitRect.width) : 0,
        submitFitsCard,
        phonePrefixAligned: (phonePrefixRect && phoneInputRect) ? Math.abs((phonePrefixRect.top + phonePrefixRect.height / 2) - (phoneInputRect.top + phoneInputRect.height / 2)) < 3 : false,
        selectsCount: selects.length,
        selectsFit: selects.every(s => {
          const r = s.getBoundingClientRect();
          return cardRect && r.left >= cardRect.left - 1 && r.right <= cardRect.right + 1;
        })
      };
    });

    console.log(`   Card Width:             ${modalMetrics.cardWidth}px (Fits Viewport: ${modalMetrics.cardFitsViewport ? '✅ YES' : '❌ NO'})`);
    console.log(`   Textarea Dimensions:    ${modalMetrics.textareaWidth}x${modalMetrics.textareaHeight}px`);
    console.log(`   Textarea Scrollbar:     ${modalMetrics.textareaHasScrollbar ? '⚠️ INTERNAL SCROLLBAR' : '✅ NO INTERNAL SCROLLBAR (Initial render clean)'}`);
    console.log(`   Submit Button:          ${modalMetrics.submitWidth}px (Fits Card: ${modalMetrics.submitFitsCard ? '✅ YES' : '❌ NO'})`);
    console.log(`   +91 Prefix Aligned:     ${modalMetrics.phonePrefixAligned ? '✅ PERFECT VERTICAL CENTER' : '❌ MISALIGNED'}`);
    console.log(`   Dropdown Selects Fit:   ${modalMetrics.selectsFit ? '✅ ALL FIT WITHOUT OVERFLOW' : '❌ OVERFLOW'}`);

    // Take screenshot
    const shotPath = path.join(EVIDENCE_DIR, `callback_modal_${vp.width}px.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`   📸 Screenshot saved:     ${shotPath}\n`);

    // On 375px viewport, perform end-to-end form submission test
    if (vp.width === 375) {
      console.log('   --- Testing End-to-End Callback Submission at 375px ---');
      await page.type('[role="dialog"] input[placeholder="e.g. Ramesh Kumar"]', 'Ramesh Kumar');
      await page.type('[role="dialog"] input[placeholder="9876543210"]', '9876543210');
      await page.type('[role="dialog"] input[placeholder="e.g. Lucknow, Uttar Pradesh"]', 'Lucknow, Uttar Pradesh');
      await page.type('[role="dialog"] textarea', 'Facing knee pain for 3 months, looking for Ayurvedic oil');
      
      const submitBtn = await page.$('[role="dialog"] button[type="submit"]');
      await submitBtn.click();

      await page.waitForFunction(() => {
        return document.querySelector('[role="dialog"]') && document.querySelector('[role="dialog"]').innerText.includes('Callback Request Received!');
      }, { timeout: 4000 });

      console.log('   ✅ Submission Success screen verified in modal!');
      const successShotPath = path.join(EVIDENCE_DIR, 'callback_modal_success_375px.png');
      await page.screenshot({ path: successShotPath, fullPage: false });
      console.log(`   📸 Success Screenshot saved: ${successShotPath}\n`);
    }

    results.push({
      viewport: vp.name,
      width: vp.width,
      pageNoScroll: !pageMetrics.hasHorizontalScroll,
      cardFits: modalMetrics.cardFitsViewport,
      textareaClean: !modalMetrics.textareaHasScrollbar,
      submitFits: modalMetrics.submitFitsCard,
      prefixAligned: modalMetrics.phonePrefixAligned,
      selectsFit: modalMetrics.selectsFit
    });

    await page.close();
  }

  // 3. Desktop 1280px full contact page verification
  console.log('--- Verifying Desktop Contact Page (1280px) Layout Integrity ---');
  const desktopPage = await browser.newPage();
  await desktopPage.setViewport({ width: 1280, height: 900 });
  await desktopPage.goto(baseUrl, { waitUntil: 'networkidle0' });
  const desktopShot = path.join(EVIDENCE_DIR, 'contact_page_desktop_1280px.png');
  await desktopPage.screenshot({ path: desktopShot, fullPage: true });
  console.log(`📸 Desktop full page screenshot saved: ${desktopShot}\n`);
  await desktopPage.close();

  await browser.close();
  server.close();

  console.log('================================================================');
  console.log('📊 FINAL QA TEST MATRIX:');
  console.log('================================================================');
  console.table(results);
  const allPassed = results.every(r => r.pageNoScroll && r.cardFits && r.textareaClean && r.submitFits && r.prefixAligned && r.selectsFit);
  console.log(`\n🎉 ALL RESPONSIVENESS AND INTEGRITY TESTS PASSED: ${allPassed ? '✅ 100% PASSED' : '❌ FAILED'}\n`);
}

runVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
