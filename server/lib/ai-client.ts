/**
 * Unified AI client with automatic bidirectional fallback.
 *
 * Provider order: Gemini (free tier) → OpenAI (gpt-4o-mini).
 * Each provider is tried in order. On quota (429), rate-limit, or server
 * error (5xx) the next provider is tried automatically. If the first
 * provider had no credits and the second also fails, the error is thrown.
 *
 * Vice-versa also works: if only OPENAI_API_KEY is set and OpenAI hits
 * quota, Gemini is tried next (if GEMINI_API_KEY is also set).
 */

// ─── Config ───────────────────────────────────────────────────────────────────

import { query } from "./db";

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const geminiModel = () => process.env.GEMINI_MODEL || "gemini-3.6-flash";
const geminiKey = () => process.env.GEMINI_API_KEY || null;

const OPENAI_BASE = "https://api.openai.com/v1";
const openaiModel = () => process.env.OPENAI_MODEL || "gpt-4o-mini";
const openaiKey = () => process.env.OPENAI_API_KEY || null;

// Cache DB-loaded keys for 5 minutes to avoid per-request DB queries
let _dbKeyCache: { gemini?: string; openai?: string; geminiModel?: string; openaiModel?: string; ts: number } | null = null;

async function loadKeysFromDb() {
  if (_dbKeyCache && Date.now() - _dbKeyCache.ts < 5 * 60_000) return _dbKeyCache;
  try {
    const res = await query(
      "SELECT key, value::text FROM settings WHERE key IN ('gemini_api_key','openai_api_key','gemini_model','openai_model')"
    );
    const cache: typeof _dbKeyCache = { ts: Date.now() };
    for (const row of res.rows) {
      const val = row.value?.replace(/^"|"$/g, "");
      if (row.key === "gemini_api_key") cache.gemini = val;
      if (row.key === "openai_api_key") cache.openai = val;
      if (row.key === "gemini_model") cache.geminiModel = val;
      if (row.key === "openai_model") cache.openaiModel = val;
    }
    _dbKeyCache = cache;
  } catch { /* DB unavailable */ }
  return _dbKeyCache;
}

async function resolvedGeminiKey(): Promise<string | null> {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const db = await loadKeysFromDb();
  return db?.gemini || null;
}

async function resolvedOpenAIKey(): Promise<string | null> {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const db = await loadKeysFromDb();
  return db?.openai || null;
}

async function resolvedGeminiModel(): Promise<string> {
  if (process.env.GEMINI_MODEL) return process.env.GEMINI_MODEL;
  const db = await loadKeysFromDb();
  return db?.geminiModel || "gemini-3.6-flash";
}

async function resolvedOpenAIModel(): Promise<string> {
  if (process.env.OPENAI_MODEL) return process.env.OPENAI_MODEL;
  const db = await loadKeysFromDb();
  return db?.openaiModel || "gpt-4o-mini";
}

export const AI_DISABLED_MESSAGE =
  "The AI service is not configured. Please add GEMINI_API_KEY or OPENAI_API_KEY.";

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type ImageMediaType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export async function hasAnyAIKey(): Promise<boolean> {
  if (geminiKey() || openaiKey()) return true;
  const db = await loadKeysFromDb();
  return !!(db?.gemini || db?.openai);
}

/** 429 = quota/rate-limit, 5xx = server errors — both warrant trying next provider */
function isQuotaOrServerError(status: number): boolean {
  return status === 429 || status >= 500;
}

// ─── Non-streaming call ───────────────────────────────────────────────────────

export interface AICallParams {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
  jsonMode?: boolean;
}

