/**
 * Fibax Ayurveda — Forgot Password Verification Code (OTP) Email Template
 * Renders a secure, responsive, branded HTML email for customer password resets.
 */

export function generateForgotPasswordOtpHtml(customerName, otp, emailConfig = {}) {
  const baseUrl = process.env.APP_URL || 'https://fibaxpharma.com';
  const logoUrl = `${baseUrl}/fibax-logo.png`;
  const supportEmail = emailConfig.replyToEmail || emailConfig.supportEmail || 'care@fibaxpharma.com';
  const name = customerName ? customerName.trim() : 'Valued Customer';
  const formattedOtp = String(otp).trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Fibax Ayurveda Password Reset Code</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f5; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f382c; padding: 28px 24px; text-align: center;">
              <img src="${logoUrl}" alt="Fibax Ayurveda" width="140" style="width: 140px; height: auto; display: block; margin: 0 auto 10px auto;" />
              <div style="color: #a7f3d0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                AUTHENTIC AYURVEDIC WELLNESS
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 28px 20px 28px;">
              <h2 style="margin: 0 0 12px 0; color: #0f382c; font-size: 20px; font-weight: 800; line-height: 1.3;">
                Password Reset Verification Code
              </h2>
              
              <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                We received a request to reset the password for your Fibax Ayurveda customer account. Please use the 6-digit verification code below to verify your identity and set a new password:
              </p>

              <!-- Highlighted OTP Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td align="center" style="background-color: #f0fdf4; border: 2px dashed #10b981; border-radius: 16px; padding: 24px 16px;">
                    <div style="font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #065f46; text-transform: uppercase; margin-bottom: 8px;">
                      Your One-Time Password (OTP)
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #047857; line-height: 1; padding-left: 10px;">
                      ${formattedOtp}
                    </div>
                    <div style="font-size: 12px; color: #047857; margin-top: 10px; font-weight: 600;">
                      ⏱️ Valid for 10 minutes only
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Information Callout -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 24px 0; background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 14px 16px;">
                <tr>
                  <td style="font-size: 12px; line-height: 1.5; color: #92400e;">
                    <strong>Security Notice:</strong>
                    <ul style="margin: 6px 0 0 0; padding-left: 18px;">
                      <li>Fibax Ayurveda representatives will <strong>never</strong> ask for your password or OTP.</li>
                      <li>Never share this code with anyone over phone, email, or WhatsApp.</li>
                      <li>If you did not request this password reset, please ignore this email. Your password remains safe and unchanged.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #6b7280;">
                If you have questions or suspect unauthorized access to your account, please reach out to our customer care team at <a href="mailto:${supportEmail}" style="color: #0f382c; font-weight: bold; text-decoration: underline;">${supportEmail}</a> or call <strong>+91 88725 44458</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; border-top: 1px solid #f3f4f6; padding: 20px 24px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.5;">
              <p style="margin: 0 0 6px 0;">
                &copy; ${new Date().getFullYear()} Fibax Ayurveda. All rights reserved.
              </p>
              <p style="margin: 0;">
                Authentic Ayurvedic Formulation &bull; Ministry of AYUSH Certified &bull; GMP Compliant
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateForgotPasswordOtpText(customerName, otp, emailConfig = {}) {
  const supportEmail = emailConfig.replyToEmail || emailConfig.supportEmail || 'care@fibaxpharma.com';
  const name = customerName ? customerName.trim() : 'Valued Customer';
  const formattedOtp = String(otp).trim();

  return `Fibax Ayurveda — Password Reset Verification Code
==================================================

Hello ${name},

We received a request to reset your password for your Fibax Ayurveda account.

Your 6-Digit Verification Code:
[ ${formattedOtp} ]

This code is valid for 10 minutes only.

SECURITY WARNING:
- Fibax Ayurveda representatives will never ask for your password or OTP.
- Do not share this code with anyone.
- If you did not request this password reset, you can safely ignore this email. Your current password remains unchanged.

Support & Inquiries:
Email: ${supportEmail}
Helpline: +91 88725 44458
Website: https://fibaxpharma.com

© ${new Date().getFullYear()} Fibax Ayurveda. All rights reserved.
`;
}
