import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'mail.myvedicastrology.in',
  port: 587,
  secure: false,
  auth: {
    user: 'info@myvedicastrology.in',
    pass: '1qLVTZ0vOgFkx',
  },
  tls: { rejectUnauthorized: false },
  debug: true,
  logger: true,
});

console.log('Verifying SMTP connection...');
try {
  await transporter.verify();
  console.log('✅ SMTP connection verified');
} catch (e) {
  console.log('❌ SMTP verify failed:', e.message);
}

console.log('\nSending test email...');
try {
  const info = await transporter.sendMail({
    from: '"Vedic Astrology" <info@myvedicastrology.in>',
    to: 'roiprojects012@gmail.com',
    subject: 'Test Email from myvedicastrology.in',
    text: 'This is a direct SMTP test from the Vedic Astrology server.',
    html: '<p>This is a direct SMTP test from myvedicastrology.in</p>',
  });
  console.log('✅ Email sent! MessageId:', info.messageId);
  console.log('   Response:', info.response);
} catch (e) {
  console.log('❌ Send failed:', e.message);
  console.log('   Full error:', e.code, e.responseCode, e.response);
}
