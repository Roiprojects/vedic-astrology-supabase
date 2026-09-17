import { useEffect, useCallback, useState } from "react";
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
          const token = typeof localStorage !== "undefined" ? localStorage.getItem("admin_token") : null;
          const response = await apiFetch("/api/auth/me", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const contentType = response.headers.get("content-type") || "";
          if (response.status === 401 || response.status === 403) break;
          if (!response.ok || !contentType.includes("application/json")) throw new Error("Session probe unavailable");
          const data = await response.json() as { authenticated?: boolean };
          admin = Boolean(data.authenticated);
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
    if (data.token && typeof localStorage !== "undefined") {
      localStorage.setItem("admin_token", data.token);
    }
    setIsAdmin(true);
  }, []);

  const signOut = useCallback(async () => {
    if (typeof localStorage !== "undefined") localStorage.removeItem("admin_token");
    await apiFetch("/api/auth/logout", { method: "POST" });
    setIsAdmin(false);
  }, []);

  const session = isAdmin ? { user: { email: "admin" } } : null;

  return { session, user: session?.user ?? null, isAdmin, loading, signIn, signOut };
}
