import 'dotenv/config';
import {
  readEmailConfig,
  isSmtpConfigured,
  verifySmtpConnection,
  sendTestEmail,
  sendForgotPasswordOtpEmail
} from '../services/emailService.js';

async function main() {
  console.log('🔍 Inspecting Hostinger SMTP configuration in environment...');

  const config = readEmailConfig();
  console.log('📋 Effective Settings:');
  console.log(`   Host:     ${config.smtpHost}`);
  console.log(`   Port:     ${config.smtpPort}`);
  console.log(`   Secure:   ${config.smtpSecure}`);
  console.log(`   User:     ${config.smtpUser}`);
  console.log(`   From:     "${config.senderName}" <${config.senderEmail}>`);
  console.log(`   Reply-To: ${config.replyToEmail}`);
  console.log(`   Password: ${config.smtpPassword ? '•••••••• (Present in environment)' : '❌ MISSING (Not set in .env)'}`);

  if (!isSmtpConfigured(config)) {
    console.error('\n❌ SMTP is not fully configured. Please ensure SMTP_PASSWORD is set in .env.');
    process.exit(1);
  }

  // 1. Verify SMTP Connection Handshake with Hostinger
  console.log('\n📡 Step 1: Testing SMTP socket & authentication handshake with smtp.hostinger.com:465...');
  const verifyResult = await verifySmtpConnection(config);
  if (!verifyResult.success) {
    console.error('❌ SMTP Handshake Failed:', verifyResult.error);
    if (verifyResult.code) console.error('   Code:', verifyResult.code);
    process.exit(1);
  }
  console.log('✅ SMTP Connection & Authentication Handshake Successful!');

  // 2. Dispatch Live Test Email to Authorized Inbox
  const targetRecipient = process.argv[2] || config.smtpUser || 'info@fibaxpharma.com';
  console.log(`\n✉️ Step 2: Sending live test email to authorized inbox: ${targetRecipient}...`);
  const testEmailResult = await sendTestEmail(targetRecipient);
  if (!testEmailResult.success) {
    console.error('❌ Failed to deliver test email:', testEmailResult.error);
    process.exit(1);
  }
  console.log('✅ Live Test Email Delivered Successfully!');
  console.log(`   Message ID: ${testEmailResult.messageId}`);
  console.log(`   Recipient:  ${targetRecipient}`);

  // 3. Verify Forgot Password Email OTP Dispatch
  console.log(`\n🔑 Step 3: Verifying Forgot Password Email OTP dispatch to ${targetRecipient}...`);
  // Generate random 6-digit test OTP
  const testOtp = String(Math.floor(100000 + Math.random() * 900000));
  const otpResult = await sendForgotPasswordOtpEmail({
    toEmail: targetRecipient,
    customerName: 'Fibax Verification Admin',
    otp: testOtp
  });

  if (!otpResult.success) {
    console.error('❌ Failed to dispatch Forgot Password OTP email:', otpResult.error);
    process.exit(1);
  }
  console.log('✅ Forgot Password Email OTP Dispatched Successfully!');
  console.log(`   Message ID: ${otpResult.messageId}`);
  console.log(`   Recipient:  ${targetRecipient}`);
  console.log('\n🎉 ALL HOSTINGER SMTP VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Fatal error during SMTP verification:', err.message);
  process.exit(1);
});
