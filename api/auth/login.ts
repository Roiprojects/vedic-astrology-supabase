import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setCookieHeader(name: string, value: string, maxAge: number, secure: boolean): string {
  const parts = [
    `${name}=${value}`,
    "Max-Age=" + maxAge,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

function deleteCookieHeader(name: string, secure: boolean): string {
  const parts = [
    `${name}=`,
    "Max-Age=0",
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export const config = {
  maxDuration: 10,
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const secure = process.env.NODE_ENV === "production";

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return res.status(503).json({ ok: false, error: "Admin login not configured." });
  }

  const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
  if (!email || !password || email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Invalid email or password" });
  }

  const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: "7d" });
  res.setHeader("Set-Cookie", setCookieHeader("admin_token", token, COOKIE_MAX_AGE, secure));
  return res.json({ ok: true });
}
