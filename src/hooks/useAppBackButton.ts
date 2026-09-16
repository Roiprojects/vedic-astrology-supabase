import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { isNativePlatform } from "@/lib/platform";
import { closeTopOverlay } from "@/lib/overlays";
import { exitApp } from "@/lib/native";

const ROOTS = new Set(["/app", "/app/", "/app/home", "/"]);

export function useAppBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNativePlatform()) return;

    const listener = App.addListener("backButton", ({ canGoBack }) => {
      if (closeTopOverlay()) return;

      const atRoot = ROOTS.has(location.pathname);
      if (!atRoot && (canGoBack || window.history.length > 1)) {
        navigate(-1);
        return;
      }

      if (atRoot) {
        const ok = window.confirm("Leave Vedic Astrology?");
        if (ok) void exitApp();
      }
    });

    return () => {
      void listener.then((h) => h.remove());
    };
  }, [location.pathname, navigate]);
}
