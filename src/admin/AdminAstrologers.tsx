import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Wifi, WifiOff } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { siteConfig } from "@/lib/site";

type AstrologerRow = {
  id: number;
  slug: string;
  name: string;
  title: string;
  image?: string;
  online: boolean;
  verified: boolean;
  rating: number;
  reviews: number;
  price_chat: number;
  active: boolean;
  display_order: number;
};

export default function AdminAstrologersPage() {
  const [rows, setRows] = useState<AstrologerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/admin/astrologers")
      .then((r) => r.json())
      .then((d) => setRows(d.astrologers ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>Astrologers — Admin — {siteConfig.name}</title>
      </Helmet>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink">Astrologers</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? "…" : `${rows.length} astrologer${rows.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          to="/admin/astrologers/new"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-saffron via-saffron-deep to-gold-deep px-5 py-2.5 text-sm font-medium text-[#1a0a04] shadow-[0_10px_30px_-10px_rgba(240,132,46,0.6)] transition-transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New Astrologer
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-gold/20 bg-surface/60">
        {error && <p className="p-5 text-sm text-danger">{error}</p>}
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gold/20 bg-[#b67a1b]/[0.02] text-xs uppercase tracking-wide text-faint">
            <tr>
              <th className="px-5 py-3 font-medium">Astrologer</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Rating</th>
              <th className="hidden px-5 py-3 font-medium md:table-cell">Price/chat</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/10">
            {loading &&
              [1, 2, 3].map((i) => (
                <tr key={i}>
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="h-4 w-48 animate-pulse rounded bg-gold/10" />
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && !error && (
              <tr>
                <td className="px-5 py-8 text-center text-muted" colSpan={5}>
                  No astrologers yet. Add one to get started.
                </td>
              </tr>
            )}
            {rows.map((a) => (
              <tr key={a.slug} className="transition-colors hover:bg-gold/[0.03]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {a.image ? (
                      <img src={a.image} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-gold/20" />
                    ) : (
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                        {a.name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-ink">{a.name}</p>
                      <p className="text-xs text-muted">{a.title}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-5 py-4 text-muted sm:table-cell">
                  ⭐ {a.rating} ({a.reviews})
                </td>
                <td className="hidden px-5 py-4 text-muted md:table-cell">
                  ₹{a.price_chat.toLocaleString("en-IN")}/min
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.online
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {a.online ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {a.online ? "Online" : "Offline"}
                    </span>
                    {!a.active && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                        Hidden
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    to={`/admin/astrologers/${a.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-gold/10"
                  >
                    <Pencil className="h-3 w-3" />
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
