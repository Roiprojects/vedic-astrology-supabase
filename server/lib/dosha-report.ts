/**
 * Automated dosha report generator — uses Gemini (primary) → OpenAI fallback.
 * Triggered for specific service bookings (career, education, jataka match, etc.)
 */
import { callAI, hasAnyAIKey } from "./ai-client";
import { createSmtpTransportOptions, resolveMailIdentity, sendAdminNotification } from "./mailer";
import nodemailer from "nodemailer";

// Services that get an auto-email dosha report
export const AUTO_REPORT_SUBJECTS = [
  "career", "education", "jataka match", "yoga", "jataka", "kundali",
  "love", "relationship", "marriage", "family", "health", "financial",
  "wealth", "property", "legal", "mental", "stress", "anxiety",
];

export function shouldSendAutoReport(subject: string, email?: string | null): boolean {
  if (!email) return false;
  const s = (subject || "").toLowerCase();
  return AUTO_REPORT_SUBJECTS.some((kw) => s.includes(kw));
}

async function generateDoshaReport(data: {
  name: string;
  dob?: string | null;
  tob?: string | null;
  pob?: string | null;
  subject?: string;
  message?: string | null;
}): Promise<string> {
  if (!await hasAnyAIKey()) return "";

  const prompt = `You are a Vedic astrology expert. Generate a brief, warm, personalised dosha analysis report for a client.

Client details:
- Name: ${data.name}
- Date of Birth: ${data.dob || "not provided"}
- Time of Birth: ${data.tob || "not provided"}
- Place of Birth: ${data.pob || "not provided"}
- Service enquired: ${data.subject || "general consultation"}
- Additional message: ${data.message || "none"}

Write a personalised dosha report (300-400 words) that:
1. Briefly explains what dosha analysis involves for their enquired service
2. Mentions 2-3 likely planetary influences based on their birth details (be specific but not definitive without full chart analysis)
3. Suggests 2-3 practical initial remedies (mantras, colours, days to observe, or general guidance)
4. Warmly invites them to book a full consultation with Guruji for a complete personalised reading

Format as plain text with clear sections. Keep it warm, hopeful, and professionally grounded in Vedic astrology. Do not make specific predictions — keep to indicative guidance.

End with: "For your complete personalised birth chart analysis and specific remedies, please connect with Guruji. Your detailed report is being prepared and Guruji will reach out to you shortly."`;

  try {
    return await callAI({
      systemPrompt: "You are a compassionate Vedic astrology expert.",
      userPrompt: prompt,
      maxTokens: 1000,
      temperature: 0.7,
    });
  } catch (e) {
    console.error("[dosha-report] AI error:", e);
    return "";
  }
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport(createSmtpTransportOptions({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    user,
    pass,
    tlsServername: process.env.SMTP_TLS_SERVERNAME,
  }));
}

export async function sendAutoReport(data: {
  reference: string;
  name: string;
  email: string;
  subject?: string;
  dob?: string | null;
  tob?: string | null;
  pob?: string | null;
  message?: string | null;
}): Promise<void> {
  const transport = createTransport();
  if (!transport) {
    console.info("[dosha-report] SMTP not configured — skipping auto report for", data.reference);
    return;
  }

  const reportText = await generateDoshaReport(data);
  if (!reportText) {
    console.info("[dosha-report] Could not generate report for", data.reference);
    return;
  }

  // Convert plain text to simple HTML
  const reportHtml = reportText
    .split("\n\n")
    .map((p) => `<p style="margin:0 0 14px;line-height:1.7;">${p.replace(/\n/g, "<br/>")}</p>`)
    .join("");

  const html = `
<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;background:#fff9f0;border:1px solid #e4c87a;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#b45309,#92400e);padding:28px 32px;">
    <h1 style="margin:0;font-size:22px;color:#ffe08a;font-family:serif;">Your Vedic Dosha Analysis</h1>
    <p style="margin:6px 0 0;font-size:13px;color:#ffd275;opacity:0.85;">Prepared by Guruji</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="margin:0 0 18px;font-size:15px;color:#5c3d1e;">Namaste <strong>${data.name}</strong>,</p>
    <p style="margin:0 0 22px;font-size:14px;color:#7a5230;">Thank you for reaching out. Here is your preliminary Vedic astrology insight for your reference <strong>(${data.reference})</strong>:</p>
    <div style="border-left:3px solid #b45309;padding-left:18px;margin:0 0 22px;color:#3d2508;font-size:14px;">
      ${reportHtml}
    </div>
    <div style="background:#fff3cd;border:1px solid #ffd14f;border-radius:8px;padding:16px;margin:0 0 22px;">
      <p style="margin:0;font-size:13px;color:#7a5c00;"><strong>Note:</strong> This is an indicative preliminary analysis. For a complete, personalised birth chart reading with specific remedies tailored to your unique chart, please book a full consultation with Guruji.</p>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="https://vedic-astrology.com/services/astrology-consultations" style="display:inline-block;background:#b45309;color:#fff8e1;padding:12px 28px;border-radius:24px;text-decoration:none;font-size:14px;font-weight:bold;">Book Your Full Consultation</a>
    </div>
  </div>
  <div style="background:#f8ede0;padding:16px 32px;text-align:center;font-size:12px;color:#9a6a40;">
    Guruji · Vedic Astrologer · This report is indicative and for spiritual guidance only.
  </div>
</div>`;

  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "guruji@vedic-astrology.com";
    const identity = resolveMailIdentity({
      from,
      replyTo: process.env.SMTP_REPLY_TO || process.env.SMTP_USER || from,
      envelopeFrom: process.env.SMTP_ENVELOPE_FROM || from,
      fromName: "Guruji",
    });
    await transport.sendMail({
      from: identity.fromHeader,
      to: data.email,
      replyTo: identity.replyTo,
      subject: `Your Vedic Dosha Analysis — ${data.reference}`,
      html,
      text: reportText,
      envelope: identity.envelope,
    });
    console.info("[dosha-report] sent to", data.email, "ref:", data.reference);
  } catch (e) {
    console.error("[dosha-report] email failed:", e);
  }
}
