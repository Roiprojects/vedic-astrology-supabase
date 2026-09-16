/**
 * User auth routes (SMTP OTP login) + profile management.
 *
 * POST /api/user/send-otp    — send 6-digit OTP to email
 * POST /api/user/verify-otp  — verify OTP, return JWT
 * GET  /api/user/me          — get current user from Bearer JWT
 * PUT  /api/user/profile     — update user profile (name, phone, birth)
 */

import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { query } from "../lib/db";
import { createSmtpTransportOptions, resolveMailIdentity } from "../lib/mailer";
import { generateOTP, storeOTP, verifyOTP } from "../lib/otp";
import { rateLimit, clientIp } from "../lib/ratelimit";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "";

function signUserToken(email: string, userId: number): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ email, userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function getUserFromToken(req: Request): { email: string; userId: number } | null {
  if (!JWT_SECRET) return null;
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { email: string; userId: number };
    return { email: payload.email, userId: payload.userId };
  } catch {
    return null;
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

/** POST /api/user/send-otp */
router.post("/send-otp", async (req: Request, res: Response) => {
  const ip = clientIp(req as Parameters<typeof clientIp>[0]);
  const rl = rateLimit(`otp-send:${ip}`, 5, 10 * 60_000);
  if (!rl.ok) {
    return res.status(429).json({ ok: false, error: "Too many requests. Please wait before requesting another OTP." });
  }

  const { email } = req.body as { email?: string };
  if (!email || !email.includes("@")) {
    return res.status(400).json({ ok: false, error: "A valid email address is required." });
  }

  const transport = createTransport();
  if (!transport) {
    return res.status(503).json({ ok: false, error: "Email service is not configured." });
  }

  const otp = generateOTP();
  storeOTP(email, otp);

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  const identity = resolveMailIdentity({
    from,
    replyTo: process.env.SMTP_REPLY_TO || process.env.SMTP_USER || from,
    envelopeFrom: process.env.SMTP_ENVELOPE_FROM || from,
  });
  const html = `
<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;background:#fffbf0;border:1px solid #e9c97e;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#b45309,#92400e);padding:24px 32px;">
    <h1 style="margin:0;color:#ffe08a;font-size:20px;letter-spacing:0.5px;">ॐ My Vedic Astrology</h1>
  </div>
  <div style="padding:28px 32px;">
    <p style="font-size:15px;color:#1c1010;margin:0 0 12px;">Namaste 🙏</p>
    <p style="color:#4b3320;line-height:1.7;margin:0 0 20px;">Your one-time sign-in code for My Vedic Astrology is:</p>
    <div style="text-align:center;background:#fff3cd;border:2px solid #b45309;border-radius:12px;padding:20px;margin:0 0 20px;">
      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#b45309;font-family:monospace;">${otp}</span>
    </div>
    <p style="color:#6b5230;font-size:13px;margin:0 0 8px;">This code is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <p style="color:#6b5230;font-size:13px;margin:0;">If you did not request this, please ignore this email.</p>
  </div>
  <div style="background:#fdf3e3;padding:14px 32px;text-align:center;">
    <p style="margin:0;font-size:11px;color:#a38060;">© My Vedic Astrology · info@myvedicastrology.in</p>
  </div>
</div>`;

  try {
    await transport.sendMail({
      from: identity.fromHeader,
      to: email,
      replyTo: identity.replyTo,
      subject: `${otp} — Your My Vedic Astrology sign-in code`,
      html,
      text: `Namaste,\n\nYour My Vedic Astrology sign-in code is ${otp}.\n\nThis code is valid for 10 minutes. If you did not request this email, you can ignore it.`,
      envelope: identity.envelope,
    });
    return res.json({ ok: true, message: "OTP sent to your email." });
  } catch (e) {
    console.error("[user/send-otp] mail error:", e);
    return res.status(500).json({ ok: false, error: "Failed to send OTP email. Please try again." });
  }
});

/** POST /api/user/verify-otp */
router.post("/verify-otp", async (req: Request, res: Response) => {
  const ip = clientIp(req as Parameters<typeof clientIp>[0]);
  const rl = rateLimit(`otp-verify:${ip}`, 10, 10 * 60_000);
  if (!rl.ok) {
    return res.status(429).json({ ok: false, error: "Too many verification attempts." });
  }

  const { email, otp, name } = req.body as { email?: string; otp?: string; name?: string };
  if (!email || !otp) {
    return res.status(400).json({ ok: false, error: "Email and OTP are required." });
  }

  const result = verifyOTP(email, otp);
  if (result === "expired") return res.status(400).json({ ok: false, error: "OTP has expired. Please request a new one." });
  if (result === "too_many_attempts") return res.status(400).json({ ok: false, error: "Too many failed attempts. Please request a new OTP." });
  if (result !== "valid") return res.status(400).json({ ok: false, error: "Incorrect code. Please try again." });

  try {
    const row = await query("app_users", "upsert", {
      data: {
        email: email.toLowerCase(),
        name: name || null,
      },
      onConflict: "email",
    });
    const user = row.rows[0] as { id: number; email: string; name: string | null; plan: string; plan_expires_at: string | null };
    const token = signUserToken(user.email, user.id);
    return res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, plan: user.plan, planExpiresAt: user.plan_expires_at } });
  } catch (e) {
    console.error("[user/verify-otp] db error:", e);
    return res.status(500).json({ ok: false, error: "Account creation failed. Please try again." });
  }
});

