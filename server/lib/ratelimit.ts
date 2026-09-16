type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.reset - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function clientIp(request: { headers?: Record<string, string | string[] | undefined>; ip?: string }): string {
  // When `trust proxy` is enabled, Express has already resolved the real client
  // IP from the trusted X-Forwarded-For chain into `req.ip`. Prefer it.
  if (request.ip) return request.ip;
  // Fallback: take the LAST value in x-forwarded-for (set by our trusted reverse
  // proxy), not the first (which can be spoofed by the client).
  const fwd = request.headers?.["x-forwarded-for"];
  if (fwd) {
    const value = Array.isArray(fwd) ? fwd.join(",") : fwd;
    const parts = value.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];
  }
  const realIp = request.headers?.["x-real-ip"];
  if (realIp) return Array.isArray(realIp) ? realIp[realIp.length - 1] : realIp;
  return "anon";
}