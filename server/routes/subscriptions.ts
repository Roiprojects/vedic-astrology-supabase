/**
 * Subscription routes — Razorpay recurring plans.
 *
 * GET  /api/subscriptions/plans        — list available plans
 * POST /api/subscriptions/create       — create a Razorpay subscription
 * GET  /api/subscriptions/status       — get user's active subscription
 * POST /api/subscriptions/webhook      — handle Razorpay subscription events
 */

import { Router, Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { query } from "../lib/db";
import { getUserFromToken } from "./user";
import { rateLimit, clientIp } from "../lib/ratelimit";
import { getRazorpayKeys } from "../lib/razorpay-config";

const router = Router();

export const PLANS = [
  {
    id: "free",
    name: "Nakshatra Starter",
    price: 0,
    currency: "INR",
    interval: null,
    features: [
      "3 AI chat questions/session",
      "Birth chart overview",
      "Basic nakshatra & rashi",
      "App access",
    ],
    badge: null,
  },
  {
    id: "star",
    name: "Jyotish Star",
    price: 499,
    currency: "INR",
    interval: "monthly",
    razorpayPlanEnvKey: "RAZORPAY_PLAN_STAR",
    features: [
      "Unlimited AI chat",
      "1 consultation/month",
      "Detailed birth chart",
      "Dosha analysis report",
      "Gemstone recommendations",
      "Priority email support",
    ],
    badge: "Popular",
  },
  {
    id: "cosmic",
    name: "Cosmic Divine",
    price: 1499,
    currency: "INR",
    interval: "monthly",
    razorpayPlanEnvKey: "RAZORPAY_PLAN_COSMIC",
    features: [
      "Everything in Jyotish Star",
      "3 consultations/month",
      "Monthly PDF astrology report",
      "Homam booking priority",
      "Muhurta (auspicious timing)",
      "Dedicated Guruji WhatsApp",
    ],
    badge: "Best Value",
  },
];

/** GET /api/subscriptions/plans */
router.get("/plans", (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    plans: PLANS.map(({ razorpayPlanEnvKey: _, ...p }) => p),
  });
});

/** POST /api/subscriptions/create */
router.post("/create", async (req: Request, res: Response) => {
  const ip = clientIp(req as Parameters<typeof clientIp>[0]);
  const rl = rateLimit(`sub-create:${ip}`, 10, 60_000);
  if (!rl.ok) return res.status(429).json({ ok: false, error: "Too many requests." });

  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ ok: false, error: "Please sign in to subscribe." });

  const { planId } = req.body as { planId?: string };
  const plan = PLANS.find((p) => p.id === planId && p.price > 0);
  if (!plan) return res.status(400).json({ ok: false, error: "Invalid plan." });

  const razorpayPlanId = plan.razorpayPlanEnvKey ? process.env[plan.razorpayPlanEnvKey] : null;
  if (!razorpayPlanId) {
    return res.status(503).json({
      ok: false,
      error: `Razorpay plan not configured. Please set ${plan.razorpayPlanEnvKey} in environment variables.`,
    });
  }

  try {
    const { keyId, keySecret } = await getRazorpayKeys();
    if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const userRow = await query("app_users", "select", {
      select: "email,name,phone",
      eq: [["id", user.userId]],
    });
    const u = userRow.rows[0] as { email: string; name: string | null; phone: string | null } | undefined;

    const sub = await instance.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: 12,
      quantity: 1,
      customer_notify: 1,
      notify_info: u ? { notify_email: u.email, notify_phone: u.phone ?? undefined } : undefined,
      notes: { user_id: String(user.userId), plan_id: planId },
    } as Parameters<typeof instance.subscriptions.create>[0]);

    await query("user_subscriptions", "insert", {
      data: {
        user_id: user.userId,
        plan_id: planId,
        razorpay_sub_id: sub.id,
        razorpay_plan_id: razorpayPlanId,
        status: "created",
      },
    });

    return res.json({ ok: true, subscriptionId: sub.id, keyId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Subscription creation failed";
    console.error("[subscriptions/create]", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
});

/** GET /api/subscriptions/status */
router.get("/status", async (req: Request, res: Response) => {
  const user = getUserFromToken(req);
  if (!user) return res.status(401).json({ ok: false, error: "Not authenticated." });
  try {
    const userRow = await query("app_users", "select", {
      select: "plan,plan_expires_at",
      eq: [["id", user.userId]],
    });
    const u = userRow.rows[0] as { plan: string; plan_expires_at: string | null } | undefined;
    const subRow = await query("user_subscriptions", "select", {
      select: "plan_id,status,current_start,current_end,razorpay_sub_id",
      eq: [["user_id", user.userId]],
      order: { column: "created_at", ascending: false },
      limit: 1,
    });
    return res.json({
      ok: true,
      plan: u?.plan ?? "free",
      planExpiresAt: u?.plan_expires_at ?? null,
      subscription: subRow.rows[0] ?? null,
    });
  } catch (e) {
    console.error("[subscriptions/status] db error:", e);
    return res.status(500).json({ ok: false, error: "Failed to fetch subscription." });
  }
});

/** POST /api/subscriptions/webhook — Razorpay sends events here */
router.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  if (!signature || !webhookSecret) {
    return res.status(401).json({ ok: false, error: "Webhook authentication is not configured" });
  }
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    return res.status(400).json({ ok: false, error: "Webhook body unavailable for verification" });
  }
  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
    return res.status(400).json({ ok: false, error: "Invalid signature" });
  }

  const event = req.body as {
    event: string;
    payload?: {
      subscription?: { entity?: { id: string; plan_id: string; status: string; current_start: number; current_end: number; notes?: { user_id?: string; plan_id?: string } } };
    };
  };

  const sub = event.payload?.subscription?.entity;
  if (!sub) return res.json({ ok: true });

  const userId = sub.notes?.user_id ? Number(sub.notes.user_id) : null;
  const planId = sub.notes?.plan_id ?? "star";

  const start = sub.current_start ? new Date(sub.current_start * 1000).toISOString() : null;
  const end = sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null;

  try {
    await query("user_subscriptions", "update", {
      eq: [["razorpay_sub_id", sub.id]],
      data: { status: sub.status, current_start: start, current_end: end },
    });

    if (userId && ["active", "authenticated"].includes(sub.status)) {
      await query("app_users", "update", {
        eq: [["id", userId]],
        data: { plan: planId, plan_expires_at: end },
      });
    }

    if (userId && ["cancelled", "expired", "completed"].includes(sub.status)) {
      const planEnd = end ? new Date(end) : null;
      if (!planEnd || planEnd < new Date()) {
        await query("app_users", "update", {
          eq: [["id", userId]],
          data: { plan: "free", plan_expires_at: null },
        });
      }
    }

    console.info("[subscriptions/webhook]", event.event, sub.id, sub.status);
    return res.json({ ok: true });
  } catch (e) {
    console.error("[subscriptions/webhook] db error:", e);
    return res.status(500).json({ ok: false });
  }
});

export default router;
