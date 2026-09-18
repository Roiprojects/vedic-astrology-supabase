import { Capacitor } from "@capacitor/core";

export function apiBaseUrl(): string {
  const explicit = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (Capacitor.isNativePlatform()) {
    return (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
  }
  return "";
}

export function resolveApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${apiBaseUrl()}${path}`;
}

function visitorId(): string {
  const key = "vedic_ai_visitor";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return "anonymous";
  }
}

export function apiFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Visitor-Id", visitorId());
  const needsAuth = path.startsWith("/api/admin") || path.startsWith("/api/auth/me");
  if (needsAuth) {
    try {
      const token = localStorage.getItem("admin_token");
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch {
      // localStorage unavailable (SSR) — skip auth header
    }
  }

  // Use caller signal if provided, otherwise set an automatic timeout (default 12s)
  let signal = init.signal;
  if (!signal) {
    const ms = init.timeoutMs ?? 12000;
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      signal = AbortSignal.timeout(ms);
    } else {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), ms);
      signal = controller.signal;
    }
  }

  const { timeoutMs: _, ...fetchInit } = init;

  return fetch(resolveApiUrl(path), {
    ...fetchInit,
    headers,
    signal,
    credentials: init.credentials ?? "include",
  });
}

/**
 * Safely parse JSON from a response without throwing 'Unexpected end of JSON input'.
 */
export async function safeJson<T = any>(res: Response, fallback: T): Promise<T> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return fallback;
    return (JSON.parse(text) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

