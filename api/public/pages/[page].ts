import { createClient } from "@supabase/supabase-js";

const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const ALLOWED_PAGES = ["birth-chart-pdf", "chat-with-guruji", "palm-reading"];

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { page } = req.params;

    if (!page || !ALLOWED_PAGES.includes(page)) {
      return res.status(200).json({ page: page || "", content: {} });
    }

    const { data, error } = await supa
      .from("pages")
      .select("*")
      .eq("slug", page)
      .maybeSingle();

    if (error) throw error;

    return res.status(200).json({ page, content: data ? data.content : {} });
  } catch {
    return res.status(500).json({ error: "DB error" });
  }
}
