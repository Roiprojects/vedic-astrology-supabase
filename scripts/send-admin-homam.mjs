import nodemailer from 'nodemailer';

const t = nodemailer.createTransport({
  host: 'ns1.sslsecure.co.in',
  port: 587,
  secure: false,
  auth: { user: 'info@myvedicastrology.in', pass: '1qLVTZ0vOgFkx' },
  tls: { rejectUnauthorized: false }
});

async function main() {
  console.log('Sending admin booking notification to info@myvedicastrology.in...');
  const adminHtml = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0c068;border-radius:10px;padding:24px;background:#fffdfa;">
  <h2 style="color:#b45309;margin-top:0;">🕉️ New Homam Booking — VA-HOMAM-MU6SL9DG</h2>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr style="border-bottom:1px solid #f0e6d2;"><td style="padding:8px 0;color:#666;width:140px;">Customer Name</td><td style="padding:8px 0;font-weight:bold;color:#1c1010;">Rohit Sharma</td></tr>
    <tr style="border-bottom:1px solid #f0e6d2;"><td style="padding:8px 0;color:#666;">Phone</td><td style="padding:8px 0;color:#1c1010;">+91 9886100565</td></tr>
    <tr style="border-bottom:1px solid #f0e6d2;"><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;color:#1c1010;">roiprojects012@gmail.com</td></tr>
    <tr style="border-bottom:1px solid #f0e6d2;"><td style="padding:8px 0;color:#666;">Homam / Service</td><td style="padding:8px 0;font-weight:bold;color:#b45309;">Ganapathi Homam</td></tr>
    <tr style="border-bottom:1px solid #f0e6d2;"><td style="padding:8px 0;color:#666;">Preferred Date</td><td style="padding:8px 0;color:#1c1010;">2026-09-25</td></tr>
    <tr style="border-bottom:1px solid #f0e6d2;"><td style="padding:8px 0;color:#666;">Date of Birth</td><td style="padding:8px 0;color:#1c1010;">10 Jun 1992 (09:15 AM)</td></tr>
    <tr style="border-bottom:1px solid #f0e6d2;"><td style="padding:8px 0;color:#666;">Place of Birth</td><td style="padding:8px 0;color:#1c1010;">Bangalore</td></tr>
    <tr><td style="padding:8px 0;color:#666;vertical-align:top;">Message / Note</td><td style="padding:8px 0;color:#1c1010;">Booking Ganapathi Homam for obstacle removal and new venture blessings</td></tr>
  </table>
  <div style="background:#fdf3e3;padding:12px;border-radius:6px;margin-top:16px;">
    <p style="margin:0;font-size:12px;color:#8a5a2e;">This booking has been saved in Supabase (Enquiry ID #57). You can view it in the Admin Dashboard at <a href="https://myvedicastrology.in/admin/enquiries" style="color:#b45309;">Admin Panel → Enquiries</a>.</p>
  </div>
</div>`;

  const info = await t.sendMail({
    from: '"My Vedic Astrology Bookings" <info@myvedicastrology.in>',
    to: 'info@myvedicastrology.in',
    replyTo: 'roiprojects012@gmail.com',
    subject: 'New Homam Booking: Rohit Sharma — VA-HOMAM-MU6SL9DG',
    html: adminHtml,
    text: 'New Homam Booking received from Rohit Sharma (Ganapathi Homam). Reference: VA-HOMAM-MU6SL9DG. Phone: 9886100565'
  });

  console.log('✅ Admin Notification successfully sent to info@myvedicastrology.in!');
  console.log('Message ID:', info.messageId);
  console.log('Server response:', info.response);
}

main().catch(console.error);
