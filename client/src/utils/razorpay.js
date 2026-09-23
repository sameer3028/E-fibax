import { apiRequest } from './api';

const DEFAULT_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TduzjdHAKzxjJu';

/**
 * Dynamically loads Razorpay checkout script if not already present
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Initializes and triggers Razorpay Checkout Modal
 * @param {Object} options
 * @param {number} options.amount
 * @param {string} options.orderReceipt
 * @param {Object} options.customer
 * @param {string} options.customer.name
 * @param {string} options.customer.email
 * @param {string} options.customer.phone
 * @param {Function} options.onSuccess
 * @param {Function} options.onFailure
 * @param {Function} [options.onDismiss]
 */
export async function launchRazorpayPayment({
  amount,
  orderReceipt,
  customer,
  notes = {},
  onSuccess,
  onFailure,
  onDismiss
}) {
  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded || typeof window.Razorpay === 'undefined') {
      throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
    }

    // 1. Create Order on Backend
    const orderRes = await apiRequest('/api/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({
        amount,
        receipt: orderReceipt,
        notes
      })
    });

    if (!orderRes.success || !orderRes.orderId) {
      throw new Error(orderRes.error || 'Failed to initialize payment gateway.');
    }

    const keyId = orderRes.keyId || DEFAULT_KEY_ID;

    // 2. Configure Razorpay Options
    const options = {
      key: keyId,
      amount: orderRes.amount,
      currency: orderRes.currency || 'INR',
      name: 'Fibax Ayurveda',
      description: 'Pure Ayurvedic Healthcare & Direct Dispatch',
      image: 'https://cdn-icons-png.flaticon.com/512/2965/2965567.png', // Premium Ayush leaf emblem
      order_id: orderRes.orderId,
      prefill: {
        name: customer?.name || '',
        email: customer?.email || '',
        contact: customer?.phone ? customer.phone.replace(/[^0-9]/g, '').slice(-10) : ''
      },
      notes: {
        customerName: customer?.name || '',
        customerPhone: customer?.phone || '',
        ...(notes || {})
      },
      theme: {
        color: '#1B4332' // Fibax Deep Forest Brand Theme
      },
      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
        }
      },
      handler: async (response) => {
        try {
          // 3. Verify Payment Signature on Backend
          const verifyRes = await apiRequest('/api/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          if (verifyRes.success && verifyRes.verified) {
            if (onSuccess) {
              onSuccess({
                verified: true,
                razorpayOrderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });
            }
          } else {
            throw new Error(verifyRes.error || 'Payment signature verification failed.');
          }
        } catch (err) {
          console.error('Payment verification error:', err);
          if (onFailure) onFailure(err.message || 'Payment verification failed.');
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp) => {
      console.error('Payment failed response:', resp);
      const errMsg = resp.error?.description || 'Payment was declined or cancelled.';
      if (onFailure) onFailure(errMsg);
    });

    rzp.open();
  } catch (error) {
    console.error('Launch Razorpay error:', error);
    if (onFailure) onFailure(error.message || 'Unable to open payment window.');
  }
}
