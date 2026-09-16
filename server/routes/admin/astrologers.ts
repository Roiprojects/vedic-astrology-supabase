import { Router } from "express";
import { query } from "../../lib/db";
import { z } from "zod";

const router = Router();

const astrologerSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  title: z.string().default(""),
  image: z.string().nullable().optional(),
  verified: z.boolean().default(false),
  online: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(4.5),
  reviews: z.number().int().min(0).default(0),
  experienceYears: z.number().int().min(0).default(0),
  languages: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  priceChat: z.number().int().min(0).default(0),
  priceCall: z.number().int().min(0).default(0),
  about: z.string().default(""),
  serviceSlug: z.string().nullable().optional(),
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

router.get("/", async (_req, res) => {
  try {
    const { rows } = await query("astrologers", "select", {
      order: [{ column: "display_order", ascending: true }, { column: "name", ascending: true }],
    });
    res.json({ astrologers: rows });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const { rows } = await query("astrologers", "select", {
      eq: [["slug", req.params.slug]],
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ astrologer: rows[0] });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/", async (req, res) => {
  const parsed = astrologerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const a = parsed.data;
  try {
    const { rows } = await query("astrologers", "insert", {
      data: {
        slug: a.slug,
        name: a.name,
        title: a.title,
        image: a.image ?? null,
        verified: a.verified,
        online: a.online,
        rating: a.rating,
        reviews: a.reviews,
        experience_years: a.experienceYears,
        languages: a.languages,
        specialties: a.specialties,
        price_chat: a.priceChat,
        price_call: a.priceCall,
        about: a.about,
        service_slug: a.serviceSlug ?? null,
        featured: a.featured,
        display_order: a.order,
        active: a.active,
      },
    });
    res.json({ ok: true, astrologer: rows[0] });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: `Slug "${a.slug}" already exists.` });
    res.status(500).json({ error: "DB error" });
  }
});

router.put("/:slug", async (req, res) => {
  const parsed = astrologerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.flatten() });
  const a = parsed.data;
  try {
    const { rows } = await query("astrologers", "update", {
      eq: [["slug", req.params.slug]],
      data: {
        slug: a.slug,
        name: a.name,
        title: a.title,
        image: a.image ?? null,
        verified: a.verified,
        online: a.online,
        rating: a.rating,
        reviews: a.reviews,
        experience_years: a.experienceYears,
        languages: a.languages,
        specialties: a.specialties,
        price_chat: a.priceChat,
        price_call: a.priceCall,
        about: a.about,
        service_slug: a.serviceSlug ?? null,
        featured: a.featured,
        display_order: a.order,
        active: a.active,
      },
    });
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e: any) {
    if (e.code === "23505") return res.status(409).json({ error: `Slug "${a.slug}" already exists.` });
    res.status(500).json({ error: "DB error" });
  }
});

router.post("/seed", async (_req, res) => {
  try {
    const { rows } = await query("astrologers", "select", { limit: 1 });
    if (rows.length > 0) return res.json({ ok: true, message: "Already seeded" });

    const seed = [
      { slug:"guruji", name:"Guruji", title:"Founder • Vedic Master", image:"/images/rishi-guruji.svg", verified:true, online:true, rating:4.9, reviews:1280, experience_years:25, languages:["English","Kannada","Hindi","Telugu"], specialties:["Vedic Astrology","Marriage","Career","Relationship"], price_chat:2000, price_call:2500, about:"Authentic Vedic guidance grounded in classical Jyotisha.", service_slug:"janna-jataka-comprehensive-birth-chart", featured:true, display_order:0, active:true },
      { slug:"vedic-relationship", name:"Acharya Meera", title:"Relationship & Compatibility", image:"/images/rishi-guruji.svg", verified:true, online:true, rating:4.8, reviews:640, experience_years:14, languages:["English","Hindi"], specialties:["Relationship","Marriage","Vedic Astrology"], price_chat:1800, price_call:2200, about:"Specialises in Venus, 7th house, guna matching, and restoring harmony.", service_slug:"love-relationship-problems", featured:false, display_order:1, active:true },
      { slug:"career-guide", name:"Pandit Arjun Rao", title:"Career & Dasha Timing", image:"/images/rishi-guruji.svg", verified:true, online:false, rating:4.7, reviews:410, experience_years:18, languages:["English","Kannada","Tamil"], specialties:["Career","Finance","Vedic Astrology"], price_chat:1600, price_call:2100, about:"Focuses on 10th-house strength, Saturn transits, and timing for job change.", service_slug:"career-confusion-job-problems", featured:false, display_order:2, active:true },
      { slug:"palm-vastu", name:"Smt. Lakshmi Sharma", title:"Palmistry & Vastu", image:"/images/rishi-guruji.svg", verified:true, online:true, rating:4.6, reviews:290, experience_years:12, languages:["English","Hindi","Marathi"], specialties:["Palmistry","Vastu","Numerology"], price_chat:1200, price_call:1600, about:"Reads the five major lines and mounts, then aligns home directions with planetary remedies.", service_slug:null, featured:false, display_order:3, active:true },
      { slug:"kp-timing", name:"Prof. Nikhil Iyer", title:"KP Astrology & Muhurat", image:"/images/rishi-guruji.svg", verified:true, online:true, rating:4.8, reviews:355, experience_years:16, languages:["English","Malayalam"], specialties:["KP Astrology","Career","Finance"], price_chat:1900, price_call:2400, about:"Uses Krishnamurti Paddhati sub-lords for precise event timing and muhurat.", service_slug:"janna-jataka-comprehensive-birth-chart", featured:false, display_order:4, active:true },
    ];

    for (const a of seed) {
      await query("astrologers", "upsert", {
        data: {
          slug: a.slug, name: a.name, title: a.title, image: a.image,
          verified: a.verified, online: a.online, rating: a.rating, reviews: a.reviews,
          experience_years: a.experience_years, languages: a.languages, specialties: a.specialties,
          price_chat: a.price_chat, price_call: a.price_call, about: a.about,
          service_slug: a.service_slug, featured: a.featured, display_order: a.display_order, active: a.active,
        },
        onConflict: "slug",
      });
    }
    res.json({ ok: true, message: `Seeded ${seed.length} astrologers` });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.delete("/:slug", async (req, res) => {
  try {
    const { rowCount } = await query("astrologers", "delete", {
      eq: [["slug", req.params.slug]],
    });
    if (!rowCount) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "DB error" });
  }
});

export default router;
