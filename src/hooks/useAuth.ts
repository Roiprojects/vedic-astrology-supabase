import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let admin = false;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const response = await apiFetch("/api/auth/me");
          const contentType = response.headers.get("content-type") || "";
          if (response.status === 401 || response.status === 403) break;
          if (!response.ok || !contentType.includes("application/json")) throw new Error("Session probe unavailable");
          const data = await response.json() as { isAdmin?: boolean };
          admin = Boolean(data.isAdmin);
          break;
        } catch {
          if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        }
      }
      if (!cancelled) {
        setIsAdmin(admin);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Login failed");
    setIsAdmin(true);
  }, []);

  const signOut = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setIsAdmin(false);
  }, []);

  // Keep session/user aliases for backward compat with AdminLayout
  const session = isAdmin ? { user: { email: "admin" } } : null;

  return { session, user: session?.user ?? null, isAdmin, loading, signIn, signOut };
}
