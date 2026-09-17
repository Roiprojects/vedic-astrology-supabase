import { createClient } from "@supabase/supabase-js";

const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "application/json");

  try {
    const { slug } = req.query;

    if (slug) {
      const { data, error } = await supa
        .from("homams")
        .select("*")
        .eq("is_active", true)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ homam: data });
    }

    const { data, error } = await supa
      .from("homams")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return res.status(200).json({ homams: data });
  } catch {
    return res.status(500).json({ error: "DB error" });
  }
}
