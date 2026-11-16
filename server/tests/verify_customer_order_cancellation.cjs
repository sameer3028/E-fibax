const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const delay = ms => new Promise(r => setTimeout(r, ms));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EVIDENCE_DIR = path.resolve('C:\\Users\\Kabul Singh\\.gemini\\antigravity\\brain\\e208b1b0-35f4-44ab-8474-3eb128b3da11\\verification_evidence');
const DATA_DIR = path.resolve(__dirname, '../data');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

async function run() {
  console.log('🚀 Starting Customer Order Cancellation & ID Mapping Verification...');

  const testPhone = '9876543210';
  const testOrderId = 'FBX-E2E-TEST-CUST-999';

  // 1. Authenticate via backend API to obtain a live session token recognized by running server
  console.log(`🔑 Logging in customer (+91 ${testPhone}) via /api/auth/verify-otp ...`);
  const loginRes = await fetch('http://localhost:5050/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, otp: '1234', name: 'Rohan Verma' })
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.token) {
    throw new Error(`Customer login failed: ${JSON.stringify(loginData)}`);
  }
  const customerToken = loginData.token;
  const currentUser = loginData.user;
  console.log(`✅ Authenticated customer: ${currentUser.name} (${currentUser.id}), token: ${customerToken.slice(0, 20)}...`);

  // 2. Seed test order with canonical orderId and NO id field (exact production schema)
  const ordersFile = path.join(DATA_DIR, 'orders.json');
  let orders = [];
  if (fs.existsSync(ordersFile)) {
    orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  }
  orders = orders.filter(o => o.orderId !== testOrderId);
  const testOrder = {
    orderId: testOrderId,
    createdAt: new Date().toISOString(),
    status: 'Processing',
    customer: {
      name: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email || 'rohan@example.com',
      userId: currentUser.id,
      address: 'Flat 402, Green Avenue',
      city: 'Chandigarh',
      pincode: '160017'
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
  orders.unshift(testOrder);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2), 'utf8');
  console.log(`✅ Seeded pre-shipment customer test order #${testOrderId} into orders.json`);

  // 3. Launch Chrome Puppeteer Browser
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 850 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  try {
    // 4. Navigate to Home Page and set session in localStorage
    console.log('🌐 Loading http://localhost:3030 ...');
    await page.goto('http://localhost:3030', { waitUntil: 'domcontentloaded' });

    await page.evaluate((user, token) => {
      localStorage.setItem('fibax_user', JSON.stringify(user));
      localStorage.setItem('fibax_auth_token', token);
    }, currentUser, customerToken);

    // Reload page to let AuthContext initialize customer session
    await page.goto('http://localhost:3030', { waitUntil: 'networkidle0' });
    await delay(1500);

    // 5. Open Account Modal by clicking customer account button in header
    console.log('🔍 Clicking Account button to open Profile...');
    await page.waitForSelector('button[title="My Account & Profile"]', { timeout: 10000 });
    await page.click('button[title="My Account & Profile"]');
    await delay(1200);

    // 6. Click "Your Orders" card inside Account Modal
    console.log('🔍 Navigating to "Your Orders" tab...');
    const clickedOrdersTab = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ordersBtn = buttons.find(b => b.innerText && b.innerText.includes('Your Orders'));
      if (ordersBtn) {
        ordersBtn.click();
        return true;
      }
      return false;
    });

    if (!clickedOrdersTab) {
      throw new Error('Could not find "Your Orders" button inside Account Modal');
    }
    await delay(2000);

    // 7. Verify Order ID rendering on the Order Card
    console.log(`🔍 Checking order card for canonical order ID #${testOrderId}...`);
    const orderCardText = await page.evaluate((orderId) => {
      const cards = Array.from(document.querySelectorAll('div.rounded-2xl'));
      const match = cards.find(c => c.innerText && c.innerText.includes(orderId));
      if (!match) {
        const hasUndefined = document.body.innerText.includes('#undefined');
        return { found: false, hasUndefined, allText: document.body.innerText.slice(0, 1000) };
      }
      return {
        found: true,
        text: match.innerText,
        hasUndefined: match.innerText.includes('#undefined'),
        hasBlankHash: match.innerText.includes('Order ID\n#\n') || match.innerText.includes('Order ID\n# ')
      };
    }, testOrderId);

    console.log('📋 Order Card Check Result:', JSON.stringify(orderCardText, null, 2));

    if (!orderCardText.found) {
      throw new Error(`Order #${testOrderId} was not rendered in user orders list!`);
    }
    if (orderCardText.hasUndefined) {
      throw new Error('BUG DETECTED: #undefined is visible on the order card!');
    }
    if (orderCardText.hasBlankHash) {
      throw new Error('BUG DETECTED: Blank # is visible without Order ID on order card!');
    }

    // Capture Screenshot 1: Desktop Customer Order List with Canonical Order ID
    const sc1Path = path.join(EVIDENCE_DIR, '01_customer_orders_view_canonical_id.png');
    await page.screenshot({ path: sc1Path, fullPage: false });
    console.log('📸 Screenshot 1 saved:', sc1Path);

    // 8. Click "Cancel this Order"
    console.log('🔍 Clicking "Cancel this Order"...');
    const cancelClicked = await page.evaluate((orderId) => {
      const cards = Array.from(document.querySelectorAll('div.rounded-2xl'));
      const targetCard = cards.find(c => c.innerText && c.innerText.includes(orderId));
      if (!targetCard) return false;
      const cancelBtn = Array.from(targetCard.querySelectorAll('button')).find(
        b => b.innerText && b.innerText.includes('Cancel this Order')
      );
      if (cancelBtn) {
        cancelBtn.click();
        return true;
      }
      return false;
    }, testOrderId);

    if (!cancelClicked) {
      throw new Error(`Could not find "Cancel this Order" button on order #${testOrderId}`);
    }
    await delay(1200);

    // 9. Verify Cancellation Confirmation Modal Header and Details
    console.log('🔍 Checking Cancellation Confirmation Modal content...');
    const modalContent = await page.evaluate((orderId) => {
      const modal = document.querySelector('.bg-white.rounded-2xl.p-5');
      if (!modal) return null;
      return {
        text: modal.innerText,
        hasUndefined: modal.innerText.includes('#undefined'),
        hasOrderId: modal.innerText.includes(orderId),
        hasAmount: modal.innerText.includes('₹999'),
        hasPayment: modal.innerText.includes('Cash on Delivery') || modal.innerText.includes('COD')
      };
    }, testOrderId);

    console.log('📋 Cancellation Modal Check:', JSON.stringify(modalContent, null, 2));

    if (!modalContent) {
      throw new Error('Cancellation confirmation modal did not open!');
    }
    if (modalContent.hasUndefined) {
      throw new Error('BUG DETECTED: Modal contains "#undefined"!');
    }
    if (!modalContent.hasOrderId) {
      throw new Error(`BUG DETECTED: Modal does not contain canonical order ID #${testOrderId}!`);
    }

    // Capture Screenshot 2: Cancellation Confirmation Modal with Order ID
    const sc2Path = path.join(EVIDENCE_DIR, '02_customer_cancel_modal_canonical_id.png');
    await page.screenshot({ path: sc2Path, fullPage: false });
    console.log('📸 Screenshot 2 saved:', sc2Path);

    // 10. Select Reason and Submit Cancellation
    console.log('📝 Selecting cancellation reason and confirming...');
    await page.evaluate(() => {
      const select = document.querySelector('select');
      if (select) {
        select.value = 'Changed my mind';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await delay(300);

    const confirmSubmitted = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const confirmBtn = buttons.find(b => b.innerText && (b.innerText.includes('Confirm Cancel') || b.innerText.includes('Confirm Cancellation')));
      if (confirmBtn) {
        confirmBtn.click();
        return true;
      }
      return false;
    });

    if (!confirmSubmitted) {
      throw new Error('Could not find "Confirm Cancel" button');
    }

    // Wait for cancellation API response
    console.log('⏳ Awaiting cancellation API response...');
    await delay(2500);

    // Capture Screenshot 3: Cancellation Success Response
    const sc3Path = path.join(EVIDENCE_DIR, '03_customer_cancellation_confirmed.png');
    await page.screenshot({ path: sc3Path, fullPage: false });
    console.log('📸 Screenshot 3 saved:', sc3Path);

    // 11. Verify stored order record in server/data/orders.json
    const ordersAfter = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    const cancelledDbOrder = ordersAfter.find(o => o.orderId === testOrderId);
    if (!cancelledDbOrder) {
      throw new Error(`Order #${testOrderId} missing from database after cancellation!`);
    }
    if (cancelledDbOrder.status !== 'Cancelled') {
      throw new Error(`Order status is "${cancelledDbOrder.status}", expected "Cancelled"!`);
    }
    console.log(`✅ Database verification confirmed: Order #${testOrderId} is Cancelled with reason "${cancelledDbOrder.cancellationReason}".`);

    // 12. Mobile Viewport Parity Check (390px x 844px iPhone 14 Pro)
    console.log('📱 Switching to mobile viewport (390 x 844)...');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await delay(1000);

    // Navigate to refunds / cancellations tab to show cancelled order on mobile
    await page.evaluate(() => {
      const backBtn = document.querySelector('button[aria-label="Back to Profile"]');
      if (backBtn) backBtn.click();
    });
    await delay(1000);

    // Click "Your Refunds"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, div'));
      const refundBtn = buttons.find(b => b.innerText && b.innerText.includes('Your Refunds'));
      if (refundBtn) refundBtn.click();
    });
    await delay(1500);

    const sc4Path = path.join(EVIDENCE_DIR, '04_customer_orders_mobile_390px.png');
    await page.screenshot({ path: sc4Path, fullPage: false });
    console.log('📸 Screenshot 4 saved:', sc4Path);

    console.log('🎉 ALL END-TO-END VERIFICATIONS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();

    // Clean up test order
    try {
      if (fs.existsSync(ordersFile)) {
        let curOrders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
        curOrders = curOrders.filter(o => o.orderId !== testOrderId);
        fs.writeFileSync(ordersFile, JSON.stringify(curOrders, null, 2), 'utf8');
        console.log(`🧹 Cleaned up test order #${testOrderId} from orders.json`);
      }
    } catch (cleanupErr) {
      console.error('Cleanup warning:', cleanupErr.message);
    }
  }
}

run().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
