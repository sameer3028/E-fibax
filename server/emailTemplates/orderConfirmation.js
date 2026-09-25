/**
 * Fibax Ayurveda — Order Confirmation Email Template
 * Renders a responsive, professional transactional email HTML string.
 */

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

export function generateOrderConfirmationHtml(order, emailConfig = {}) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3030';
  const logoUrl = `${baseUrl}/fibax-logo.png`;
  const trackUrl = `${baseUrl}/#track?orderId=${encodeURIComponent(order.orderId)}`;
  const shopUrl = `${baseUrl}/`;

  const supportEmail = emailConfig.supportEmail || 'care@fibaxpharma.com';
  const customerName = order.customer?.name || 'Valued Customer';
  const orderDateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Items rows HTML
  const itemsHtml = (order.items || [])
    .map((item) => {
      const imgUrl = item.image
        ? (item.image.startsWith('http') ? item.image : `${baseUrl}${item.image}`)
        : `${baseUrl}/fibax-logo.png`;

      const unitPrice = Number(item.price || item.salePrice || 0);
      const lineTotal = unitPrice * (Number(item.quantity) || 1);

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top;" width="70">
            <img src="${imgUrl}" alt="${item.title || 'Product'}" width="56" height="56" style="width: 56px; height: 56px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb; background-color: #ffffff; display: block;" />
          </td>
          <td style="padding: 12px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
            <div style="font-size: 14px; font-weight: 700; color: #0f382c; line-height: 1.3;">
              ${item.title || 'Fibax Product'}
            </div>
            ${item.variant || item.volumeWeight ? `<div style="font-size: 12px; color: #6b7280; margin-top: 2px;">Variant/Pack: ${item.variant || item.volumeWeight}</div>` : ''}
            <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">
              Qty: <strong>${item.quantity || 1}</strong> &times; ${formatCurrency(unitPrice)}
            </div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: right; font-size: 14px; font-weight: 700; color: #0f382c;" width="90">
            ${formatCurrency(lineTotal)}
          </td>
        </tr>
      `;
    })
    .join('');

  // Totals rows
  const subtotal = Number(order.totals?.subtotal) || 0;
  const discount = Number(order.totals?.discountAmount) || 0;
  const shippingFee = Number(order.totals?.shippingFee) || 0;
  const codFee = Number(order.totals?.codFee) || 0;
  const taxes = Number(order.totals?.taxes || order.totals?.tax) || 0;
  const grandTotal = Number(order.totals?.grandTotal) || (subtotal - discount + shippingFee + codFee + taxes);

  const paymentMethodText = (order.payment?.method || 'COD').toUpperCase() === 'COD'
    ? 'Cash on Delivery'
    : 'Online Payment (Prepaid)';

  const shippingAddress = order.shipping || order.customer || {};

  // Real AWB display if present
  const awb = order.trackingId || order.delhiveryAwb;
  const courierName = order.courier || 'Delhivery Express Surface & Air';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed – #${order.orderId} | Fibax Ayurveda</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; padding: 12px !important; }
      .content-card { padding: 16px !important; }
      .col-half { width: 100% !important; display: block !important; margin-bottom: 12px; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8; padding: 24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="width: 600px; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f382c; padding: 28px 32px; text-align: center; border-bottom: 3px solid #2e7d32;">
              <img src="${logoUrl}" alt="Fibax Ayurveda" width="140" style="width: 140px; height: auto; max-height: 48px; object-fit: contain; display: inline-block;" />
              <div style="color: #a7f3d0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 8px;">
                Authentic Doctor-Formulated Ayurveda
              </div>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-card" style="padding: 32px;">
              
              <!-- Greeting & Thank You -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f382c; line-height: 1.2;">
                      Thank You for Your Order!
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 15px; color: #4b5563; line-height: 1.5;">
                      Hello <strong>${customerName}</strong>, your order has been successfully placed and is confirmed. Our team is preparing your authentic Ayurvedic formulations for dispatch.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order Summary Badge Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Order Number</div>
                    <div style="font-size: 16px; font-weight: 800; color: #0f382c; margin-top: 2px; font-family: monospace;">#${order.orderId}</div>
                  </td>
                  <td width="50%" style="vertical-align: top; text-align: right;">
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Order Status</div>
                    <div style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 20px; margin-top: 2px;">
                      &#10003; Order Confirmed
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 12px; border-top: 1px solid #f3f4f6; margin-top: 12px;">
                    <div style="font-size: 12px; color: #6b7280;">Order Placed On: <strong>${orderDateFormatted}</strong></div>
                  </td>
                </tr>
              </table>

              <!-- Action Button Primary (Track Order) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="${trackUrl}" target="_blank" style="display: inline-block; background-color: #0f382c; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 2px 8px rgba(15,56,44,0.25); text-align: center;">
                      Track Your Order &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Order Items Section -->
              <div style="margin-top: 28px; font-size: 16px; font-weight: 700; color: #0f382c; border-bottom: 2px solid #0f382c; padding-bottom: 8px;">
                Order Items Summary
              </div>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 8px;">
                ${itemsHtml}
              </table>

              <!-- Price Breakdown & Payment Info Grid -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td class="col-half" width="48%" style="vertical-align: top;">
                    
                    <!-- Payment Info Card -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                      <tr>
                        <td>
                          <div style="font-size: 12px; font-weight: 700; color: #0f382c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                            Payment Information
                          </div>
                          <div style="font-size: 13px; color: #1f2937; font-weight: 600;">
                            Method: ${paymentMethodText}
                          </div>
                          <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            Status: <strong style="color: ${paymentMethodText.includes('Cash') ? '#d97706' : '#059669'};">${(order.payment?.status || 'Pending').toUpperCase()}</strong>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Shipping Info Card -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                      <tr>
                        <td>
                          <div style="font-size: 12px; font-weight: 700; color: #0f382c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                            Shipping Details
                          </div>
                          <div style="font-size: 12px; color: #4b5563; line-height: 1.4;">
                            Status: <strong>Confirmed & Ready for Dispatch</strong><br/>
                            Courier: ${courierName}<br/>
                            ${awb ? `AWB Track No: <strong style="font-family: monospace;">${awb}</strong>` : 'AWB Number: <em>Assigned upon warehouse packing</em>'}
                          </div>
                        </td>
                      </tr>
                    </table>

                  </td>

                  <td width="4%">&nbsp;</td>

                  <td class="col-half" width="48%" style="vertical-align: top;">
                    
                    <!-- Price Breakdown Table -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                      <tr>
                        <td style="font-size: 12px; color: #4b5563; padding: 4px 0;">Subtotal</td>
                        <td style="font-size: 12px; font-weight: 600; color: #1f2937; text-align: right; padding: 4px 0;">${formatCurrency(subtotal)}</td>
                      </tr>
                      ${discount > 0 ? `
                      <tr>
                        <td style="font-size: 12px; color: #059669; padding: 4px 0;">Discount Savings</td>
                        <td style="font-size: 12px; font-weight: 700; color: #059669; text-align: right; padding: 4px 0;">-${formatCurrency(discount)}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="font-size: 12px; color: #4b5563; padding: 4px 0;">Express Delivery</td>
                        <td style="font-size: 12px; font-weight: 600; color: #1f2937; text-align: right; padding: 4px 0;">${shippingFee === 0 ? '<span style="color:#059669; font-weight:700;">FREE</span>' : formatCurrency(shippingFee)}</td>
                      </tr>
                      ${codFee > 0 ? `
                      <tr>
                        <td style="font-size: 12px; color: #4b5563; padding: 4px 0;">COD Handling Fee</td>
                        <td style="font-size: 12px; font-weight: 600; color: #1f2937; text-align: right; padding: 4px 0;">${formatCurrency(codFee)}</td>
                      </tr>` : ''}
                      ${taxes > 0 ? `
                      <tr>
                        <td style="font-size: 12px; color: #4b5563; padding: 4px 0;">Taxes & GST</td>
                        <td style="font-size: 12px; font-weight: 600; color: #1f2937; text-align: right; padding: 4px 0;">${formatCurrency(taxes)}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="font-size: 14px; font-weight: 800; color: #0f382c; padding-top: 10px; border-top: 1px solid #e5e7eb;">Grand Total</td>
                        <td style="font-size: 16px; font-weight: 800; color: #0f382c; text-align: right; padding-top: 10px; border-top: 1px solid #e5e7eb;">${formatCurrency(grandTotal)}</td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Delivery Address Block -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 12px; font-weight: 700; color: #0f382c; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Delivering To
                    </div>
                    <div style="font-size: 14px; font-weight: 700; color: #1f2937;">
                      ${customerName}
                    </div>
                    <div style="font-size: 13px; color: #4b5563; margin-top: 4px; line-height: 1.4;">
                      ${shippingAddress.address || 'Delivery Address'}<br/>
                      ${shippingAddress.city || ''}${shippingAddress.state ? ', ' + shippingAddress.state : ''} - <strong>${shippingAddress.pincode || ''}</strong><br/>
                      Phone: <strong>${shippingAddress.phone || order.customer?.phone || 'N/A'}</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Optional Expected Delivery Section -->
              ${order.estimatedDelivery ? `
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 13px; color: #065f46;">
                    &#128666; <strong>Estimated Delivery Date:</strong> ${order.estimatedDelivery}
                  </td>
                </tr>
              </table>` : ''}

              <!-- Secondary Button (Continue Shopping) -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td align="center">
                    <a href="${shopUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #0f382c; border: 1.5px solid #0f382c; font-size: 14px; font-weight: 700; text-decoration: none; padding: 10px 24px; border-radius: 10px;">
                      Continue Shopping at Fibax Ayurveda &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
              <div style="font-size: 14px; font-weight: 700; color: #0f382c;">
                Fibax Ayurveda
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                Health &bull; Wellness &bull; Beauty &bull; Personal Care
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 12px; line-height: 1.5;">
                Need help with your order? Contact our Ayurveda Helpline:<br/>
                Email: <a href="mailto:${supportEmail}" style="color: #0f382c; font-weight: 600; text-decoration: underline;">${supportEmail}</a> | WhatsApp: <strong style="color: #0f382c;">+91-7657963458</strong>
              </div>
              <div style="font-size: 11px; color: #9ca3af; margin-top: 16px;">
                &copy; ${new Date().getFullYear()} Fibax Ayurveda. All rights reserved.<br/>
                WHO-GMP & ISO 9001:2015 Certified Manufacturing.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateOrderConfirmationText(order, emailConfig = {}) {
  const baseUrl = process.env.APP_URL || 'http://localhost:3030';
  const trackUrl = `${baseUrl}/#track?orderId=${encodeURIComponent(order.orderId)}`;
  const supportEmail = emailConfig.supportEmail || 'care@fibaxpharma.com';

  const itemsList = (order.items || [])
    .map(it => `- ${it.title} (Qty: ${it.quantity || 1}) - ₹${(Number(it.price) || 0) * (Number(it.quantity) || 1)}`)
    .join('\n');

  return `
Thank You for Your Order!

Order #${order.orderId}
Status: Order Confirmed
Customer: ${order.customer?.name || 'Valued Customer'}

ITEMS:
${itemsList}

GRAND TOTAL: ₹${order.totals?.grandTotal || 0}
PAYMENT METHOD: ${order.payment?.method || 'COD'}

Track Your Order:
${trackUrl}

Need assistance? Contact support at ${supportEmail} or WhatsApp +91-7657963458.
Fibax Ayurveda - Pure Ayurvedic Healthcare & Natural Wellness
`;
}
