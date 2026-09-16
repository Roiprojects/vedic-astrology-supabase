import { PushNotifications } from "@capacitor/push-notifications";
import { isNativePlatform } from "./platform";
import { storageSet } from "./storage";

const TOKEN_KEY = "va.push.token";

/**
 * Push notification infrastructure.
 * Tokens are stored locally so Firebase/FCM can be connected without
 * hardcoding fake alerts. Register only after a contextual user prompt.
 */
export async function registerPushNotifications(): Promise<{
  granted: boolean;
  token?: string;
  error?: string;
}> {
  if (!isNativePlatform()) {
    return { granted: false, error: "Push is available on the installed app." };
  }

  try {
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") {
      return { granted: false, error: "Notifications were not enabled." };
    }

    await PushNotifications.register();

    return await new Promise((resolve) => {
      void PushNotifications.addListener("registration", async ({ value }) => {
        await storageSet(TOKEN_KEY, value);
        resolve({ granted: true, token: value });
      });
      void PushNotifications.addListener("registrationError", (err) => {
        resolve({ granted: false, error: String(err.error || "Registration failed") });
      });
      window.setTimeout(() => resolve({ granted: true }), 4000);
    });
  } catch (err) {
    return {
      granted: false,
      error: err instanceof Error ? err.message : "Push setup is pending FCM configuration.",
    };
  }
}

export const PUSH_TOPICS = [
  "consultation_reminders",
  "booking_confirmations",
  "report_ready",
  "daily_horoscope",
  "astrologer_available",
  "payment_confirmation",
  "special_events",
] as const;
