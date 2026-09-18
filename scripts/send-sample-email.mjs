import nodemailer from 'nodemailer';

const t = nodemailer.createTransport({
  host: 'ns1.sslsecure.co.in',
  port: 587,
  secure: false,
  auth: { user: 'info@myvedicastrology.in', pass: '1qLVTZ0vOgFkx' },
  tls: { rejectUnauthorized: false }
});

async function main() {
  console.log('Sending sample service email to roiprojects012@gmail.com...');
  const info = await t.sendMail({
    from: '"My Vedic Astrology" <info@myvedicastrology.in>',
    to: 'roiprojects012@gmail.com',
    replyTo: 'info@myvedicastrology.in',
    subject: 'Sample Service Confirmation — My Vedic Astrology',
    html: `
<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#fffbf0;border:1px solid #e9c97e;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#b45309,#92400e);padding:24px 32px;">
    <h1 style="margin:0;color:#ffe08a;font-size:22px;">ॐ My Vedic Astrology</h1>
    <p style="margin:6px 0 0;color:#ffe9b3;font-size:13px;">Sampath Kumara Guruji · Bangalore</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:16px;color:#1c1010;">Namaste 🙏</p>
    <p style="color:#4b3320;line-height:1.7;">This is a verified sample service email sent to <strong>roiprojects012@gmail.com</strong> to confirm that SMTP email delivery from <strong>info@myvedicastrology.in</strong> is functioning properly.</p>
    <div style="background:#fef3c7;border-left:4px solid #b45309;padding:14px 18px;margin:20px 0;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:12px;color:#7c4a00;text-transform:uppercase;letter-spacing:0.08em;">Sample Booking Reference</p>
      <p style="margin:0;font-size:26px;font-weight:bold;letter-spacing:3px;color:#b45309;font-family:monospace;">VA-SAMPLE-TEST</p>
      <p style="margin:6px 0 0;font-size:12px;color:#7c4a00;">Service: Ganapathi Homam / Vedic Consultation</p>
    </div>
    <p style="color:#4b3320;line-height:1.7;">All customer booking confirmations and admin notifications are dispatched through this authenticated mail server.</p>
    <p style="margin-top:24px;color:#4b3320;">With blessings,<br/><strong style="color:#b45309;">Sampath Kumara Guruji</strong><br/>My Vedic Astrology · Bangalore<br/><a href="https://myvedicastrology.in" style="color:#b45309;">myvedicastrology.in</a></p>
  </div>
</div>`,
    text: 'Namaste. This is a verified sample service email to roiprojects012@gmail.com confirming SMTP email delivery from info@myvedicastrology.in.'
  });

  console.log('✅ Email successfully sent to roiprojects012@gmail.com!');
  console.log('Message ID:', info.messageId);
  console.log('Server Response:', info.response);
}

main().catch(console.error);
