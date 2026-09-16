import { Capacitor } from "@capacitor/core";

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): "ios" | "android" | "web" {
  return Capacitor.getPlatform() as "ios" | "android" | "web";
}

export function isAndroid(): boolean {
  return Capacitor.getPlatform() === "android";
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}

export function isAppExperience(pathname = window.location.pathname): boolean {
  return isNativePlatform() || pathname.startsWith("/app");
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
