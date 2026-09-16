const whatsapp = (process.env.VITE_WHATSAPP_NUMBER || "919886100565").replace(/[^0-9]/g, "");

export const siteConfig = {
  guruji: "Guruji",
  phone: "+91 98861 00565",
  phoneHref: "tel:+919886100565",
  whatsapp,
  disclaimer:
    "Astrology provides spiritual guidance and indicative insights. Predictions are not guaranteed. For medical, legal, or financial decisions, please consult qualified professionals.",
} as const;