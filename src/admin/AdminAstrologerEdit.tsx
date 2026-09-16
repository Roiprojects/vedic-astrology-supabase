import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AstrologerForm, type AstrologerFormData } from "./AdminAstrologerForm";
import { siteConfig } from "@/lib/site";

function rowToForm(r: Record<string, unknown>): AstrologerFormData {
  const arr = (v: unknown) => (Array.isArray(v) ? v.join(", ") : typeof v === "string" ? v : "");
  return {
    slug: String(r.slug ?? ""),
    name: String(r.name ?? ""),
    title: String(r.title ?? ""),
    image: String(r.image ?? ""),
    verified: Boolean(r.verified),
    online: Boolean(r.online),
    rating: Number(r.rating ?? 4.5),
    reviews: Number(r.reviews ?? 0),
    experienceYears: Number(r.experience_years ?? 0),
    languages: arr(r.languages),
    specialties: arr(r.specialties),
    priceChat: Number(r.price_chat ?? 0),
    priceCall: Number(r.price_call ?? 0),
    about: String(r.about ?? ""),
    serviceSlug: String(r.service_slug ?? ""),
    featured: Boolean(r.featured),
    order: Number(r.display_order ?? 0),
    active: Boolean(r.active),
  };
}

export default function AdminAstrologerEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const [formData, setFormData] = useState<AstrologerFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    apiFetch(`/api/admin/astrologers/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.astrologer) setFormData(rowToForm(d.astrologer));
        else setError("Astrologer not found");
      })
      .catch((e) => setError(e.message));
  }, [slug]);

  return (
    <div>
      <Helmet>
        <title>Edit Astrologer — Admin — {siteConfig.name}</title>
      </Helmet>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/astrologers" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Astrologers
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-ink">{slug}</span>
      </div>
      <h1 className="mb-6 font-serif text-3xl text-ink">Edit Astrologer</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {!formData && !error && <p className="text-sm text-muted">Loading…</p>}
      {formData && <AstrologerForm initialData={formData} editSlug={slug} />}
    </div>
  );
}
