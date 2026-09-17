import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supa: SupabaseClient = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ""
);
const JWT_SECRET = process.env.JWT_SECRET || "";

function getCookie(req: VercelRequest, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  const match = raw.split(";").map((c) => c.trim()).find((c) => c.startsWith(name + "="));
  if (!match) return undefined;
  return decodeURIComponent(match.slice(name.length + 1));
}

function isAuthorized(req: VercelRequest, res: VercelResponse): boolean {
  const token = getCookie(req, "admin_token");
  if (!token || !JWT_SECRET) { res.status(401).json({ error: "Unauthorized" }); return false; }
  try { const p = jwt.verify(token, JWT_SECRET) as { isAdmin: boolean }; if (!p.isAdmin) { res.status(403).json({ error: "Forbidden" }); return false; } }
  catch { res.status(401).json({ error: "Invalid or expired session" }); return false; }
  return true;
}

const corsHeaders = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

export const config = { maxDuration: 30 };

function parseMultipart(req: VercelRequest): Promise<{ fileBuffer: Buffer; filename: string; mimeType: string }> {
  const contentType = req.headers["content-type"] as string;
  const boundaryMatch = contentType.match(/boundary=(.+)/);
  if (!boundaryMatch) throw new Error("No boundary");

  const boundary = "--" + boundaryMatch[1];
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) { chunks.push(chunk); }
  const body = Buffer.concat(chunks);
  const bodyStr = body.toString("binary");

  const parts = bodyStr.split(boundary);
  let fileBuffer: Buffer | null = null;
  let filename = "";
  let mimeType = "";

  for (const part of parts) {
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd < 0) continue;
    const headers = part.slice(0, headerEnd);
    const content = part.slice(headerEnd + 4);

    if (headers.includes('name="file"')) {
      const fnMatch = headers.match(/filename="([^"]+)"/);
      const ctMatch = headers.match(/Content-Type: ([^\r\n]+)/);
      filename = fnMatch ? fnMatch[1] : "upload";
      mimeType = ctMatch ? ctMatch[1].trim() : "application/octet-stream";
      // Strip trailing boundary markers
      const endMarker = "\r\n--";
      const endIdx = content.lastIndexOf(endMarker);
      const raw = endIdx >= 0 ? content.slice(0, endIdx) : content;
      fileBuffer = Buffer.from(raw, "binary");
    }
  }

  if (!fileBuffer || fileBuffer.length === 0) throw new Error("No file");
  return { fileBuffer, filename, mimeType };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    const { data, error } = await supa.from("media_library").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: "DB error" });
    return res.status(200).json({ files: data || [] });
  }

  if (!isAuthorized(req, res)) return;

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { fileBuffer, filename, mimeType } = await parseMultipart(req);

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(mimeType)) return res.status(400).json({ error: "Invalid file type. Only images allowed." });
    if (fileBuffer.length > 10 * 1024 * 1024) return res.status(400).json({ error: "File too large. Max 10MB." });

    const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : ".jpg";
    const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const { error: uploadError } = await supa.storage.from("uploads").upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: true,
    });
    if (uploadError) {
      console.error("[upload] Supabase storage error:", uploadError);
      return res.status(500).json({ error: "Upload failed" });
    }

    const { data: urlData } = supa.storage.from("uploads").getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    const { data: dbRow } = await supa.from("media_library").insert({
      filename: storagePath, original_name: filename, mime_type: mimeType,
      size_bytes: fileBuffer.length, url: publicUrl, alt_text: "",
    }).select("*").maybeSingle();

    return res.status(200).json({ ok: true, url: publicUrl, file: dbRow || { url: publicUrl } });
  } catch (err) {
    console.error("[upload] error:", err);
    return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
  }
}
