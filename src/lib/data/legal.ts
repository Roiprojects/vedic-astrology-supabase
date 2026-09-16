import type { LegalSection } from "@/components/layout/LegalContent";
import { siteConfig } from "@/lib/site";

export const legalLastUpdated = "8 July 2026";

export const privacyPolicy: LegalSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      `This Privacy Policy explains how ${siteConfig.name} ("we", "us") collects, uses, and protects the personal information you share when using our website and services.`,
    ],
  },
  {
    heading: "Information We Collect",
    paragraphs: [
      "We collect information you provide directly — such as your name, phone number, email, birth details (date, time and place of birth), and any message or question you submit through our forms or WhatsApp.",
      "We may also collect limited technical information such as your device and browser type to improve the website experience.",
    ],
  },
  {
    heading: "How We Use Your Information",
    paragraphs: [
      "Your information is used solely to prepare your astrology guidance, birth chart reports, homam bookings, and to respond to your enquiries.",
      "We do not sell, rent, or share your personal information with third parties for marketing purposes.",
    ],
  },
  {
    heading: "Confidentiality",
    paragraphs: [
      "Your birth details and everything you share during a consultation are treated as strictly confidential and used only to provide the guidance you requested.",
    ],
  },
  {
    heading: "Payments",
    paragraphs: [
      "Payments are processed through trusted providers such as Razorpay and UPI. We do not store your full card or bank details on our servers.",
    ],
  },
  {
    heading: "Data Retention & Your Rights",
    paragraphs: [
      "We retain your information only as long as necessary to provide our services. You may request access to, correction of, or deletion of your personal data at any time.",
      `To make such a request, contact us at ${siteConfig.email}.`,
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      `If you have questions about this Privacy Policy, please contact us at ${siteConfig.email} or via WhatsApp.`,
    ],
  },
];

export const termsAndConditions: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    paragraphs: [
      `By accessing and using ${siteConfig.name}, you agree to these Terms and Conditions. If you do not agree, please do not use the website or services.`,
    ],
  },
  {
    heading: "Services",
    paragraphs: [
      "We provide Vedic astrology consultations, birth chart PDF reports, homam bookings, and live chat guidance. These are spiritual and advisory services intended for guidance purposes only.",
    ],
  },
  {
    heading: "No Guaranteed Results",
    paragraphs: [
      "Astrology offers indicative insights and spiritual guidance. We make no guarantee of specific outcomes. Decisions you make based on our guidance are your own responsibility.",
    ],
  },
  {
    heading: "Bookings & Payments",
    paragraphs: [
      "Consultation, report, and homam bookings are confirmed once payment (via Razorpay, UPI, or approved manual method) is received and verified. Prices are as displayed at the time of booking.",
    ],
  },
  {
    heading: "Refunds",
    paragraphs: [
      "For our refund policy, please see our dedicated Refund & Cancellation page.",
    ],
  },
  {
    heading: "User Conduct",
    paragraphs: [
      "You agree to provide accurate information and to use our services respectfully and lawfully.",
    ],
  },
  {
    heading: "Changes to Terms",
    paragraphs: [
      "We may update these Terms from time to time. Continued use of the website constitutes acceptance of the updated Terms.",
    ],
  },
];

export const disclaimerContent: LegalSection[] = [
  {
    heading: "Astrology Disclaimer",
    paragraphs: [siteConfig.disclaimer],
  },
  {
    heading: "Guidance, Not Guarantees",
    paragraphs: [
      "All astrology readings, remedies, homams, and reports are provided for spiritual guidance and general insight. They are not a substitute for professional advice and do not guarantee any specific result.",
    ],
  },
  {
    heading: "Professional Advice",
    paragraphs: [
      "For medical, legal, financial, psychological, or other professional matters, please always consult appropriately qualified and licensed professionals. Astrological guidance should never replace such advice.",
    ],
  },
  {
    heading: "Personal Responsibility",
    paragraphs: [
      "Any action you take based on the guidance provided is undertaken at your own discretion and responsibility.",
    ],
  },
];

export const refundPolicy: LegalSection[] = [
  {
    heading: "Overview",
    paragraphs: [
      `At ${siteConfig.name}, we are committed to providing genuine Vedic astrology services with full transparency. This Refund & Cancellation Policy explains your rights and our process for refunds and cancellations of bookings, consultations, reports, homams, and other services.`,
    ],
  },
  {
    heading: "Cancellation Before Service Delivery",
    paragraphs: [
      "If you wish to cancel a booking before the service has been delivered (e.g., before a scheduled consultation or before a homam has been performed), you may request a cancellation by contacting us via phone or WhatsApp.",
      "Cancellations requested more than 24 hours before the scheduled service will receive a full refund of the amount paid, minus any non-refundable gateway charges (if applicable).",
      "Cancellations requested within 24 hours of the scheduled service may be subject to a partial refund at our discretion, considering the effort and arrangements already made.",
    ],
  },
  {
    heading: "Refund Eligibility",
    paragraphs: [
      "A full refund will be issued in the following situations: (a) the service was not delivered as committed due to our error or inability to perform; (b) we are unable to schedule your consultation after multiple attempts to coordinate; (c) duplicate payment was made in error.",
      "Refunds will NOT be issued for: (a) results of astrology readings or guidance that you are not satisfied with — astrology offers indicative guidance, not guaranteed outcomes; (b) services that have already been fully delivered, such as completed birth chart reports or performed homams.",
    ],
  },
  {
    heading: "Refund Process",
    paragraphs: [
      `To request a refund, contact us at ${siteConfig.phone} or ${siteConfig.email} with your booking details (name, phone number used, service booked, and date of payment).`,
      "Refund requests are reviewed within 3-5 business days. If approved, the refund will be processed to the original payment method within 7-10 business days. The timing of the refund appearing in your account depends on your bank or payment provider.",
      "For Razorpay payments, refunds will be initiated through Razorpay's refund API and will follow Razorpay's refund timeline.",
    ],
  },
  {
    heading: "No-Show and Late Cancellations",
    paragraphs: [
      "If you miss a scheduled consultation without prior notice (no-show), no refund will be provided. If you arrive late, the consultation will proceed within the remaining time — no extension or refund for lost time.",
    ],
  },
  {
    heading: "Payment Disputes",
    paragraphs: [
      "If you have a concern about a charge, please contact us directly before raising a dispute with your bank or payment provider. We are happy to resolve issues amicably and quickly.",
    ],
  },
  {
    heading: "Modifications to Services",
    paragraphs: [
      "We reserve the right to modify service offerings, pricing, and this policy from time to time. Any changes will be posted on this page. Continued use of our services after changes constitutes acceptance of the updated policy.",
    ],
  },
  {
    heading: "Contact for Refund Requests",
    paragraphs: [
      `For all refund and cancellation enquiries, please contact: ${siteConfig.guruji} at ${siteConfig.phone} (phone/WhatsApp) or ${siteConfig.email}. We typically respond within 1 business day.`,
    ],
  },
];
