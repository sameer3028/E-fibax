/**
 * Generates responsive HTML email template for Admin notification of a new PCD Pharma Franchise Enquiry.
 */
export function generateFranchiseAdminAlertHtml(lead, adminBaseUrl = 'https://fibaxpharma.com') {
  const safeStr = (val) => String(val || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);

  const leadId = safeStr(lead.id);
  const name = safeStr(lead.name);
  const mobile = safeStr(lead.phone);
  const whatsapp = safeStr(lead.whatsapp || lead.phone);
  const email = safeStr(lead.email);
  const state = safeStr(lead.state);
  const city = safeStr(lead.city);
  const businessType = safeStr(lead.businessType || 'Not specified');
  const experience = safeStr(lead.experience || 'Not specified');
  const investment = safeStr(lead.investmentRange || 'Not specified');
  const message = safeStr(lead.message || 'No additional message provided.');
  const submittedAt = new Date(lead.createdAt || Date.now()).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const adminDeepLink = `${adminBaseUrl.replace(/\/$/, '')}/admin?tab=franchise-leads&leadId=${encodeURIComponent(lead.id)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New PCD Pharma Franchise Enquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F6F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F6F5; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="640" cellpadding="0" cellspacing="0" border="0" style="max-width: 640px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #1B4D3E; padding: 28px 24px; text-align: center;">
              <span style="display: inline-block; padding: 4px 12px; background-color: #D97706; color: #FFFFFF; font-size: 11px; font-weight: 800; border-radius: 20px; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px;">
                NEW BUSINESS ENQUIRY
              </span>
              <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 800; margin: 6px 0 0; letter-spacing: -0.3px;">
                PCD Pharma Franchise Application
              </h1>
              <p style="color: #D1FAE5; font-size: 13px; margin: 4px 0 0;">
                Reference ID: <strong style="color: #FFFFFF;">${leadId}</strong>
              </p>
            </td>
          </tr>

          <!-- Summary Intro -->
          <tr>
            <td style="padding: 24px 24px 16px;">
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 16px;">
                A new franchise partnership application has been submitted on the Fibax Ayurveda portal. Below are the verified applicant details:
              </p>

              <!-- Applicant Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280; width: 35%;">Applicant Name:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #111827;">${name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280;">Mobile Number:</td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #111827;">
                    <a href="tel:${mobile}" style="color: #1B4D3E; font-weight: 700; text-decoration: none;">+91 ${mobile}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280;">WhatsApp Number:</td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #111827;">
                    <a href="https://wa.me/91${whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(name)}%2C%20regarding%20your%20Fibax%20Ayurveda%20Franchise%20enquiry%20(${leadId})" style="color: #059669; font-weight: 700; text-decoration: none;">
                      +91 ${whatsapp} &rarr; Open Chat
                    </a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280;">Email Address:</td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #111827;">
                    <a href="mailto:${email}" style="color: #1B4D3E; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280;">Target Territory:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #111827;">${city}, ${state}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280;">Business Profile:</td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #111827;">${businessType}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280;">Pharma Experience:</td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #111827;">${experience}</td>
                </tr>
                <tr style="border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280;">Investment Capacity:</td>
                  <td style="padding: 10px 16px; font-size: 13px; font-weight: 700; color: #D97706;">${investment}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 16px; font-size: 12px; font-weight: bold; color: #6B7280; vertical-align: top;">Applicant Notes:</td>
                  <td style="padding: 10px 16px; font-size: 13px; color: #374151; line-height: 1.5;">${message}</td>
                </tr>
              </table>

              <!-- Submission Meta -->
              <p style="font-size: 12px; color: #6B7280; margin: 0 0 20px;">
                Submitted On: <strong>${submittedAt}</strong> (IST)
              </p>

              <!-- Action Button -->
              <div style="text-align: center; margin: 24px 0 12px;">
                <a href="${adminDeepLink}" style="display: inline-block; padding: 14px 28px; background-color: #1B4D3E; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  Review Lead in Admin Console &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 16px 24px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 11px; color: #9CA3AF;">
              <p style="margin: 0;">This is an automated administrative notification from Fibax Ayurveda (https://fibaxpharma.com).</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateFranchiseAdminAlertText(lead) {
  return `NEW PCD PHARMA FRANCHISE ENQUIRY
Reference ID: ${lead.id}
Date: ${new Date(lead.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Applicant Details:
- Name: ${lead.name}
- Phone: +91 ${lead.phone}
- WhatsApp: +91 ${lead.whatsapp || lead.phone}
- Email: ${lead.email}
- Location: ${lead.city}, ${lead.state}
- Business Type: ${lead.businessType || 'N/A'}
- Experience: ${lead.experience || 'N/A'}
- Expected Investment: ${lead.investmentRange || 'N/A'}
- Message: ${lead.message || 'None'}

Review lead in Admin Console: https://fibaxpharma.com/admin?tab=franchise-leads&leadId=${encodeURIComponent(lead.id)}
`;
}
