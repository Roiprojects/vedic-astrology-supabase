/**
 * File-backed store for the three informational "service" pages
 * (Birth Chart PDF, Chat with Guruji, AI Palm Reader). Holds the editable hero
 * copy plus page-specific bits (price / includes / FAQs). Server-only.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { birthChartReportIncludes } from "../../../src/lib/data/content";
import { birthChartFaqs, chatFaqs } from "../../../src/lib/data/faqs";
import type { Faq } from "../../../src/lib/data/types";

export type PageId = "birth-chart-pdf" | "chat-with-guruji" | "palm-reading";

export type PageContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  price: number | null;
  priceNote: string;
  includes: string[];
  faqs: Faq[];
};

export const PAGE_CONFIG: Record<
  PageId,
  { label: string; href: string; pricing: boolean; includes: boolean; faqs: boolean }
> = {
  "birth-chart-pdf": { label: "Birth Chart PDF", href: "/birth-chart-pdf", pricing: true, includes: true, faqs: true },
  "chat-with-guruji": { label: "Chat with Guruji", href: "/chat-with-guruji", pricing: false, includes: false, faqs: true },
  "palm-reading": { label: "Palm Reader", href: "/palm-reading", pricing: false, includes: false, faqs: false },
};

const DEFAULTS: Record<PageId, PageContent> = {
  "birth-chart-pdf": {
    eyebrow: "Vedic Kundli Report",
    title: "Birth Chart PDF",
    subtitle: "Get a detailed Vedic kundli report prepared with your birth details.",
    price: 500,
    priceNote: "Delivered in 24–48 hours",
    includes: birthChartReportIncludes,
    faqs: birthChartFaqs,
  },
  "chat-with-guruji": {
    eyebrow: "Live Guidance",
    title: "Chat with Guruji",
    subtitle: "Get live Vedic guidance directly from Guruji.",
    price: null,
    priceNote: "",
    includes: [],
    faqs: chatFaqs,
  },
  "palm-reading": {
    eyebrow: "Instant Analysis",
    title: "Instant Palm Reader",
    subtitle:
      "Upload a photo of your palm and receive an instant Vedic palmistry reading — then go deeper with Guruji.",
    price: null,
    priceNote: "",
    includes: [],
    faqs: [],
  },
};

export function isPageId(id: string): id is PageId {
  return id in PAGE_CONFIG;
}
export function allPageIds(): PageId[] {
  return Object.keys(PAGE_CONFIG) as PageId[];
}
export function pageDefaults(id: PageId): PageContent {
  return DEFAULTS[id];
}

const DATA_DIR = path.join(process.cwd(), "content");
const DATA_FILE = path.join(DATA_DIR, "pages.json");

async function readAll(): Promise<Partial<Record<PageId, PageContent>>> {
  try {
    const buf = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(buf);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function readPageContent(id: PageId): Promise<PageContent> {
  const all = await readAll();
  return { ...DEFAULTS[id], ...(all[id] ?? {}) };
}

export async function writePageContent(id: PageId, content: PageContent): Promise<void> {
  const all = await readAll();
  all[id] = content;
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(all, null, 2)}\n`, "utf8");
}
