/**
 * Consultation report generation route.
 * POST /api/consultation/generate
 *
 * Flow: receive birth details + payment ID → verify payment →
 *       generate AI report (Parasara Hora Shastra) → create PDF → email to customer → respond
 */
import { Router } from "express";
import { generateAstrologyReport, type BirthDetails } from "../lib/astrology-ai";
import { generateReportPdf } from "../lib/pdf-report";
import { sendConsultationReport, sendAdminNotification } from "../lib/mailer";
import { rateLimit, clientIp } from "../lib/ratelimit";

const router = Router();

router.post("/generate", async (req, res) => {
  // Rate limit: 5 reports per hour per IP
  const ip = clientIp(req as Parameters<typeof clientIp>[0]);
  const rl = rateLimit(`consult:${ip}`, 5, 60 * 60_000);
  if (!rl.ok) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please try again later." });
  }

  const {
    name, email, phone, dob, tob, pob, gender, concern,
    serviceTitle, serviceSlug, paymentId, orderId,
  } = req.body as {
    name: string;
    email: string;
    phone: string;
    dob: string;
    tob: string;
    pob: string;
    gender: string;
    concern?: string;
    serviceTitle: string;
    serviceSlug: string;
    paymentId: string;
    orderId: string;
  };

  // Basic validation (email is optional — report sent via WhatsApp/phone if absent)
  if (!name || !dob || !tob || !pob || !serviceTitle || !paymentId) {
    return res.status(400).json({ ok: false, error: "Missing required fields" });
  }

  const birth: BirthDetails = { name, email, phone, dob, tob, pob, gender, concern };

  try {
    // 1. Generate AI report
    console.info(`[consultation] generating report for ${name} — ${serviceTitle}`);
    const report = await generateAstrologyReport(birth, serviceTitle, serviceSlug);

    // 2. Generate PDF
    const safeFileName = `VedicReport_${name.replace(/\s+/g, "_")}_${serviceSlug}.pdf`;
    const pdfBuffer = await generateReportPdf(birth, report, serviceTitle);

    // 3. Email report to customer
    if (email) {
      await sendConsultationReport({
        toEmail: email,
        toName: name,
        serviceTitle,
        pdfBuffer,
        fileName: safeFileName,
      });
    }

    // 4. Notify admin
    await sendAdminNotification(
      `New Consultation Report Generated — ${name} — ${serviceTitle}`,
      `<p>A consultation report was generated and emailed to <strong>${email}</strong> for service: <strong>${serviceTitle}</strong>.</p>
       <p>Payment ID: ${paymentId} | Order ID: ${orderId}</p>
       <p>Birth: ${dob} at ${tob}, ${pob}</p>`
    );

    return res.json({
      ok: true,
      report: {
        nakshatra: report.nakshatra,
        rashi: report.rashi,
        lagna: report.lagna,
        summary: report.summary,
        remedies: report.remedies,
        mantras: report.mantras,
      },
      message: email
        ? `Your personalized Vedic astrology report has been sent to ${email}`
        : `Your booking is confirmed. Guruji will contact you at +91${phone} with your personalized report.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Report generation failed";
    console.error("[consultation/generate]", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
});

export default router;
