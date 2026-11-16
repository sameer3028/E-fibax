/**
 * Fibax Ayurveda — Order Cancellation Email Template
 * Renders a responsive, professional transactional email HTML string for order cancellations.
 */

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

export function generateOrderCancellationHtml(order, cancellationDetails = {}, emailConfig = {}) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3030';
  const logoUrl = `${baseUrl}/fibax-logo.png`;
  const supportEmail = emailConfig.supportEmail || 'care@fibaxpharma.com';
  const customerName = order.customer?.name || 'Valued Customer';
  const orderId = order.orderId || 'N/A';
  const cancellationReason = cancellationDetails.reason || order.cancellationReason || 'Customer requested cancellation';
  const refundStatus = cancellationDetails.refundStatus || order.refundStatus || 'Not Applicable';
  const refundDetails = cancellationDetails.refundDetails || order.refundDetails || {};

  const cancelledDateFormatted = cancellationDetails.cancelledAt || order.cancelledAt
    ? new Date(cancellationDetails.cancelledAt || order.cancelledAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Items table rows
  const itemsHtml = (order.items || [])
    .map((item) => {
      const unitPrice = Number(item.price || item.salePrice || 0);
      const lineTotal = unitPrice * (Number(item.quantity) || 1);
      return `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #1f2937;">
            <strong>${item.title || 'Product'}</strong>
            <div style="font-size: 11px; color: #6b7280;">Qty: ${item.quantity || 1} &times; ${formatCurrency(unitPrice)}</div>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 13px; font-weight: bold; color: #111827;">
            ${formatCurrency(lineTotal)}
          </td>
        </tr>
      `;
    })
    .join('');

  // Refund notification box
  let refundBoxHtml = '';
  const isPrepaid = order.payment?.method !== 'COD' && order.payment?.method !== 'cod';

  if (isPrepaid) {
    if (refundStatus === 'Processed') {
      refundBoxHtml = `
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 16px; margin: 20px 0;">
          <div style="color: #065f46; font-weight: 700; font-size: 13px; margin-bottom: 4px;">
            ✅ Refund Processed via ${refundDetails.gateway || 'Payment Gateway'}
          </div>
          <div style="color: #047857; font-size: 12px; line-height: 1.5;">
            A full refund of <strong>${formatCurrency(order.totals?.grandTotal || 0)}</strong> has been initiated.
            ${refundDetails.refundId ? `<div>Refund Reference ID: <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px;">${refundDetails.refundId}</code></div>` : ''}
            <div>It usually reflects in your original payment account within 3 to 5 business days.</div>
          </div>
        </div>
      `;
    } else {
      refundBoxHtml = `
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 16px; margin: 20px 0;">
          <div style="color: #92400e; font-weight: 700; font-size: 13px; margin-bottom: 4px;">
            ⏳ Refund Verification in Progress
          </div>
          <div style="color: #b45309; font-size: 12px; line-height: 1.5;">
            Your prepaid order is eligible for a full refund of <strong>${formatCurrency(order.totals?.grandTotal || 0)}</strong>.
            Our billing team is reviewing this cancellation and will process the credit to your source account shortly.
          </div>
        </div>
      `;
    }
  } else {
    refundBoxHtml = `
      <div style="background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; margin: 20px 0;">
        <div style="color: #374151; font-weight: 700; font-size: 13px; margin-bottom: 4px;">
          💵 Cash on Delivery Order Cancelled
        </div>
        <div style="color: #4b5563; font-size: 12px; line-height: 1.5;">
          Since this was a Cash on Delivery (COD) order, no advance payment was charged and no refund is required.
        </div>
      </div>
    `;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancellation Confirmed - #${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color: #173e27; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">FIBAX AYURVEDA</h1>
              <p style="color: #a7f3d0; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Classical & Certified Herbal Healthcare</p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 28px 24px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #fee2e2; color: #991b1b; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px;">
                Order Cancelled
              </div>

              <h2 style="color: #111827; font-size: 18px; font-weight: 800; margin: 0 0 12px 0;">
                Order #${orderId} Has Been Cancelled
              </h2>

              <p style="color: #4b5563; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
                Namaste <strong>${customerName}</strong>, this email confirms that your order <strong>#${orderId}</strong> has been cancelled on <strong>${cancelledDateFormatted}</strong>.
              </p>

              <!-- Cancellation Reason -->
              <div style="background-color: #fdf2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
                <span style="font-size: 11px; font-weight: bold; color: #991b1b; text-transform: uppercase; display: block;">Cancellation Reason</span>
                <span style="font-size: 13px; color: #7f1d1d; font-weight: 600;">${cancellationReason}</span>
              </div>

              <!-- Refund Status Box -->
              ${refundBoxHtml}

              <!-- Items Summary -->
              <h3 style="font-size: 13px; font-weight: 800; color: #111827; margin: 24px 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                Cancelled Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
                ${itemsHtml}
              </table>

              <!-- Totals -->
              <div style="border-top: 2px solid #e5e7eb; padding-top: 12px; text-align: right; font-size: 14px;">
                <span style="color: #6b7280; font-weight: 600;">Order Total: </span>
                <strong style="color: #111827; font-size: 16px;">${formatCurrency(order.totals?.grandTotal || 0)}</strong>
              </div>

              <!-- Support Note -->
              <div style="margin-top: 32px; padding: 16px; background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; text-align: center;">
                <p style="font-size: 12px; color: #44403c; margin: 0 0 8px 0;">
                  If you have questions about this cancellation or wish to place a revised order, please contact our Ayurvedic Advisory Desk:
                </p>
                <p style="font-size: 12px; font-weight: bold; color: #173e27; margin: 0;">
                  📞 Helpline & WhatsApp: <a href="tel:+918872544458" style="color: #173e27; text-decoration: none;">+91 88725 44458</a> &nbsp;|&nbsp; ✉️ <a href="mailto:${supportEmail}" style="color: #173e27; text-decoration: none;">${supportEmail}</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f3f4f6; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">
                Fibax Ayurveda • CCC, VIP Road, Zirakpur, Punjab 140603
              </p>
              <p style="font-size: 10px; color: #9ca3af; margin: 0;">
                This is an automated operational notification regarding your Fibax Ayurveda order.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export function generateOrderCancellationText(order, cancellationDetails = {}) {
  const customerName = order.customer?.name || 'Valued Customer';
  const orderId = order.orderId || 'N/A';
  const reason = cancellationDetails.reason || order.cancellationReason || 'Customer requested cancellation';
  const refundStatus = cancellationDetails.refundStatus || order.refundStatus || 'Not Applicable';

  return `
FIBAX AYURVEDA — ORDER CANCELLATION CONFIRMED

Namaste ${customerName},

Your order #${orderId} has been successfully cancelled.

Cancellation Reason: ${reason}
Refund Status: ${refundStatus}
Order Total: ₹${order.totals?.grandTotal || 0}

For assistance or queries, please reach us on WhatsApp or Call at +91 88725 44458 or care@fibaxpharma.com.

Warm regards,
Fibax Ayurveda Team
  `.trim();
}
