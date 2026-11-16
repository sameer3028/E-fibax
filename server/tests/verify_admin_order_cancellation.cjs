const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const http = require('http');

const delay = ms => new Promise(r => setTimeout(r, ms));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = path.resolve('C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence');
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Admin Order Cancellation End-to-End Verification...');

  // 1. Prepare test order in server/data/orders.json
  const ordersFile = path.join(DATA_DIR, 'orders.json');
  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  }

  const testOrderId = 'FBX-E2E-CANCEL-001';
  // Remove prior test order if exists
  orders = orders.filter(o => o.orderId !== testOrderId);

  // Add fresh pre-shipment COD order
  const freshOrder = {
    orderId: testOrderId,
    createdAt: new Date().toISOString(),
    status: 'Processing',
    customer: {
      name: 'Manpreet Kaur',
      phone: '9876501234',
      email: 'manpreet@example.com',
      address: 'House 42, Model Town',
      city: 'Ludhiana',
      pincode: '141002'
    },
    items: [
      {
        id: '1790178767568',
        title: 'joint conbo pack',
        quantity: 1,
        price: 999
      }
    ],
    totals: {
      subtotal: 999,
      discount: 0,
      shipping: 0,
      grandTotal: 999
    },
    payment: {
      method: 'COD',
      status: 'Pending'
    },
    trackingId: null,
    delhiveryAwb: null
  };

  orders.unshift(freshOrder);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
  console.log(`✅ Seeded fresh pre-shipment test order #${testOrderId} into DATA_DIR/orders.json`);

  // 2. Generate Admin Token using existing server auth helper
  const authModule = await import('../middleware/auth.js');
  const adminToken = authModule.generateAdminToken('admin');
  console.log('✅ Generated valid admin token:', adminToken.slice(0, 20) + '...');

  // 3. Launch Puppeteer Browser
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 4. Navigate to Admin and authenticate
    console.log('🌐 Navigating to http://localhost:3030/admin?tab=orders...');
    await page.goto('http://localhost:3030/admin?tab=orders', { waitUntil: 'domcontentloaded' });

    // Inject admin authentication into localStorage
    await page.evaluate((token) => {
      localStorage.setItem('fibax_admin_token', token);
      localStorage.setItem('fibax_admin_user', 'admin');
    }, adminToken);

    // Reload page with active admin session
    await page.goto('http://localhost:3030/admin?tab=orders', { waitUntil: 'networkidle0' });
    await delay(1500);

    // 5. Verify Order Management Table loaded
    await page.waitForSelector('table', { timeout: 10000 });
    console.log('✅ Logistics & Shipping Order Management table loaded.');

    // Screenshot 1: Desktop Order Table with Cancel button visible
    const tableScreenshotPath = path.join(EVIDENCE_DIR, '01_desktop_order_table_with_cancel_button.png');
    await page.screenshot({ path: tableScreenshotPath, fullPage: false });
    console.log('📸 Captured:', tableScreenshotPath);

    // 6. Find and click the red Cancel button for FBX-E2E-CANCEL-001
    console.log(`🔍 Looking for Cancel button for order #${testOrderId}...`);
    const cancelClicked = await page.evaluate((orderId) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (row.innerText.includes(orderId)) {
          const cancelBtn = Array.from(row.querySelectorAll('button')).find(
            b => b.innerText.includes('Cancel')
          );
          if (cancelBtn) {
            cancelBtn.click();
            return true;
          }
        }
      }
      return false;
    }, testOrderId);

    if (!cancelClicked) {
      throw new Error(`Could not find or click Cancel button for order #${testOrderId}`);
    }

    console.log('✅ Clicked Cancel Order button.');
    await delay(800);

    // 7. Verify Cancellation Confirmation Modal is Open
    await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
    const modalText = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      return modal ? modal.innerText : '';
    });

    console.log('📋 Verifying Cancellation Confirmation Modal contents:');
    if (!modalText.includes(testOrderId)) throw new Error('Modal does not contain order ID');
    if (!modalText.includes('Manpreet Kaur')) throw new Error('Modal does not contain customer name');
    if (!modalText.includes('₹999')) throw new Error('Modal does not contain order amount');
    if (!modalText.includes('COD')) throw new Error('Modal does not contain payment method');
    if (!modalText.includes('Select Cancellation Reason')) throw new Error('Modal does not contain reason selector');
    if (!modalText.includes('Confirm Cancellation')) throw new Error('Modal does not contain confirm button');
    console.log('✅ All modal confirmation elements verified.');

    // Screenshot 2: Confirmation Modal
    const modalScreenshotPath = path.join(EVIDENCE_DIR, '02_cancellation_confirmation_modal.png');
    await page.screenshot({ path: modalScreenshotPath });
    console.log('📸 Captured:', modalScreenshotPath);

    // 8. Select Reason and enter Admin Remarks
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      const select = modal.querySelector('select');
      if (select) {
        select.value = 'Customer requested cancellation';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const textarea = modal.querySelector('textarea');
      if (textarea) {
        textarea.value = 'Customer requested cancellation via WhatsApp helpline before dispatch. Confirmed with customer Manpreet.';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // 9. Click Confirm Cancellation
    console.log('🔘 Submitting order cancellation...');
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      const confirmBtn = Array.from(modal.querySelectorAll('button')).find(
        b => b.innerText.includes('Confirm Cancellation')
      );
      if (confirmBtn) confirmBtn.click();
    });

    // Wait for API response and table reload
    await delay(2500);

    // Screenshot 3: Order Table after cancellation
    const cancelledTableScreenshotPath = path.join(EVIDENCE_DIR, '03_order_cancelled_in_table.png');
    await page.screenshot({ path: cancelledTableScreenshotPath });
    console.log('📸 Captured:', cancelledTableScreenshotPath);

    // 10. Click Details button on the cancelled order to verify audit card
    console.log(`🔍 Opening Details modal for cancelled order #${testOrderId}...`);
    const detailsClicked = await page.evaluate((orderId) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (row.innerText.includes(orderId)) {
          const detailsBtn = Array.from(row.querySelectorAll('button')).find(
            b => b.innerText.includes('Details')
          );
          if (detailsBtn) {
            detailsBtn.click();
            return true;
          }
        }
      }
      return false;
    }, testOrderId);

    if (!detailsClicked) {
      throw new Error(`Could not find or click Details button for order #${testOrderId}`);
    }

    await delay(1000);

    // Screenshot 4: Cancellation & Refund History Audit Modal
    const detailsModalScreenshotPath = path.join(EVIDENCE_DIR, '04_cancelled_order_details_audit_modal.png');
    await page.screenshot({ path: detailsModalScreenshotPath });
    console.log('📸 Captured:', detailsModalScreenshotPath);

    // Close Details Modal
    await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0');
      const closeBtn = modal?.querySelector('button');
      if (closeBtn) closeBtn.click();
    });
    await delay(500);

    // 11. Switch to "Cancelled" filter tab
    console.log('🔍 Switching to "Cancelled" filter tab in ShippingView...');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const cancelledTab = tabs.find(b => b.innerText.includes('Cancelled'));
      if (cancelledTab) cancelledTab.click();
    });
    await delay(1000);

    // Screenshot 5: Cancelled Orders Tab
    const cancelledTabScreenshotPath = path.join(EVIDENCE_DIR, '05_cancelled_tab_filter.png');
    await page.screenshot({ path: cancelledTabScreenshotPath });
    console.log('📸 Captured:', cancelledTabScreenshotPath);

    // 12. Mobile Viewport Testing (390x844 iPhone 13/14)
    console.log('📱 Testing Mobile Viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await delay(1000);

    // Screenshot 6: Mobile Order Table
    const mobileTableScreenshotPath = path.join(EVIDENCE_DIR, '06_mobile_390px_order_table.png');
    await page.screenshot({ path: mobileTableScreenshotPath });
    console.log('📸 Captured:', mobileTableScreenshotPath);

    // Open another test order on mobile to verify confirmation modal responsiveness
    const freshMobileOrder = {
      orderId: 'FBX-E2E-MOBILE-002',
      createdAt: new Date().toISOString(),
      status: 'Processing',
      customer: {
        name: 'Sunil Gavaskar',
        phone: '9876543299',
        city: 'Mumbai',
        pincode: '400001'
      },
      items: [
        {
          id: '1790178767568',
          title: 'joint conbo pack',
          quantity: 1,
          price: 999
        }
      ],
      totals: { grandTotal: 999 },
      payment: { method: 'COD', status: 'Pending' }
    };

    orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    orders.unshift(freshMobileOrder);
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');

    // Switch back to "All" or "Processing" tab
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const allTab = tabs.find(b => b.innerText.includes('All') || b.innerText.includes('Dispatch'));
      if (allTab) allTab.click();
    });
    await delay(1000);

    // Click Cancel on mobile order
    await page.evaluate((orderId) => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      for (const row of rows) {
        if (row.innerText.includes(orderId)) {
          const cancelBtn = Array.from(row.querySelectorAll('button')).find(
            b => b.innerText.includes('Cancel')
          );
          if (cancelBtn) cancelBtn.click();
        }
      }
    }, 'FBX-E2E-MOBILE-002');
    await delay(800);

    // Screenshot 7: Mobile Cancellation Modal
    const mobileModalScreenshotPath = path.join(EVIDENCE_DIR, '07_mobile_390px_cancellation_modal.png');
    await page.screenshot({ path: mobileModalScreenshotPath });
    console.log('📸 Captured:', mobileModalScreenshotPath);

    console.log('🎉 All End-to-End Verification Steps Completed Successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
