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

export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Visitor-Id", visitorId());
  return fetch(resolveApiUrl(path), {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}
