import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { siteConfig } from "@/lib/site";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  service_type: string;
  text: string;
  date: string;
  avatar_initial: string;
  featured: boolean;
  display_order: number;
  active: boolean;
}

const empty: Omit<Testimonial, "id"> = {
  name: "", location: "", rating: 5, service_type: "all", text: "",
  date: new Date().toISOString().slice(0, 10), avatar_initial: "",
  featured: false, display_order: 0, active: true,
};

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, "id">>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await apiFetch("/api/admin/testimonials");
    const data = await res.json();
    setItems(data.testimonials ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function startNew() {
    setEditing(null);
    setForm(empty);
    setError(null);
  }

  function startEdit(t: Testimonial) {
    setEditing(t);
    setForm({ name: t.name, location: t.location, rating: t.rating, service_type: t.service_type,
      text: t.text, date: t.date?.slice(0,10) ?? "", avatar_initial: t.avatar_initial,
      featured: t.featured, display_order: t.display_order, active: t.active });
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = editing
        ? await apiFetch(`/api/admin/testimonials/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await apiFetch("/api/admin/testimonials", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setEditing(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    if (!confirm("Delete this testimonial?")) return;
    await apiFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    await load();
  }

  const isFormOpen = editing !== null || form !== empty;

  return (
    <div>
      <Helmet><title>Testimonials — Admin — {siteConfig.name}</title></Helmet>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Testimonials</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? "…" : `${items.length} testimonial${items.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron via-saffron-deep to-gold-deep px-5 py-2.5 text-sm font-medium text-[#1a0a04] shadow-[0_10px_30px_-10px_rgba(240,132,46,0.6)] transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </button>
      </div>

      {/* Inline form */}
      {(editing !== null || form.name !== "") && (
        <div className="mt-6 rounded-3xl border border-gold/25 bg-surface/60 p-6">
          <h2 className="mb-4 font-serif text-xl text-ink">{editing ? "Edit Testimonial" : "New Testimonial"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full rounded-xl border border-gold/30 bg-overlay px-3 py-2 text-sm text-ink outline-none focus:border-gold/70" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full rounded-xl border border-gold/30 bg-overlay px-3 py-2 text-sm text-ink outline-none focus:border-gold/70" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Rating (1–5)</label>
              <input type="number" min={1} max={5} value={form.rating} onChange={e => setForm(f => ({ ...f, rating: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gold/30 bg-overlay px-3 py-2 text-sm text-ink outline-none focus:border-gold/70" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-gold/30 bg-overlay px-3 py-2 text-sm text-ink outline-none focus:border-gold/70" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">Testimonial Text *</label>
              <textarea rows={4} value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                className="w-full rounded-xl border border-gold/30 bg-overlay px-3 py-2 text-sm text-ink outline-none focus:border-gold/70" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Service Type</label>
              <input value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))}
                placeholder="e.g. all, consultation, homam"
                className="w-full rounded-xl border border-gold/30 bg-overlay px-3 py-2 text-sm text-ink outline-none focus:border-gold/70" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gold/30 bg-overlay px-3 py-2 text-sm text-ink outline-none focus:border-gold/70" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="h-4 w-4" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="h-4 w-4" />
                Active
              </label>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <div className="mt-5 flex gap-3">
            <button onClick={save} disabled={saving}
              className="rounded-full bg-gradient-to-r from-saffron to-gold-deep px-5 py-2 text-sm font-medium text-[#1a0a04] disabled:opacity-50">
              {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setEditing(null); setForm(empty); }}
              className="rounded-full border border-gold/30 px-5 py-2 text-sm font-medium text-muted hover:text-ink">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-gold/20 bg-surface/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/20 bg-[#b67a1b]/[0.02] text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Text</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No testimonials yet.</td></tr>
            ) : items.map(t => (
              <tr key={t.id} className="border-b border-gold/10 last:border-0 hover:bg-[#b67a1b]/[0.015]">
                <td className="px-5 py-4">
                  <div className="font-medium text-ink flex items-center gap-1.5">
                    {t.name}
                    {t.featured && <Star className="h-3.5 w-3.5 fill-gold text-gold" />}
                  </div>
                  <div className="text-xs text-faint">{t.location}</div>
                </td>
                <td className="hidden px-5 py-4 text-muted sm:table-cell max-w-xs">
                  <p className="line-clamp-2 text-xs">{t.text}</p>
                </td>
                <td className="px-5 py-4 text-muted">{"★".repeat(t.rating)}</td>
                <td className="px-5 py-4">
                  <span className={t.active
                    ? "inline-flex rounded-full bg-online/10 px-2.5 py-0.5 text-xs font-medium text-online ring-1 ring-online/30"
                    : "inline-flex rounded-full bg-[#b67a1b]/[0.04] px-2.5 py-0.5 text-xs font-medium text-faint ring-1 ring-gold/20"}>
                    {t.active ? "Live" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => startEdit(t)}
                      className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold-light hover:border-gold/70">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button onClick={() => remove(t.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger hover:border-danger/70">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