export async function callAI(params: AICallParams): Promise<string> {
  const errors: string[] = [];

  // ── 1. Try Gemini ──
  const gKey = await resolvedGeminiKey();
  if (gKey) {
    try {
      const url = `${GEMINI_BASE}/${await resolvedGeminiModel()}:generateContent?key=${encodeURIComponent(gKey)}`;
      const body: Record<string, unknown> = {
        systemInstruction: { parts: [{ text: params.systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: params.userPrompt }] }],
        generationConfig: {
          temperature: params.temperature,
          maxOutputTokens: params.maxTokens,
          ...(params.jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = (await res.json()) as GeminiJsonResponse;
        const text = extractGeminiText(json);
        if (text) return text;
        errors.push("Gemini: empty response");
      } else if (isQuotaOrServerError(res.status)) {
        const msg = await errorMessage(res);
        console.warn(`[ai-client] Gemini ${res.status} (quota/error) — trying OpenAI. ${msg}`);
        errors.push(`Gemini ${res.status}: ${msg}`);
      } else {
        throw new Error(await errorMessage(res));
      }
    } catch (err) {
      if (isFatal(err)) throw err;
      console.warn("[ai-client] Gemini network error — trying OpenAI:", err);
      errors.push(`Gemini network: ${(err as Error).message}`);
    }
  }

  // ── 2. Try OpenAI ──
  const oKey = await resolvedOpenAIKey();
  if (oKey) {
    try {
      const body = {
        model: await resolvedOpenAIModel(),
        messages: [
          { role: "system", content: params.systemPrompt },
          { role: "user", content: params.userPrompt },
        ],
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        ...(params.jsonMode ? { response_format: { type: "json_object" } } : {}),
      };
      const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${oKey}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = (await res.json()) as OpenAIJsonResponse;
        return extractOpenAIText(json);
      } else if (isQuotaOrServerError(res.status) && gKey) {
        // OpenAI also out of credits — already tried Gemini above, both failed
        const msg = await errorMessage(res);
        errors.push(`OpenAI ${res.status}: ${msg}`);
        console.warn(`[ai-client] OpenAI ${res.status} (quota/error) — both providers exhausted.`);
      } else {
        throw new Error(await errorMessage(res));
      }
    } catch (err) {
      if (isFatal(err)) throw err;
      errors.push(`OpenAI network: ${(err as Error).message}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

// ─── Vision call ──────────────────────────────────────────────────────────────

export interface AIVisionParams {
  systemPrompt: string;
  userPrompt: string;
  imageBase64: string;
  mediaType: string;
  maxTokens: number;
  temperature: number;
}

export async function callAIWithImage(params: AIVisionParams): Promise<string> {
  const errors: string[] = [];

  // ── 1. Try Gemini vision ──
  const gKey = geminiKey();
  if (gKey) {
    try {
      const url = `${GEMINI_BASE}/${await resolvedGeminiModel()}:generateContent?key=${encodeURIComponent(gKey)}`;
      const body = {
        systemInstruction: { parts: [{ text: params.systemPrompt }] },
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: params.mediaType, data: params.imageBase64 } },
            { text: params.userPrompt },
          ],
        }],
        generationConfig: { maxOutputTokens: params.maxTokens, temperature: params.temperature },
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = (await res.json()) as GeminiJsonResponse;
        const text = extractGeminiText(json);
        if (text) return text;
        errors.push("Gemini vision: empty response");
      } else if (isQuotaOrServerError(res.status)) {
        const msg = await errorMessage(res);
        console.warn(`[ai-client] Gemini vision ${res.status} — trying OpenAI. ${msg}`);
        errors.push(`Gemini ${res.status}: ${msg}`);
      } else {
        throw new Error(await errorMessage(res));
      }
    } catch (err) {
      if (isFatal(err)) throw err;
      console.warn("[ai-client] Gemini vision network error — trying OpenAI:", err);
      errors.push(`Gemini network: ${(err as Error).message}`);
    }
  }

  // ── 2. Try OpenAI vision (gpt-4o-mini supports vision) ──
  const oKey = openaiKey();
  if (oKey) {
    try {
      const body = {
        model: openaiModel(),
        messages: [
          { role: "system", content: params.systemPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${params.mediaType};base64,${params.imageBase64}`, detail: "high" } },
              { type: "text", text: params.userPrompt },
            ],
          },
        ],
        max_tokens: params.maxTokens,
        temperature: params.temperature,
      };
      const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${oKey}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = (await res.json()) as OpenAIJsonResponse;
        return extractOpenAIText(json);
      } else if (isQuotaOrServerError(res.status) && gKey) {
        const msg = await errorMessage(res);
        errors.push(`OpenAI ${res.status}: ${msg}`);
        console.warn(`[ai-client] OpenAI vision ${res.status} — both providers exhausted.`);
      } else {
        throw new Error(await errorMessage(res));
      }
    } catch (err) {
      if (isFatal(err)) throw err;
      errors.push(`OpenAI network: ${(err as Error).message}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

// ─── Streaming call ───────────────────────────────────────────────────────────

export interface AIStreamParams {
  systemPrompt: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens: number;
  temperature: number;
}

export async function streamAI(
  params: AIStreamParams,
  onChunk: (text: string) => void
): Promise<void> {
  const errors: string[] = [];

  // ── 1. Try Gemini streaming ──
  const gKey = geminiKey();
  if (gKey) {
    try {
      const url = `${GEMINI_BASE}/${await resolvedGeminiModel()}:streamGenerateContent?key=${encodeURIComponent(gKey)}&alt=sse`;
      const contents = params.messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const body = {
        systemInstruction: { parts: [{ text: params.systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: params.maxTokens, temperature: params.temperature },
      };
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (upstream.ok && upstream.body) {
        await readGeminiStream(upstream.body, onChunk);
        return;
      } else if (isQuotaOrServerError(upstream.status)) {
        const msg = await errorMessage(upstream);
        console.warn(`[ai-client] Gemini stream ${upstream.status} — trying OpenAI. ${msg}`);
        errors.push(`Gemini ${upstream.status}: ${msg}`);
      } else {
        throw new Error(await errorMessage(upstream));
      }
    } catch (err) {
      if (isFatal(err)) throw err;
      console.warn("[ai-client] Gemini stream network error — trying OpenAI:", err);
      errors.push(`Gemini network: ${(err as Error).message}`);
    }
  }

  // ── 2. Try OpenAI streaming ──
  const oKey = openaiKey();
  if (oKey) {
    try {
      const body = {
        model: openaiModel(),
        messages: [
          { role: "system", content: params.systemPrompt },
          ...params.messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        stream: true,
      };
      const upstream = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${oKey}` },
        body: JSON.stringify(body),
      });
      if (upstream.ok && upstream.body) {
        await readOpenAIStream(upstream.body, onChunk);
        return;
      } else if (isQuotaOrServerError(upstream.status) && gKey) {
        const msg = await errorMessage(upstream);
        errors.push(`OpenAI ${upstream.status}: ${msg}`);
        console.warn(`[ai-client] OpenAI stream ${upstream.status} — both providers exhausted.`);
      } else {
        throw new Error(await errorMessage(upstream));
      }
    } catch (err) {
      if (isFatal(err)) throw err;
      errors.push(`OpenAI network: ${(err as Error).message}`);
    }
  }

  throw new Error(`All AI providers failed: ${errors.join("; ")}`);
}

