/** Enquiry / Booking API route — stores to database via Supabase query helper. */
import { Router } from "express";
import { refineForVariant, type BookingVariant } from "../../src/lib/validation";
import { query } from "../lib/db";
import { sendEnquiryNotification, sendCustomerConfirmation } from "../lib/mailer";
import { sendAutoReport, shouldSendAutoReport } from "../lib/dosha-report";
import { rateLimit, clientIp } from "../lib/ratelimit";

const router = Router();

router.post("/", async (req, res) => {
  const ip = clientIp(req as Parameters<typeof clientIp>[0]);
  const rl = rateLimit(`enquiry:${ip}`, 10, 60 * 60_000);
  if (!rl.ok) {
    return res.status(429).set("Retry-After", String(rl.retryAfter)).json({ ok: false, error: "Too many submissions. Please try again later." });
  }

  const variant = (req.body?.variant || "contact") as BookingVariant;
  const parsed = refineForVariant(variant).safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ ok: false, error: "Validation failed", issues: parsed.error.flatten() });
  }

  if ((parsed.data as { website?: string }).website) {
    return res.json({ ok: true, id: "ignored" });
  }

  const d = parsed.data as Record<string, string | undefined>;
  const reference = `VA-${Date.now().toString(36).toUpperCase()}`;

  try {
    await query("enquiries", "insert", {
      data: {
        reference,
        variant,
        subject: d.subject || "",
        name: d.name || "",
        phone: d.phone || "",
        email: d.email || null,
        dob: d.dob || null,
        tob: d.tob || null,
        pob: d.pob || null,
        gender: d.gender || null,
        preferred_mode: d.preferredMode || null,
        preferred_date: d.preferredDate || null,
        message: d.message || null,
        service_interested: d.serviceInterested || null,
        preferred_contact: d.preferredContact || null,
      },
    });
  } catch (e) {
    console.error("[enquiry] DB error:", e);
    return res.status(503).json({ ok: false, error: "Booking service is temporarily unavailable. Please try again." });
  }

  console.info("[enquiry] received", { reference, variant });

  sendEnquiryNotification({
    reference, variant, subject: d.subject,
    name: d.name || "", phone: d.phone || "",
    email: d.email, dob: d.dob, tob: d.tob, pob: d.pob, message: d.message,
  }).catch(() => {});

  if (d.email) {
    sendCustomerConfirmation({
      toEmail: d.email,
      toName: d.name || "Valued Customer",
      reference,
      variant,
      subject: d.subject || null,
      dob: d.dob || null,
      tob: d.tob || null,
      pob: d.pob || null,
      message: d.message || null,
    }).catch(() => {});
  }

  if (d.email && shouldSendAutoReport(d.subject || variant, d.email)) {
    sendAutoReport({
      reference, name: d.name || "", email: d.email,
      subject: d.subject, dob: d.dob, tob: d.tob, pob: d.pob, message: d.message,
    }).catch(() => {});
  }

  return res.json({ ok: true, reference });
});

export default router;
