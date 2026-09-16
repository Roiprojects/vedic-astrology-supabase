/** Razorpay payment gateway routes. */
import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { query } from "../lib/db";
import { sendPaymentNotification, sendCustomerPaymentConfirmation } from "../lib/mailer";
import { rateLimit, clientIp } from "../lib/ratelimit";
import { getRazorpayKeys } from "../lib/razorpay-config";

const router = Router();

/** POST /api/razorpay/order — create a Razorpay order */
router.post("/order", async (req, res) => {
  const ip = clientIp(req as Parameters<typeof clientIp>[0]);
  const rl = rateLimit(`rzp-order:${ip}`, 20, 60 * 60_000);
  if (!rl.ok) {
    return res.status(429).set("Retry-After", String(rl.retryAfter)).json({ ok: false, error: "Too many requests. Please try again later." });
  }

  const { amount, currency = "INR", receipt, notes } = req.body as {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: Record<string, string>;
  };

  if (!amount || typeof amount !== "number" || amount < 100) {
    return res.status(400).json({ ok: false, error: "amount must be in paise (min 100)" });
  }

  const { keyId, keySecret } = await getRazorpayKeys();
  if (!keyId || !keySecret) {
    return res.status(500).json({ ok: false, error: "Razorpay keys not configured" });
  }

  try {
    const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await instance.orders.create({
      amount: Math.round(amount),
      currency,
      receipt: receipt || `va-${Date.now()}`,
      notes,
    });
    return res.json({ ok: true, order });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Order creation failed";
    console.error("[razorpay/order]", msg);
    return res.status(500).json({ ok: false, error: msg });
  }
});

/** POST /api/razorpay/verify — verify payment signature + record payment + notify admin */
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    reference,
    service_name,
    amount,
    customer_name,
    customer_email,
    customer_phone,
  } = req.body as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    reference?: string;
    service_name?: string;
    amount?: number;
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
  };

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Missing payment fields" });
  }

  const { keySecret } = await getRazorpayKeys();
  if (!keySecret) {
    return res.status(500).json({ ok: false, error: "Razorpay not configured" });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ ok: false, error: "Signature mismatch" });
  }

  if (reference) {
    try {
      const { rows } = await query("enquiries", "update", {
        eq: [["reference", reference]],
        data: {
          payment_id: razorpay_payment_id,
          payment_amount: amount || 0,
          status: "confirmed",
        },
      });
      if (!rows.length) {
        return res.status(404).json({ ok: false, error: "Booking reference not found" });
      }
    } catch (e) {
      console.error("[razorpay/verify] DB update failed:", e);
      return res.status(503).json({ ok: false, error: "Payment received but booking confirmation is temporarily unavailable. Please retry." });
    }

    sendPaymentNotification({
      reference,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: amount || 0,
      serviceName: service_name || "Consultation",
      name: customer_name,
      email: customer_email,
      phone: customer_phone,
    }).catch(() => {});

    if (customer_email) {
      sendCustomerPaymentConfirmation({
        toEmail: customer_email,
        toName: customer_name || "Valued Customer",
        reference,
        paymentId: razorpay_payment_id,
        amount: amount || 0,
        serviceName: service_name || "Consultation",
      }).catch(() => {});
    }
  }

  console.info("[razorpay/verify] payment verified", { payment_id: razorpay_payment_id, reference });
  return res.json({ ok: true, payment_id: razorpay_payment_id });
});

export default router;
