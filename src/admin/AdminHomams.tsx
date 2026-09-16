import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Pencil, Plus, Star } from "lucide-react";
import { getAdminHomams } from "@/lib/admin-data";
import type { Homam } from "@/lib/data/types";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site";

function formatPrice(price: number, discount?: number | null) {
  if (discount != null && discount < price) {
    return `₹${discount.toLocaleString("en-IN")} (was ₹${price.toLocaleString("en-IN")})`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

export default function AdminHomamsPage() {
  const [homams, setHomams] = useState<Homam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminHomams()
      .then(setHomams)
      .catch((err) => setError(err.message || "Could not load homams."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>Homams — Admin — {siteConfig.name}</title>
      </Helmet>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Homams</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? "…" : `${homams.length} homam${homams.length === 1 ? "" : "s"} · edit any field, toggle visibility, or add a new one.`}
          </p>
        </div>
        <Link
          to="/admin/homams/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron via-saffron-deep to-gold-deep px-5 py-2.5 text-sm font-medium text-[#1a0a04] shadow-[0_10px_30px_-10px_rgba(240,132,46,0.6)] transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New Homam
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-gold/20 bg-surface/60">
        {error && <p className="p-5 text-sm text-danger">{error}</p>}
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/20 bg-[#b67a1b]/[0.02] text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-5 py-3 font-medium">Homam</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Price</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Order</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Edit</th>
            </tr>
          </thead>
          <tbody>
            {homams.map((h) => (
              <tr key={h.slug} className="border-b border-gold/10 last:border-0 hover:bg-[#b67a1b]/[0.015]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/20 bg-[#b67a1b]/[0.03] text-xl">
                      {h.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-medium text-ink">
                        <span className="truncate">{h.name}</span>
                        {h.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" />}
                      </div>
                      <div className="truncate text-xs text-faint">/{h.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-5 py-4 text-muted sm:table-cell">{formatPrice(h.price, h.discountPrice)}</td>
                <td className="hidden px-5 py-4 text-muted md:table-cell">{h.order}</td>
                <td className="px-5 py-4">
                  <span className={h.active ? "inline-flex rounded-full bg-online/10 px-2.5 py-0.5 text-xs font-medium text-online ring-1 ring-online/30" : "inline-flex rounded-full bg-[#b67a1b]/[0.04] px-2.5 py-0.5 text-xs font-medium text-faint ring-1 ring-gold/20"}>
                    {h.active ? "Live" : "Hidden"}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link to={`/admin/homams/${h.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-gold-light transition-colors hover:border-gold/70">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
