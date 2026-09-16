import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "admin.myvedicastrology.in",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: { user: "info@myvedicastrology.in", pass: "1qLVTZ0vOgFkx" },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  tls: { servername: "admin.myvedicastrology.in" },
  pool: false,
});

try {
  console.log("Verifying connection...");
  await transport.verify();
  console.log("Verified!");

  console.log("\nTest 1: Send to info@myvedicastrology.in (same domain)...");
  const r1 = await transport.sendMail({
    from: "info@myvedicastrology.in",
    to: "info@myvedicastrology.in",
    subject: "SMTP Test 1 - same domain",
    text: "Test 1",
  });
  console.log("Test 1 OK:", r1.response);

  console.log("\nTest 2: Send to test@example.com (external domain)...");
  const r2 = await transport.sendMail({
    from: "info@myvedicastrology.in",
    to: "test@example.com",
    subject: "SMTP Test 2 - external",
    text: "Test 2",
  });
  console.log("Test 2 OK:", r2.response);

} catch (err) {
  console.error("Error:", err.message, err.code);
}
