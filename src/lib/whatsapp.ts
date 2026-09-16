import { whatsappLink } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { openExternal } from "@/lib/native";
import { isNativePlatform } from "@/lib/platform";

export async function openWhatsApp(message?: string): Promise<void> {
  const url = whatsappLink(siteConfig.whatsapp, message);
  if (isNativePlatform()) {
    window.location.href = url;
    return;
  }
  await openExternal(url);
}

export function supportWhatsAppMessage(topic = "support"): string {
  return `Namaste Guruji, I am writing from the Vedic Astrology app regarding ${topic}.`;
}
