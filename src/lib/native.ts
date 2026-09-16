import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNativePlatform } from "./platform";

export async function initNativeChrome(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#080A18" });
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch {
    /* web / unsupported */
  }

  try {
    await SplashScreen.hide({ fadeOutDuration: 280 });
  } catch {
    /* ignore */
  }
}

export async function hapticLight(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* ignore */
  }
}

export async function hapticSuccess(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* ignore */
  }
}

export async function openExternal(url: string): Promise<void> {
  if (isNativePlatform()) {
    try {
      await Browser.open({ url });
      return;
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function exitApp(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await App.exitApp();
  } catch {
    /* ignore */
  }
}

export { App };
