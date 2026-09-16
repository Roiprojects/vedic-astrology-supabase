import { Router } from "express";
import jwt from "jsonwebtoken";
import { rateLimit, clientIp } from "../lib/ratelimit";
import { getConfig } from "../lib/runtime-config";

const router = Router();
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function getAdminConfig() {
  const { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = getConfig();
  return { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD };
}

router.post("/login", async (req, res) => {
  const ip = clientIp(req as Parameters<typeof clientIp>[0]);
  const rl = rateLimit(`login:${ip}`, 5, 15 * 60_000);
  if (!rl.ok) {
    return res.status(429).set("Retry-After", String(rl.retryAfter))
      .json({ ok: false, error: "Too many login attempts. Please wait before trying again." });
  }

  const { JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD } = await getAdminConfig();

  if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(503).json({ ok: false, error: "Admin login not configured." });
  }

  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password || email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Invalid email or password" });
  }
  const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production" || req.secure,
  });
  return res.json({ ok: true });
});

router.post("/logout", (req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || req.secure,
  });
  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.admin_token;
  if (!token) return res.json({ isAdmin: false });
  const { JWT_SECRET } = await getAdminConfig();
  if (!JWT_SECRET) return res.json({ isAdmin: false });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean };
    return res.json({ isAdmin: Boolean(payload.isAdmin) });
  } catch {
    return res.json({ isAdmin: false });
  }
});

export default router;