/** GET /api/user/me */
router.get("/me", async (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ ok: false, error: "Not authenticated." });
  try {
    const { rows } = await query("app_users", "select", {
      select: "id,email,name,phone,dob,tob,pob,gender,language,plan,plan_expires_at",
      eq: [["id", user.userId]],
    });
    if (!rows.length) return res.status(404).json({ ok: false, error: "User not found." });
    return res.json({ ok: true, user: rows[0] });
  } catch (e) {
    console.error("[user/me] db error:", e);
    return res.status(500).json({ ok: false, error: "Failed to load profile." });
  }
});

/** PUT /api/user/profile — update user profile (name, phone, birth) */
router.put("/profile", async (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ ok: false, error: "Not authenticated." });
  const { name, phone, dob, tob, pob, gender, language } = req.body as {
    name?: string; phone?: string; dob?: string; tob?: string; pob?: string; gender?: string; language?: string;
  };
  try {
    await query("app_users", "update", {
      eq: [["id", user.userId]],
      data: {
        name: name || null,
        phone: phone || null,
        dob: dob || null,
        tob: tob || null,
        pob: pob || null,
        gender: gender || null,
        language: language || null,
      },
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error("[user/profile] db error:", e);
    return res.status(500).json({ ok: false, error: "Failed to update profile." });
  }
});

/** POST /api/user/app-profile — upsert full app profile (birth, chart, onboarding) */
router.post("/app-profile", async (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ ok: false, error: "Not authenticated." });
  const { displayName, email, phone, birthName, dob, tob, pob, gender, language, intention,
    sunSign, moonSign, ascendant, nakshatra, onboardingComplete } = req.body as Record<string, any>;
  const profileId = String(user.userId);
  try {
    await query("app_profiles", "upsert", {
      data: {
        id: profileId,
        display_name: displayName || null,
        email: email || null,
        phone: phone || null,
        birth_name: birthName || null,
        dob: dob || null,
        tob: tob || null,
        pob: pob || null,
        gender: gender || null,
        language: language || "English",
        intention: intention || null,
        sun_sign: sunSign || null,
        moon_sign: moonSign || null,
        ascendant: ascendant || null,
        nakshatra: nakshatra || null,
        onboarding_complete: onboardingComplete ?? null,
      },
      onConflict: "id",
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error("[user/app-profile] db error:", e);
    return res.status(500).json({ ok: false, error: "Failed to save profile." });
  }
});

/** GET /api/user/app-profile — fetch full app profile */
router.get("/app-profile", async (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ ok: false, error: "Not authenticated." });
  try {
    const { rows } = await query("app_profiles", "select", {
      select: "id,display_name,email,phone,birth_name,dob,tob,pob,gender,language,intention,sun_sign,moon_sign,ascendant,nakshatra,onboarding_complete",
      eq: [["id", String(user.userId)]],
    });
    if (!rows.length) return res.json({ ok: true, profile: null });
    return res.json({ ok: true, profile: rows[0] });
  } catch (e) {
    console.error("[user/app-profile] db error:", e);
    return res.status(500).json({ ok: false, error: "Failed to load profile." });
  }
});

export default router;
