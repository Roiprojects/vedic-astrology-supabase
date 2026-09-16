import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { siteConfig } from "@/lib/site";

interface Enquiry {
  id: number;
  reference: string;
  variant: string;
  subject: string;
  name: string;
  phone: string;
  email: string | null;
  dob: string | null;
  tob: string | null;
  pob: string | null;
  gender: string | null;
  message: string | null;
  service_interested: string | null;
  status: string;
  payment_id: string | null;
  payment_amount: number | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/30",
  contacted: "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-400/30",
  confirmed: "bg-online/10 text-online ring-1 ring-online/30",
  completed: "bg-purple-500/10 text-purple-400 ring-1 ring-purple-400/30",
  cancelled: "bg-danger/10 text-danger ring-1 ring-danger/30",
};

export default function AdminEnquiriesPage() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load(status: string) {
    setLoading(true);
    const url = status === "all" ? "/api/admin/enquiries" : `/api/admin/enquiries?status=${status}`;
    const res = await apiFetch(url);
    const data = await res.json();
    setItems(data.enquiries ?? []);
    setLoading(false);
  }

  useEffect(() => { load(filter); }, [filter]);

  async function updateStatus(id: number, status: string) {
    await apiFetch(`/api/admin/enquiries/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load(filter);
  }

  function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div>
      <Helmet><title>Enquiries — Admin — {siteConfig.name}</title></Helmet>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? "…" : `${items.length} enquir${items.length === 1 ? "y" : "ies"}`}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "new", "contacted", "confirmed", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${filter === s ? "bg-gold/20 text-gold-light border border-gold/40" : "border border-gold/20 text-muted hover:text-ink"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="py-8 text-center text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted">No enquiries yet.</p>
        ) : items.map(e => (
          <div key={e.id} className="rounded-2xl border border-gold/20 bg-surface/60 overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-[#b67a1b]/[0.015] transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-ink">{e.name}</span>
                  <span className="text-xs text-faint">{e.reference}</span>
                  {e.payment_id && (
                    <span className="rounded-full bg-online/10 px-2 py-0.5 text-xs text-online ring-1 ring-online/30">
                      Paid ₹{e.payment_amount?.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
                  <span>{e.phone}</span>
                  {e.email && <span>{e.email}</span>}
                  <span className="capitalize">{e.variant} · {e.subject || "—"}</span>
                  <span>{fmt(e.created_at)}</span>
                </div>
              </div>
              <span className={`shrink-0 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[e.status] ?? "bg-faint/10 text-faint ring-1 ring-faint/20"}`}>
                {e.status}
              </span>
            </button>

            {expanded === e.id && (
              <div className="border-t border-gold/15 px-5 pb-5 pt-4">
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  {e.dob && <div><span className="text-faint">DOB:</span> <span className="text-ink">{e.dob?.slice(0,10)}</span></div>}
                  {e.tob && <div><span className="text-faint">TOB:</span> <span className="text-ink">{e.tob}</span></div>}
                  {e.pob && <div><span className="text-faint">POB:</span> <span className="text-ink">{e.pob}</span></div>}
                  {e.gender && <div><span className="text-faint">Gender:</span> <span className="text-ink capitalize">{e.gender}</span></div>}
                  {e.service_interested && <div><span className="text-faint">Service:</span> <span className="text-ink">{e.service_interested}</span></div>}
                  {e.payment_id && <div className="sm:col-span-2"><span className="text-faint">Payment ID:</span> <span className="text-ink font-mono text-xs">{e.payment_id}</span></div>}
                </div>
                {e.message && (
                  <div className="mt-3">
                    <p className="text-xs text-faint mb-1">Message:</p>
                    <p className="text-sm text-ink bg-overlay rounded-xl p-3">{e.message}</p>
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-xs text-faint self-center">Update status:</span>
                  {["new", "contacted", "confirmed", "completed", "cancelled"].map(s => (
                    <button key={s} disabled={e.status === s}
                      onClick={() => updateStatus(e.id, s)}
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${e.status === s ? "bg-gold/20 text-gold-light border border-gold/40" : "border border-gold/20 text-muted hover:text-ink"} disabled:cursor-default`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
