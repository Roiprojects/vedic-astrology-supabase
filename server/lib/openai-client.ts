/** Server-only OpenAI helper for Express API routes. */
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export const AI_DISABLED_MESSAGE =
  "The AI service is not configured yet. Please add OPENAI_API_KEY to enable it, or reach Guruji directly.";

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMediaType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export function getOpenAIKey(): string | null {
  return process.env.OPENAI_API_KEY || null;
}

const BASE = "https://api.openai.com/v1";

export function openaiUrl(endpoint: string): string {
  return `${BASE}/${endpoint}`;
}

export type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string | OpenAIContentPart[];
};

export type OpenAIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "auto" | "low" | "high" } };

export type OpenAIResponse = {
  choices?: { message?: { content?: string | null }; finish_reason?: string }[];
  error?: { message?: string; type?: string; code?: string };
};

export function extractText(json: OpenAIResponse): string {
  return json?.choices?.[0]?.message?.content ?? "";
}
