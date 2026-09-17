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
    const pathParts = (req.url || "").split("/");
    // Check if path contains "featured" after "services"
    const servicesIndex = pathParts.indexOf("services");
    const hasFeatured =
      servicesIndex !== -1 && servicesIndex + 1 < pathParts.length && pathParts[servicesIndex + 1] === "featured";

    if (hasFeatured) {
      const { data, error } = await supa
        .from("services")
        .select("*")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .limit(6);

      if (error) throw error;
      return res.status(200).json({ services: data });
    }

    if (slug) {
      const { data, error } = await supa
        .from("services")
        .select("*")
        .eq("is_active", true)
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Not found" });
      return res.status(200).json({ service: data });
    }

    const { data, error } = await supa
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return res.status(200).json({ services: data });
  } catch {
    return res.status(500).json({ error: "DB error" });
  }
}
