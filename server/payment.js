import crypto from 'crypto';

const LIVE_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_live_TduzjdHAKzxjJu';
const LIVE_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '6iMt0tb8iH7TVB3sFaFL7o0f';

export function getPaymentConfig() {
  return {
    keyId: LIVE_KEY_ID,
    currency: 'INR',
    companyName: 'Fibax Ayurveda',
    themeColor: '#1B4332'
  };
}

/**
 * Creates a standard Razorpay Order via REST API
 * @param {Object} params
 * @param {number} params.amount Amount in INR (will be converted to paise)
 * @param {string} params.receipt Unique receipt identifier
 * @param {Object} [params.notes] Extra notes/metadata
 */
export async function createRazorpayOrder({ amount, receipt, notes = {} }) {
  if (!amount || amount <= 0) {
    throw new Error('Valid order amount is required.');
  }

  const amountInPaise = Math.round(Number(amount) * 100);
  const authHeader = 'Basic ' + Buffer.from(`${LIVE_KEY_ID}:${LIVE_KEY_SECRET}`).toString('base64');

  const payload = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt || `rcpt_${Date.now()}`,
    notes: {
      platform: 'Fibax Ayurveda Web Storefront',
      ...notes
    }
  };

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Razorpay Order creation error:', data);
    throw new Error(data?.error?.description || 'Failed to initialize payment with Razorpay.');
  }

  console.log(`💳 Razorpay Order created: ${data.id} for ₹${amount} (${amountInPaise} paise)`);

  return {
    success: true,
    orderId: data.id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    keyId: LIVE_KEY_ID
  };
}

/**
 * Cryptographically verifies Razorpay Payment Signature
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 */
export function verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return { success: false, error: 'Incomplete payment credentials for verification.' };
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', LIVE_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  const isMatch = expectedSignature === razorpay_signature;

  if (isMatch) {
    console.log(`✅ Payment signature verified: Payment ID ${razorpay_payment_id} for Order ${razorpay_order_id}`);
    return {
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id
    };
  } else {
    console.warn(`⚠️ Payment signature mismatch: expected ${expectedSignature}, received ${razorpay_signature}`);
    return {
      success: false,
      verified: false,
      error: 'Invalid payment signature. Verification failed.'
    };
  }
}
