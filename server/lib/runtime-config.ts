/**
 * Runtime configuration loader.
 *
 * Secrets (JWT secret, admin credentials, Razorpay keys) are resolved once at
 * startup. Environment variables take precedence; any value not provided via
 * the environment is read from the settings table as a fallback.
 */

import { query } from "./db";

export type AppConfig = {
  JWT_SECRET?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
};

const SETTING_KEYS = [
  "jwt_secret",
  "admin_email",
  "admin_password",
  "razorpay_key_id",
  "razorpay_key_secret",
] as const;

const TTL_MS = 5 * 60_000;

let cache: AppConfig | null = null;
let loadedAt = 0;
let refreshing: Promise<AppConfig> | null = null;

function stripQuotes(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.replace(/^"|"$/g, "").trim();
  return trimmed.length ? trimmed : undefined;
}

function fromEnv(): AppConfig {
  return {
    JWT_SECRET: process.env.JWT_SECRET || undefined,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || undefined,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || undefined,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || undefined,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || undefined,
  };
}

function needsDb(cfg: AppConfig): boolean {
  return !cfg.JWT_SECRET || !cfg.ADMIN_EMAIL || !cfg.ADMIN_PASSWORD ||
    !cfg.RAZORPAY_KEY_ID || !cfg.RAZORPAY_KEY_SECRET;
}

async function readFromDb(): Promise<Partial<AppConfig>> {
  const out: Partial<AppConfig> = {};
  try {
    const res = await query("settings", "select", { select: "key,value" });
    const byKey: Record<string, string> = {};
    for (const row of res.rows as { key: string; value: string }[]) {
      byKey[row.key] = row.value;
    }
    out.JWT_SECRET = stripQuotes(byKey.jwt_secret);
    out.ADMIN_EMAIL = stripQuotes(byKey.admin_email);
    out.ADMIN_PASSWORD = stripQuotes(byKey.admin_password);
    out.RAZORPAY_KEY_ID = stripQuotes(byKey.razorpay_key_id);
    out.RAZORPAY_KEY_SECRET = stripQuotes(byKey.razorpay_key_secret);
  } catch {
    // DB unavailable — keep whatever env provided; caller decides.
  }
  return out;
}

export async function loadConfig(force = false): Promise<AppConfig> {
  const now = Date.now();
  if (cache && !force && now - loadedAt < TTL_MS) return cache;
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const cfg = fromEnv();
    if (needsDb(cfg)) {
      const db = await readFromDb();
      cfg.JWT_SECRET ||= db.JWT_SECRET;
      cfg.ADMIN_EMAIL ||= db.ADMIN_EMAIL;
      cfg.ADMIN_PASSWORD ||= db.ADMIN_PASSWORD;
      cfg.RAZORPAY_KEY_ID ||= db.RAZORPAY_KEY_ID;
      cfg.RAZORPAY_KEY_SECRET ||= db.RAZORPAY_KEY_SECRET;
    }
    // Preserve a previously loaded (valid) cache if the DB read failed and the
    // environment did not supply the value, so a transient DB outage does not
    // wipe working configuration.
    const merged: AppConfig = { ...(cache ?? {}), ...cfg };
    cache = merged;
    loadedAt = Date.now();
    return merged;
  })();

  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}

/**
 * Synchronous accessor. Returns the cached config, falling back to environment
 * variables directly if startup loading has not completed yet. Never triggers
 * a DB query.
 */
export function getConfig(): AppConfig {
  if (cache) return cache;
  return fromEnv();
}

/** Whether every required admin/Razorpay value is present (env or DB). */
export function isConfigured(cfg: AppConfig = getConfig()): boolean {
  return Boolean(
    cfg.JWT_SECRET &&
      cfg.ADMIN_EMAIL &&
      cfg.ADMIN_PASSWORD &&
      cfg.RAZORPAY_KEY_ID &&
      cfg.RAZORPAY_KEY_SECRET
  );
}
