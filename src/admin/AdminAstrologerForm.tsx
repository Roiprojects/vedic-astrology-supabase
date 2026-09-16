import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";

export type AstrologerFormData = {
  slug: string;
  name: string;
  title: string;
  image: string;
  verified: boolean;
  online: boolean;
  rating: number;
  reviews: number;
  experienceYears: number;
  languages: string;
  specialties: string;
  priceChat: number;
  priceCall: number;
  about: string;
  serviceSlug: string;
  featured: boolean;
  order: number;
  active: boolean;
};

export const EMPTY: AstrologerFormData = {
  slug: "",
  name: "",
  title: "",
  image: "",
  verified: false,
  online: false,
  rating: 4.5,
  reviews: 0,
  experienceYears: 0,
  languages: "",
  specialties: "",
  priceChat: 0,
  priceCall: 0,
  about: "",
  serviceSlug: "",
  featured: false,
  order: 0,
  active: true,
};

function toPayload(f: AstrologerFormData) {
  return {
    slug: f.slug,
    name: f.name,
    title: f.title,
    image: f.image || null,
    verified: f.verified,
    online: f.online,
    rating: Number(f.rating),
    reviews: Number(f.reviews),
    experienceYears: Number(f.experienceYears),
    languages: f.languages.split(",").map((s) => s.trim()).filter(Boolean),
    specialties: f.specialties.split(",").map((s) => s.trim()).filter(Boolean),
    priceChat: Number(f.priceChat),
    priceCall: Number(f.priceCall),
    about: f.about,
    serviceSlug: f.serviceSlug || null,
    featured: f.featured,
    order: Number(f.order),
    active: f.active,
  };
}

type Props = {
  initialData?: AstrologerFormData;
  editSlug?: string;
};

export function AstrologerForm({ initialData, editSlug }: Props) {
  const navigate = useNavigate();
  const [form, setForm] = useState<AstrologerFormData>(initialData ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof AstrologerFormData>(key: K, value: AstrologerFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const inputCls = "w-full rounded-xl border border-gold/30 bg-overlay px-3.5 py-2.5 text-sm text-ink outline-none focus:border-gold/70 placeholder:text-faint";
  const labelCls = "mb-1.5 block text-sm font-medium text-ink";
  const fieldCls = "space-y-1.5";

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const method = editSlug ? "PUT" : "POST";
      const url = editSlug ? `/api/admin/astrologers/${editSlug}` : "/api/admin/astrologers";
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      navigate("/admin/astrologers");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAstrologer() {
    if (!editSlug || !confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/astrologers/${editSlug}`, { method: "DELETE" });
      navigate("/admin/astrologers");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Basic info */}
      <section className="rounded-3xl border border-gold/20 bg-surface/60 p-6 space-y-4">
        <h2 className="font-serif text-lg text-ink">Basic Info</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className={fieldCls}>
            <label className={labelCls}>Name *</label>
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Guruji" />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Slug *</label>
            <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="guruji" />
          </div>
          <div className={`${fieldCls} sm:col-span-2`}>
            <label className={labelCls}>Title / Role</label>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Founder • Vedic Master" />
          </div>
          <div className={`${fieldCls} sm:col-span-2`}>
            <label className={labelCls}>Profile Image URL</label>
            <input className={inputCls} value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://... or /images/..." />
            {form.image && <img src={form.image} alt="" className="mt-2 h-16 w-16 rounded-full object-cover ring-1 ring-gold/30" />}
          </div>
          <div className={`${fieldCls} sm:col-span-2`}>
            <label className={labelCls}>About</label>
            <textarea className={`${inputCls} min-h-[100px] resize-y`} value={form.about} onChange={(e) => set("about", e.target.value)} placeholder="Brief bio shown on the astrologer card…" />
          </div>
        </div>
      </section>

      {/* Rates & experience */}
      <section className="rounded-3xl border border-gold/20 bg-surface/60 p-6 space-y-4">
        <h2 className="font-serif text-lg text-ink">Rates & Experience</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className={fieldCls}>
            <label className={labelCls}>Chat rate (₹/min)</label>
            <input type="number" className={inputCls} value={form.priceChat} onChange={(e) => set("priceChat", Number(e.target.value))} min={0} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Call rate (₹/min)</label>
            <input type="number" className={inputCls} value={form.priceCall} onChange={(e) => set("priceCall", Number(e.target.value))} min={0} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Experience (years)</label>
            <input type="number" className={inputCls} value={form.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} min={0} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Rating (0–5)</label>
            <input type="number" step="0.1" className={inputCls} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} min={0} max={5} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Review count</label>
            <input type="number" className={inputCls} value={form.reviews} onChange={(e) => set("reviews", Number(e.target.value))} min={0} />
          </div>
          <div className={fieldCls}>
            <label className={labelCls}>Display order</label>
            <input type="number" className={inputCls} value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="rounded-3xl border border-gold/20 bg-surface/60 p-6 space-y-4">
        <h2 className="font-serif text-lg text-ink">Skills & Languages</h2>
        <div className={fieldCls}>
          <label className={labelCls}>Languages (comma-separated)</label>
          <input className={inputCls} value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="English, Hindi, Kannada" />
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Specialties (comma-separated)</label>
          <input className={inputCls} value={form.specialties} onChange={(e) => set("specialties", e.target.value)} placeholder="Vedic Astrology, Marriage, Career" />
        </div>
        <div className={fieldCls}>
          <label className={labelCls}>Linked service slug (optional)</label>
          <input className={inputCls} value={form.serviceSlug} onChange={(e) => set("serviceSlug", e.target.value)} placeholder="vedic-astrology-consultation" />
        </div>
      </section>

      {/* Flags */}
      <section className="rounded-3xl border border-gold/20 bg-surface/60 p-6">
        <h2 className="font-serif text-lg text-ink mb-4">Visibility & Status</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["active", "Visible in app"],
              ["online", "Show as online"],
              ["verified", "Verified badge"],
              ["featured", "Featured"],
            ] as [keyof AstrologerFormData, string][]
          ).map(([key, label]) => (
            <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl border border-gold/20 px-4 py-3 hover:bg-gold/[0.03]">
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="h-4 w-4 accent-saffron"
              />
              <span className="text-sm text-ink">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-8">
        {editSlug ? (
          <button
            type="button"
            onClick={deleteAstrologer}
            disabled={deleting}
            className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        ) : (
          <div />
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/astrologers")}
            className="rounded-full border border-gold/30 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-gold/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-full bg-gradient-to-r from-saffron to-gold-deep px-6 py-2.5 text-sm font-medium text-[#1a0a04] shadow-md transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {saving ? "Saving…" : editSlug ? "Save Changes" : "Create Astrologer"}
          </button>
        </div>
      </div>
    </div>
  );
}
