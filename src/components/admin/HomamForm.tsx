import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { deleteAdminHomam, saveAdminHomam } from "@/lib/admin-data";
import type { Homam } from "@/lib/data/types";
import { ImageUpload } from "./ImageUpload";

const inputCls =
  "w-full rounded-xl border border-gold/30 bg-overlay px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold/70";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";
const hintCls = "mt-1 text-xs text-faint";

type ListKey = "benefits" | "suitableFor" | "poojaItems";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-gold/20 bg-surface/60 p-6 sm:p-7">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputCls}
              value={item}
              placeholder={placeholder}
              onChange={(e) =>
                onChange(items.map((it, idx) => (idx === i ? e.target.value : it)))
              }
            />
            <button
              type="button"
              aria-label="Remove item"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gold/25 text-faint transition-colors hover:border-danger/50 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold-light transition-colors hover:border-gold/70"
      >
        <Plus className="h-3.5 w-3.5" />
        Add item
      </button>
    </div>
  );
}

export function HomamForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial: Homam;
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState<Homam>(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Homam>(key: K, value: Homam[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function setList(key: ListKey, next: string[]) {
    setForm((f) => ({ ...f, [key]: next }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      price: Number(form.price) || 0,
      order: Number(form.order) || 0,
      discountPrice:
        form.discountPrice === null || form.discountPrice === undefined
          ? null
          : Number(form.discountPrice),
      benefits: form.benefits.map((s) => s.trim()).filter(Boolean),
      suitableFor: form.suitableFor.map((s) => s.trim()).filter(Boolean),
      poojaItems: form.poojaItems.map((s) => s.trim()).filter(Boolean),
      faqs: form.faqs
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question && f.answer),
    };

    try {
      await saveAdminHomam(payload);
      navigate("/admin/homams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete "${initial.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAdminHomam(initial.slug);
      navigate("/admin/homams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      <Section title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input className={inputCls} value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Ganapathi Homam" />
          </div>
          <div>
            <label className={labelCls}>Slug (URL)</label>
            <input className={inputCls} value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="ganapathi-homam" />
            <p className={hintCls}>Shown at /homams/&lt;slug&gt;{mode === "edit" ? " — changing this changes the page URL." : "."}</p>
          </div>
          <div>
            <label className={labelCls}>Icon (emoji)</label>
            <input className={inputCls} value={form.icon} onChange={(e) => update("icon", e.target.value)} placeholder="🕉️" />
          </div>
          <div>
            <label className={labelCls}>Duration</label>
            <input className={inputCls} value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="2–3 hours" />
          </div>
        </div>
        <ImageUpload
          label="Homam image"
          value={form.image}
          onChange={(url) => update("image", url ?? undefined)}
        />
        <div>
          <label className={labelCls}>Short benefit</label>
          <textarea className={inputCls} rows={2} value={form.shortBenefit} onChange={(e) => update("shortBenefit", e.target.value)} placeholder="One-line benefit shown on cards." />
        </div>
        <div>
          <label className={labelCls}>Full description</label>
          <textarea className={inputCls} rows={4} value={form.fullDescription} onChange={(e) => update("fullDescription", e.target.value)} />
        </div>
      </Section>

      <Section title="Pricing & presentation">
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className={labelCls}>Price (₹)</label>
            <input type="number" min={0} className={inputCls} value={form.price} onChange={(e) => update("price", e.target.value === "" ? 0 : Number(e.target.value))} />
          </div>
          <div>
            <label className={labelCls}>Discount price (₹)</label>
            <input type="number" min={0} className={inputCls} value={form.discountPrice ?? ""} onChange={(e) => update("discountPrice", e.target.value === "" ? null : Number(e.target.value))} placeholder="Optional" />
          </div>
          <div>
            <label className={labelCls}>Display order</label>
            <input type="number" className={inputCls} value={form.order} onChange={(e) => update("order", e.target.value === "" ? 0 : Number(e.target.value))} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Gradient (Tailwind classes)</label>
          <input className={inputCls} value={form.gradient} onChange={(e) => update("gradient", e.target.value)} placeholder="from-orange-500/30 to-red-600/30" />
          <p className={hintCls}>Reuse gradient classes already present on other homams so they render correctly.</p>
        </div>
      </Section>

      <Section title="Content lists" description="Bullet points shown across the homam page.">
        <ListEditor label="Benefits" items={form.benefits} onChange={(n) => setList("benefits", n)} />
        <ListEditor label="Suitable for" items={form.suitableFor} onChange={(n) => setList("suitableFor", n)} />
        <ListEditor label="Pooja items" items={form.poojaItems} onChange={(n) => setList("poojaItems", n)} />
        <div>
          <label className={labelCls}>Booking instructions</label>
          <textarea className={inputCls} rows={3} value={form.bookingInstructions} onChange={(e) => update("bookingInstructions", e.target.value)} />
        </div>
      </Section>

      <Section title="FAQs">
        <div className="space-y-4">
          {form.faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl border border-gold/20 bg-[#b67a1b]/[0.015] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-faint">FAQ {i + 1}</span>
                <button type="button" onClick={() => update("faqs", form.faqs.filter((_, idx) => idx !== i))} className="inline-flex items-center gap-1 text-xs text-faint transition-colors hover:text-danger">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <input className={`${inputCls} mb-2`} value={faq.question} placeholder="Question" onChange={(e) => update("faqs", form.faqs.map((f, idx) => (idx === i ? { ...f, question: e.target.value } : f)))} />
              <textarea className={inputCls} rows={3} value={faq.answer} placeholder="Answer" onChange={(e) => update("faqs", form.faqs.map((f, idx) => (idx === i ? { ...f, answer: e.target.value } : f)))} />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => update("faqs", [...form.faqs, { question: "", answer: "" }])} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold-light transition-colors hover:border-gold/70">
          <Plus className="h-3.5 w-3.5" /> Add FAQ
        </button>
      </Section>

      <Section title="Visibility">
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" checked={form.active} onChange={(e) => update("active", e.target.checked)} className="h-4 w-4 accent-saffron" />
            Active — show this homam on the website
          </label>
          <label className="flex items-center gap-3 text-sm text-ink">
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 accent-saffron" />
            Featured — include in homepage highlights
          </label>
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-saffron via-saffron-deep to-gold-deep px-7 py-3 text-sm font-medium text-[#1a0a04] shadow-[0_10px_30px_-10px_rgba(240,132,46,0.6)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50">
          {saving ? "Saving…" : mode === "create" ? "Create homam" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button type="button" onClick={onDelete} disabled={deleting} className="inline-flex items-center gap-1.5 rounded-full border border-danger/40 px-5 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-50">
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </form>
  );
}