// ─── Stream parsers ───────────────────────────────────────────────────────────

async function readGeminiStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (text: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const json = JSON.parse(data) as GeminiJsonResponse;
          const parts = json?.candidates?.[0]?.content?.parts;
          if (Array.isArray(parts)) {
            const text = parts.map((p) => (typeof p?.text === "string" ? p.text : "")).join("");
            if (text) onChunk(text);
          }
        } catch { /* skip */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

async function readOpenAIStream(
  body: ReadableStream<Uint8Array>,
  onChunk: (text: string) => void
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const json = JSON.parse(data) as { choices?: { delta?: { content?: string | null } }[] };
          const text = json?.choices?.[0]?.delta?.content;
          if (typeof text === "string" && text) onChunk(text);
        } catch { /* skip */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Internal types ───────────────────────────────────────────────────────────

type GeminiJsonResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
  error?: { message?: string };
};

type OpenAIJsonResponse = {
  choices?: { message?: { content?: string | null } }[];
  error?: { message?: string };
};

function extractGeminiText(json: GeminiJsonResponse): string {
  const parts = json?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts.map((p) => (typeof p?.text === "string" ? p.text : "")).join("");
}

function extractOpenAIText(json: OpenAIJsonResponse): string {
  return json?.choices?.[0]?.message?.content ?? "";
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: { message?: string } };
    return j?.error?.message || `HTTP ${res.status}`;
  } catch {
    return `HTTP ${res.status}`;
  }
}

function isFatal(err: unknown): boolean {
  const msg = (err as Error)?.message || "";
  // Re-throw errors we deliberately threw (non-quota provider errors)
  return !msg.includes("network") && !msg.includes("fetch");
}
