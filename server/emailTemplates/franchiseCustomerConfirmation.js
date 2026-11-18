/**
 * Generates responsive HTML email confirmation sent to the customer after submitting a PCD Pharma Franchise Enquiry.
 */
export function generateFranchiseCustomerConfirmationHtml(lead) {
  const safeStr = (val) => String(val || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);

  const leadId = safeStr(lead.id);
  const name = safeStr(lead.name);
  const city = safeStr(lead.city);
  const state = safeStr(lead.state);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Franchise Enquiry with Fibax Ayurveda</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F6F5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="640" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1B4D3E; padding: 32px 24px; text-align: center;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #D97706; color: #FFFFFF; font-size: 11px; font-weight: 800; border-radius: 20px; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px;">
                APPLICATION ACKNOWLEDGED
              </span>
              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 6px 0 0; letter-spacing: -0.3px;">
                Thank You for Choosing Fibax Ayurveda
              </h1>
              <p style="color: #D1FAE5; font-size: 13px; margin: 4px 0 0;">
                Application Reference ID: <strong style="color: #FFFFFF;">${leadId}</strong>
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 24px 20px;">
              <p style="font-size: 15px; line-height: 1.6; color: #111827; margin: 0 0 16px;">
                Dear <strong>${name}</strong>,
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 20px;">
                We have received your franchise enquiry for <strong>${city}, ${state}</strong>. Our franchise business development team has initiated the territory availability verification.
              </p>

              <!-- Process Step Overview -->
              <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #1B4D3E; margin: 0 0 12px; font-weight: 800;">
                  What Happens Next:
                </h3>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #374151;">
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 24px; font-weight: 800; color: #1B4D3E;">1.</td>
                    <td style="padding: 6px 0;"><strong>Direct Contact:</strong> A senior franchise manager will contact you within 24–48 business hours via phone or WhatsApp.</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 24px; font-weight: 800; color: #1B4D3E;">2.</td>
                    <td style="padding: 6px 0;"><strong>Territory &amp; Product Discussion:</strong> We will review available products and district-level monopoly possibilities.</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; vertical-align: top; width: 24px; font-weight: 800; color: #1B4D3E;">3.</td>
                    <td style="padding: 6px 0;"><strong>Catalog &amp; Quotation:</strong> You will receive our wholesale price list, profit margins, and marketing starter kit preview.</td>
                  </tr>
                </table>
              </div>

              <!-- Immediate Contact Options -->
              <p style="font-size: 13px; line-height: 1.5; color: #6B7280; margin: 0 0 20px;">
                Need urgent assistance or have immediate questions about product availability? You can reach our dedicated business desk directly:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/918872544458?text=Hello%20Fibax%20Ayurveda%2C%20following%20up%20on%20my%20Franchise%20Enquiry%20Ref%3A%20${leadId}" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: #FFFFFF; text-decoration: none; font-size: 13px; font-weight: 700; border-radius: 10px; margin-right: 8px;">
                      💬 Chat on WhatsApp (+91 88725 44458)
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; color: #6B7280; margin: 0;">
                Warm Regards,<br>
                <strong style="color: #1B4D3E;">Franchise &amp; Institutional Sales Team</strong><br>
                Fibax Ayurveda Healthcare | Punjab, India
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 18px 24px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
              <p style="margin: 0 0 4px;">Fibax Ayurveda • ISO &amp; WHO-GMP Certified Classical Herbal Health Sciences</p>
              <p style="margin: 0;">Visit us online: <a href="https://fibaxpharma.com" style="color: #1B4D3E; text-decoration: none;">fibaxpharma.com</a> | Helpline: +91 88725 44458</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateFranchiseCustomerConfirmationText(lead) {
  return `Dear ${lead.name},

Thank you for your PCD Pharma Franchise enquiry with Fibax Ayurveda!

Application Reference ID: ${lead.id}
Location: ${lead.city}, ${lead.state}

Our franchise business development team has received your enquiry and will reach out to you within 24 to 48 business hours to discuss territory availability, product catalogues, and dealer margins.

If you have urgent questions, feel free to reach our business team on WhatsApp:
https://wa.me/918872544458?text=Hello%20Fibax%20Ayurveda%2C%20following%20up%20on%20my%20Franchise%20Enquiry%20Ref%3A%20${lead.id}

Warm regards,
Franchise & Institutional Sales Team
Fibax Ayurveda Healthcare
Website: https://fibaxpharma.com
Phone: +91 88725 44458
`;
}
