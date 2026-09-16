import type { ServiceCategory } from "./types";

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "astrology-consultations",
    name: "Premium Astrology Consultations",
    description:
      "Personalized Vedic guidance for love, marriage, career, finance, health, and life decisions.",
    icon: "🔮",
    href: "/services/astrology-consultations",
    order: 1,
  },
  {
    slug: "homam-bookings",
    name: "Sacred Homam Bookings",
    description:
      "Book authentic Vedic fire rituals for prosperity, peace, protection, health, and success.",
    icon: "🔥",
    href: "/homams",
    order: 2,
  },
  {
    slug: "birth-chart-pdf",
    name: "Birth Chart PDF Reports",
    description:
      "A detailed Vedic kundli report prepared from your exact birth details.",
    icon: "📜",
    href: "/birth-chart-pdf",
    order: 3,
  },
  {
    slug: "chat-with-guruji",
    name: "Live Chat with Guruji",
    description:
      "Get live Vedic guidance directly from Guruji — first few messages free.",
    icon: "💬",
    href: "/chat-with-guruji",
    order: 4,
  },
];
