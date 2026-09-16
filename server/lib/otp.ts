/**
 * In-memory OTP store with 10-minute TTL.
 * Each OTP is a 6-digit code tied to an email address.
 */

type OTPEntry = { code: string; expiresAt: number; attempts: number };
const store = new Map<string, OTPEntry>();
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function storeOTP(email: string, code: string): void {
  store.set(email.toLowerCase(), {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
}

export type OTPResult = "valid" | "invalid" | "expired" | "too_many_attempts";

export function verifyOTP(email: string, code: string): OTPResult {
  const key = email.toLowerCase();
  const entry = store.get(key);
  if (!entry) return "invalid";
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return "expired";
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    return "too_many_attempts";
  }
  if (entry.code !== code.trim()) {
    entry.attempts++;
    return "invalid";
  }
  store.delete(key);
  return "valid";
}

// Purge expired entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of store.entries()) {
    if (now > v.expiresAt) store.delete(k);
  }
}, 30 * 60 * 1000);
