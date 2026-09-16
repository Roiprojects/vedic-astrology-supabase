import nodemailer from 'nodemailer';

const t = nodemailer.createTransport({
  host: 'mail.myvedicastrology.in',
  port: 587,
  secure: false,
  auth: { user: 'info@myvedicastrology.in', pass: '1qLVTZ0vOgFkx' },
  tls: { rejectUnauthorized: false }
});

const info = await t.sendMail({
  from: '"My Vedic Astrology" <info@myvedicastrology.in>',
  to: 'saipraneethl2003@gmail.com',
  subject: 'Test Email — My Vedic Astrology',
  html: `
<div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;background:#fffbf0;border:1px solid #e9c97e;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#b45309,#92400e);padding:24px 32px">
    <h1 style="margin:0;color:#ffe08a;font-size:20px">ॐ My Vedic Astrology</h1>
    <p style="margin:8px 0 0;color:#ffe9b3;font-size:13px">Sampath Kumara Guruji · Bangalore</p>
  </div>
  <div style="padding:28px 32px">
    <p style="font-size:15px;color:#1c1010">Namaste 🙏</p>
    <p style="color:#4b3320;line-height:1.7">This is a test email from <strong>myvedicastrology.in</strong> to verify that email delivery is working correctly.</p>
    <p style="color:#4b3320;line-height:1.7">If you received this in your <strong>inbox</strong>, everything is working fine. Please let us know if it landed in spam.</p>
    <p style="margin-top:24px;color:#4b3320">With blessings,<br><strong style="color:#b45309">Sampath Kumara Guruji</strong><br>My Vedic Astrology · Bangalore</p>
  </div>
  <div style="background:#fdf3e3;padding:14px 32px;text-align:center">
    <p style="margin:0;font-size:11px;color:#a38060">© My Vedic Astrology · Bangalore · info@myvedicastrology.in</p>
  </div>
</div>`,
  text: 'Namaste, this is a test email from myvedicastrology.in to verify email delivery.'
});

console.log('✅ Sent:', info.messageId);
console.log('   Server response:', info.response);
