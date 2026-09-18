/**
 * Seed services and homams into Supabase via REST API.
 * Uses SUPABASE_SERVICE_ROLE_KEY for write access.
 * Run: node scripts/seed-via-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { services } from "../src/lib/data/services.ts";
import { homams } from "../src/lib/data/homams.ts";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://bosnejioiwiqfcpwwnbi.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY env var");
  process.exit(1);
}

const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

function mapService(s) {
  return {
    slug: s.slug,
    title: s.title,
    category_slug: s.categorySlug || "",
    icon: s.icon || "🔮",
    image: s.image || null,
    short_description: s.shortDescription || "",
    full_description: s.fullDescription || "",
    problem: s.problem || "",
    price: s.price || 0,
    discount_price: s.discountPrice || null,
    duration: s.duration || "",
    gradient: s.gradient || "",
    analysis: s.analysis || [],
    receive: s.receive || [],
    benefits: s.benefits || [],
    remedies: s.remedies || [],
    faqs: s.faqs || [],
    featured: s.featured || false,
    display_order: s.order || 0,
    active: s.active ?? true,
  };
}

function mapHomam(h) {
  return {
    slug: h.slug,
    name: h.name,
    icon: h.icon || "🔥",
    image: h.image || null,
    short_benefit: h.shortBenefit || "",
    full_description: h.fullDescription || "",
    price: h.price || 0,
    discount_price: h.discountPrice || null,
    duration: h.duration || "",
    gradient: h.gradient || "",
    benefits: h.benefits || [],
    suitable_for: h.suitableFor || [],
    pooja_items: h.poojaItems || [],
    booking_instructions: h.bookingInstructions || "",
    faqs: h.faqs || [],
    featured: h.featured || false,
    display_order: h.order || 0,
    active: h.active ?? true,
  };
}

async function seed() {
  console.log("Seeding services...");
  for (const s of services) {
    const mapped = mapService(s);
    const { error } = await supa.from("services").upsert(mapped, { onConflict: "slug" });
    if (error) console.error(`  ❌ ${s.slug}:`, error.message);
    else console.log(`  ✅ ${s.slug}`);
  }

  console.log("Seeding homams...");
  const { homams: seedHomams } = await import("../src/lib/data/homams.ts");
  for (const h of seedHomams) {
    const mapped = mapHomam(h);
    const { error } = await supa.from("homams").upsert(mapped, { onConflict: "slug" });
    if (error) console.error(`  ❌ ${h.slug}:`, error.message);
    else console.log(`  ✅ ${h.slug}`);
  }

  console.log("Done!");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
