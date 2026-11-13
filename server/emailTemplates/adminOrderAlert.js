/**
 * Fibax Ayurveda — Admin New Order Alert Email Template
 * Renders a responsive, high-priority transactional notification HTML string for store administrators.
 */

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₹' + num.toLocaleString('en-IN');
}

export function generateAdminOrderAlertHtml(order, emailConfig = {}) {
  const baseUrl = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://www.fibaxpharma.com' : 'http://localhost:3030');
  const logoUrl = `${baseUrl}/fibax-logo.png`;
  const adminOrderUrl = `${baseUrl}/admin?tab=orders&orderId=${encodeURIComponent(order.orderId)}`;

  const customerName = order.customer?.name || 'Customer';
  const customerPhone = order.customer?.phone || 'Not Provided';
  const customerEmail = order.customer?.email || 'Not Provided';

  const orderDateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Delivery Address
  const shipping = order.shipping || order.customer || {};
  const addressLine = shipping.address || 'Address Not Provided';
  const city = shipping.city || '';
  const state = shipping.state || '';
  const pincode = shipping.pincode || '';
  const cityStatePin = [city, state, pincode].filter(Boolean).join(', ');

  // Payment Details
  const isCod = (order.payment?.method || 'COD').toUpperCase().includes('COD');
  const paymentMethodText = isCod ? 'Cash on Delivery (COD)' : (order.payment?.method || 'Prepaid / Online');
  const paymentStatus = order.payment?.status || (isCod ? 'Pending Cash Collection' : 'Paid');
  const paymentRef = order.payment?.transactionId || order.payment?.paymentId || order.payment?.razorpay_payment_id || (isCod ? `COD-${order.orderId}` : 'N/A');

  // Totals
  const subtotal = Number(order.totals?.subtotal) || 0;
  const discount = Number(order.totals?.discountAmount) || 0;
  const couponCode = order.totals?.couponCode || null;
  const shippingFee = Number(order.totals?.shippingFee) || 0;
  const codFee = Number(order.totals?.codFee) || 0;
  const grandTotal = Number(order.totals?.grandTotal) || (subtotal - discount + shippingFee + codFee);

  // Items rows HTML
  const itemsHtml = (order.items || []).map((item) => {
    const unitPrice = Number(item.price || item.salePrice || 0);
    const qty = Number(item.quantity) || 1;
    const lineTotal = unitPrice * qty;
    const sku = item.sku || item.product?.sku || item.id || 'N/A';
    const variant = item.variant || item.volumeWeight || null;

    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
          <div style="font-size: 14px; font-weight: 700; color: #0f382c; line-height: 1.3;">
            ${item.title || item.name || 'Fibax Product'}
          </div>
          <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
            SKU: <strong style="font-family: monospace; color: #374151;">${sku}</strong>
            ${variant ? ` &bull; Pack: <strong style="color: #0f382c;">${variant}</strong>` : ''}
          </div>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: center; font-size: 13px; font-weight: 700; color: #1f2937;" width="50">
          ${qty}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: right; font-size: 13px; color: #4b5563;" width="80">
          ${formatCurrency(unitPrice)}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; text-align: right; font-size: 14px; font-weight: 800; color: #0f382c;" width="90">
          ${formatCurrency(lineTotal)}
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NEW ORDER RECEIVED | Order #${order.orderId} | Fibax Ayurveda</title>
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
          
          <!-- Top Priority Banner -->
          <tr>
            <td style="background-color: #0f382c; padding: 20px 24px; text-align: center; border-bottom: 3px solid #d97706;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <img src="${logoUrl}" alt="Fibax Ayurveda" width="120" style="width: 120px; height: auto; max-height: 40px; object-fit: contain; display: block;" />
                  </td>
                  <td align="right">
                    <div style="display: inline-block; background-color: #d97706; color: #ffffff; font-size: 11px; font-weight: 800; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.8px;">
                      &#9889; New Order Alert
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td class="content-card" style="padding: 28px;">

              <!-- Header Heading -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f382c; line-height: 1.2;">
                      New Customer Order Received!
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 14px; color: #4b5563; line-height: 1.4;">
                      A new order has been placed on <strong>Fibax Ayurveda</strong> and requires store processing & fulfillment.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Order Snapshot Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; background-color: #fbf9f4; border: 1px solid #e8e2d5; border-radius: 12px; padding: 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Order ID</div>
                    <div style="font-size: 16px; font-weight: 800; color: #0f382c; margin-top: 2px; font-family: monospace;">#${order.orderId}</div>
                    <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Placed: <strong>${orderDateFormatted}</strong></div>
                  </td>
                  <td width="50%" style="vertical-align: top; text-align: right;">
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Grand Total</div>
                    <div style="font-size: 20px; font-weight: 900; color: #0f382c; margin-top: 2px;">${formatCurrency(grandTotal)}</div>
                    <div style="display: inline-block; background-color: ${isCod ? '#fef3c7' : '#d1fae5'}; color: ${isCod ? '#92400e' : '#065f46'}; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 12px; margin-top: 4px;">
                      ${isCod ? 'Cash on Delivery' : 'Prepaid Verified'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Prominent Admin Action Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                <tr>
                  <td align="center">
                    <a href="${adminOrderUrl}" target="_blank" style="display: inline-block; background-color: #0f382c; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(15,56,44,0.3); text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">
                      VIEW ORDER IN ADMIN PANEL &rarr;
                    </a>
                    <div style="font-size: 11px; color: #9ca3af; margin-top: 6px;">
                      * Secure Link: Requires authorized Admin login to access order details.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Customer Details & Shipping Address Card -->
              <div style="margin-top: 24px; font-size: 14px; font-weight: 800; color: #0f382c; border-bottom: 2px solid #0f382c; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                Customer &amp; Delivery Information
              </div>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">
                <tr>
                  <td class="col-half" width="50%" style="vertical-align: top; padding-right: 8px;">
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Customer Contact</div>
                    <div style="font-size: 14px; font-weight: 700; color: #111827; margin-top: 4px;">${customerName}</div>
                    <div style="font-size: 13px; color: #374151; margin-top: 4px;">
                      Phone: <a href="tel:${customerPhone}" style="color: #0f382c; font-weight: 700; text-decoration: none;">${customerPhone}</a>
                    </div>
                    <div style="font-size: 13px; color: #4b5563; margin-top: 2px;">
                      Email: ${customerEmail !== 'Not Provided' ? `<a href="mailto:${customerEmail}" style="color: #0f382c; text-decoration: none;">${customerEmail}</a>` : '<span style="color:#9ca3af;">Not provided</span>'}
                    </div>
                  </td>
                  <td class="col-half" width="50%" style="vertical-align: top; padding-left: 8px;">
                    <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Delivery Address</div>
                    <div style="font-size: 13px; color: #1f2937; line-height: 1.4; margin-top: 4px;">
                      ${addressLine}<br/>
                      <strong>${cityStatePin}</strong>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Order Items Table -->
              <div style="margin-top: 24px; font-size: 14px; font-weight: 800; color: #0f382c; border-bottom: 2px solid #0f382c; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                Ordered Items (${(order.items || []).length})
              </div>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 8px;">
                <thead>
                  <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px; font-weight: 800; color: #6b7280; text-transform: uppercase;">
                    <th align="left" style="padding: 8px 0;">Item</th>
                    <th align="center" style="padding: 8px 8px;" width="50">Qty</th>
                    <th align="right" style="padding: 8px 8px;" width="80">Price</th>
                    <th align="right" style="padding: 8px 0;" width="90">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Payment & Financial Summary -->
              <div style="margin-top: 24px; font-size: 14px; font-weight: 800; color: #0f382c; border-bottom: 2px solid #0f382c; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                Payment &amp; Financial Summary
              </div>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 12px;">
                <tr>
                  <td class="col-half" width="48%" style="vertical-align: top;">
                    <!-- Payment Status Card -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px;">
                      <tr>
                        <td>
                          <div style="font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Payment Details</div>
                          <div style="font-size: 13px; font-weight: 700; color: #111827; margin-top: 4px;">
                            ${paymentMethodText}
                          </div>
                          <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">
                            Status: <strong style="color: ${isCod ? '#d97706' : '#059669'};">${paymentStatus}</strong>
                          </div>
                          <div style="font-size: 11px; color: #6b7280; margin-top: 4px; word-break: break-all;">
                            Reference: <code style="font-family: monospace;">${paymentRef}</code>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td class="col-half" width="52%" style="vertical-align: top; padding-left: 12px;">
                    <!-- Totals Table -->
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 13px;">
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Subtotal:</td>
                        <td align="right" style="padding: 4px 0; color: #111827; font-weight: 600;">${formatCurrency(subtotal)}</td>
                      </tr>
                      ${discount > 0 ? `
                        <tr>
                          <td style="padding: 4px 0; color: #059669;">Discount ${couponCode ? `(${couponCode})` : ''}:</td>
                          <td align="right" style="padding: 4px 0; color: #059669; font-weight: 700;">-${formatCurrency(discount)}</td>
                        </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 4px 0; color: #6b7280;">Shipping Charges:</td>
                        <td align="right" style="padding: 4px 0; color: #111827; font-weight: 600;">${shippingFee === 0 ? '<span style="color: #059669; font-weight: 700;">FREE</span>' : formatCurrency(shippingFee)}</td>
                      </tr>
                      ${codFee > 0 ? `
                        <tr>
                          <td style="padding: 4px 0; color: #6b7280;">COD Convenience Fee:</td>
                          <td align="right" style="padding: 4px 0; color: #111827; font-weight: 600;">${formatCurrency(codFee)}</td>
                        </tr>
                      ` : ''}
                      <tr style="border-top: 2px solid #0f382c;">
                        <td style="padding: 10px 0 0 0; font-size: 15px; font-weight: 900; color: #0f382c;">Final Order Amount:</td>
                        <td align="right" style="padding: 10px 0 0 0; font-size: 16px; font-weight: 900; color: #0f382c;">${formatCurrency(grandTotal)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
              <div>This is an automated administrative notification from <strong>Fibax Ayurveda</strong>.</div>
              <div style="margin-top: 4px; font-size: 11px; color: #9ca3af;">
                Alert generated at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
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

export function generateAdminOrderAlertText(order, emailConfig = {}) {
  const baseUrl = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://www.fibaxpharma.com' : 'http://localhost:3030');
  const adminOrderUrl = `${baseUrl}/admin?tab=orders&orderId=${encodeURIComponent(order.orderId)}`;

  const customerName = order.customer?.name || 'Customer';
  const customerPhone = order.customer?.phone || 'Not Provided';
  const customerEmail = order.customer?.email || 'Not Provided';
  const shipping = order.shipping || order.customer || {};

  const subtotal = Number(order.totals?.subtotal) || 0;
  const discount = Number(order.totals?.discountAmount) || 0;
  const grandTotal = Number(order.totals?.grandTotal) || 0;
  const isCod = (order.payment?.method || 'COD').toUpperCase().includes('COD');

  const itemsList = (order.items || []).map(i => {
    return `- ${i.title || i.name} (Qty: ${i.quantity || 1}) @ ${formatCurrency(i.price || 0)} = ${formatCurrency((i.price || 0) * (i.quantity || 1))}`;
  }).join('\n');

  return `
========================================
NEW ORDER RECEIVED — FIBAX AYURVEDA
Order #${order.orderId}
========================================

Order Date: ${order.createdAt}
Order Status: ${order.status || 'Processing'}

CUSTOMER DETAILS:
Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}
Address: ${shipping.address || ''}, ${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}

ORDER ITEMS:
${itemsList}

FINANCIAL SUMMARY:
Subtotal: ${formatCurrency(subtotal)}
Discount: ${formatCurrency(discount)}
Grand Total: ${formatCurrency(grandTotal)}
Payment Method: ${isCod ? 'Cash on Delivery (COD)' : 'Prepaid'}
Payment Status: ${order.payment?.status || (isCod ? 'Pending Cash Collection' : 'Paid')}
Reference: ${order.payment?.transactionId || 'N/A'}

VIEW IN ADMIN PANEL:
${adminOrderUrl}

--
Fibax Ayurveda Automated Order Alert Engine
`.trim();
}
