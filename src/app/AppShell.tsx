import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, WifiOff } from "lucide-react";
import { BottomNav } from "@/app/BottomNav";
import { IconButton } from "@/app/components/AppUI";
import { useAppBackButton } from "@/hooks/useAppBackButton";
import { useAppUser } from "@/hooks/useAppUser";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { initNativeChrome } from "@/lib/native";
import { siteConfig } from "@/lib/site";

export function AppShell() {
  const { loading, profile } = useAppUser();
  const navigate = useNavigate();
  const location = useLocation();
  const network = useNetworkStatus();
  const reduce = useReducedMotion();
  const [splash, setSplash] = useState(true);

  useAppBackButton();

  useEffect(() => {
    void initNativeChrome();
    const t = window.setTimeout(() => setSplash(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading || splash) return;
    if (
      !profile.onboardingComplete &&
      !location.pathname.startsWith("/app/onboarding") &&
      !location.pathname.startsWith("/app/auth")
    ) {
      navigate("/app/onboarding", { replace: true });
    }
  }, [loading, splash, profile.onboardingComplete, location.pathname, navigate]);

  const hideNav =
    location.pathname.startsWith("/app/onboarding") ||
    location.pathname.startsWith("/app/guruji") ||
    location.pathname.startsWith("/app/palm") ||
    location.pathname.startsWith("/app/session") ||
    location.pathname.startsWith("/app/auth");

  const immersive =
    location.pathname === "/app" ||
    location.pathname === "/app/" ||
    hideNav;

  return (
    <div className="app-root">
      <AnimatePresence>
        {splash && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-50 grid place-items-center bg-[#080A18]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.35 }}
          >
            <div className="va-orbit relative grid place-items-center">
              <div className="absolute h-48 w-48 rounded-full bg-[#D6AE57]/10 blur-3xl" />
              <img src="/logo-mark.png" alt="" className="relative h-24 w-24 rounded-full object-cover ring-1 ring-[#D6AE57]/50" />
            </div>
            <div className="absolute bottom-24 px-6 text-center">
              <p className="font-display text-xl tracking-[0.28em] text-[#F3D899]">VEDIC ASTROLOGY</p>
              <p className="mt-2 text-[0.7rem] uppercase tracking-[0.32em] text-[#D6AE57]/80">
                {siteConfig.tagline}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!immersive && (
        <header
          className="sticky top-0 z-30 border-b border-[#D6AE57]/12 bg-[#080A18]/92 backdrop-blur-xl"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
            <div className="flex items-center gap-2.5">
              <img src="/logo-mark.png" alt="" className="h-6 w-6 rounded-full object-cover opacity-90" />
              <p className="font-display text-[0.68rem] tracking-[0.28em] text-[#D6AE57]">VEDIC ASTROLOGY</p>
            </div>
            <IconButton aria-label="Notifications" onClick={() => navigate("/app/profile/notifications")}>
              <Bell className="h-4 w-4" />
            </IconButton>
          </div>
        </header>
      )}

      {!network.online && (
        <div className="mx-auto mt-3 w-full max-w-lg px-4">
          <div className="flex items-center gap-2 rounded-2xl border border-[#D6AE57]/20 bg-[#11152F] px-4 py-3 text-sm text-[#F3D899]">
            <WifiOff className="h-4 w-4 shrink-0" />
            You are offline. Cached guidance remains available.
          </div>
        </div>
      )}

      <div
        className="flex min-h-0 flex-1 flex-col"
        style={{
          paddingTop: immersive && !hideNav ? "env(safe-area-inset-top)" : undefined,
          paddingBottom: hideNav ? "env(safe-area-inset-bottom)" : "calc(5.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <Outlet />
      </div>

      {!hideNav && <BottomNav />}
    </div>
  );
}
