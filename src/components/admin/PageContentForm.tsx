import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveAdminPageContent } from "@/lib/admin-data";
import type { PageContent, PageId } from "@/lib/data/pages-store";

const inputCls =
  "w-full rounded-xl border border-gold/30 bg-overlay px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold/70";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-gold/20 bg-surface/60 p-6 sm:p-7">
      <h2 className="font-serif text-xl text-ink">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function PageContentForm({
  pageId,
  initial,
  config,
}: {
  pageId: PageId;
  initial: PageContent;
  config: { pricing: boolean; includes: boolean; faqs: boolean };
}) {
  const [form, setForm] = useState<PageContent>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof PageContent>(key: K, value: PageContent[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const payload = {
      ...form,
      price: form.price === null || form.price === undefined ? null : Number(form.price),
      includes: form.includes.map((s) => s.trim()).filter(Boolean),
      faqs: form.faqs
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
        .filter((f) => f.question && f.answer),
    };

    try {
      await saveAdminPageContent(pageId, payload);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-2xl border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}
      {saved && (
        <div className="rounded-2xl border border-online/40 bg-online/5 px-4 py-3 text-sm text-online">
          Saved. Changes are live on the page.
        </div>
      )}

      <Section title="Hero">
        <div>
          <label className={labelCls}>Eyebrow</label>
          <input className={inputCls} value={form.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Title</label>
          <input className={inputCls} value={form.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Subtitle</label>
          <textarea className={inputCls} rows={2} value={form.subtitle} onChange={(e) => update("subtitle", e.target.value)} />
        </div>
      </Section>

      {config.pricing && (
        <Section title="Pricing">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Price (₹)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.price ?? ""}
                onChange={(e) => update("price", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Leave blank to hide"
              />
            </div>
            <div>
              <label className={labelCls}>Price note</label>
              <input className={inputCls} value={form.priceNote} onChange={(e) => update("priceNote", e.target.value)} placeholder="Delivered in 24–48 hours" />
            </div>
          </div>
        </Section>
      )}

      {config.includes && (
        <Section title="Report includes">
          <div className="space-y-2">
            {form.includes.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={inputCls} value={item} onChange={(e) => update("includes", form.includes.map((it, idx) => (idx === i ? e.target.value : it)))} />
                <button type="button" aria-label="Remove" onClick={() => update("includes", form.includes.filter((_, idx) => idx !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gold/25 text-faint transition-colors hover:border-danger/50 hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => update("includes", [...form.includes, ""])} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold-light transition-colors hover:border-gold/70">
            <Plus className="h-3.5 w-3.5" /> Add item
          </button>
        </Section>
      )}

      {config.faqs && (
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
      )}

      <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-saffron via-saffron-deep to-gold-deep px-7 py-3 text-sm font-medium text-[#1a0a04] shadow-[0_10px_30px_-10px_rgba(240,132,46,0.6)] transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50">
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
