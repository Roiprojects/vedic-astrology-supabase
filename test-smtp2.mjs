import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "admin.myvedicastrology.in",
  port: 587, secure: false, requireTLS: true,
  auth: { user: "info@myvedicastrology.in", pass: "1qLVTZ0vOgFkx" },
  tls: { servername: "admin.myvedicastrology.in" },
  pool: false, logger: true, debug: true,
});

// Test sending to a real-looking external email
const r = await transport.sendMail({
  from: "info@myvedicastrology.in",
  to: "saiprasad697@gmail.com",
  subject: "SMTP External Test",
  text: "Testing external recipient delivery",
});
console.log("OK:", r.response);
