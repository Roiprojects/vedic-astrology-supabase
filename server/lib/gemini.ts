/** Server-only Google Gemini helper for Express API routes. */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const AI_DISABLED_MESSAGE =
  "The AI service is not configured yet. Please add GEMINI_API_KEY to enable it, or reach Guruji directly on WhatsApp.";

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMediaType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export function getGeminiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

export function geminiUrl(method: "generateContent" | "streamGenerateContent", key: string): string {
  const sse = method === "streamGenerateContent" ? "&alt=sse" : "";
  return `${BASE}/${GEMINI_MODEL}:${method}?key=${encodeURIComponent(key)}${sse}`;
}

export type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
  error?: { message?: string; status?: string; code?: number };
};

export function extractText(json: GeminiResponse): string {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((part) => (typeof part?.text === "string" ? part.text : "")).join("");
}