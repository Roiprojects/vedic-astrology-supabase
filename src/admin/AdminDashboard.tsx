import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Flame,
  MessageSquare,
  Star,
  Users,
  FileText,
  ClipboardList,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { siteConfig } from "@/lib/site";

type Enquiry = {
  id: number;
  name: string;
  subject?: string;
  variant?: string;
  status: string;
  created_at: string;
};

type Stats = {
  services: number;
  homams: number;
  astrologers: number;
  enquiries: number;
  testimonials: number;
};

const QUICK_LINKS = [
  { to: "/admin/services", icon: BookOpen, label: "Services", color: "text-amber-600" },
  { to: "/admin/homams", icon: Flame, label: "Homams", color: "text-orange-600" },
  { to: "/admin/astrologers", icon: Users, label: "Astrologers", color: "text-indigo-500" },
  { to: "/admin/testimonials", icon: Star, label: "Testimonials", color: "text-yellow-500" },
  { to: "/admin/enquiries", icon: MessageSquare, label: "Enquiries", color: "text-emerald-600" },
  { to: "/admin/pages/birth-chart-pdf", icon: FileText, label: "Pages", color: "text-sky-500" },
];

function StatCard({ label, value, icon: Icon, loading }: { label: string; value: number; icon: React.ElementType; loading: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-gold/20 bg-surface/60 p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-gold/20 bg-[#b67a1b]/[0.04]">
        <Icon className="h-5 w-5 text-gold-light" />
      </span>
      <div>
        <p className="font-serif text-2xl leading-none text-ink">
          {loading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-gold/10" /> : value}
        </p>
        <p className="mt-0.5 text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

function statusColor(status: string) {
  if (status === "new") return "bg-emerald-100 text-emerald-700";
  if (status === "contacted") return "bg-blue-100 text-blue-700";
  if (status === "completed") return "bg-gray-100 text-gray-500";
  return "bg-gold/10 text-gold-light";
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ services: 0, homams: 0, astrologers: 0, enquiries: 0, testimonials: 0 });
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch("/api/admin/services").then(r => r.json()).catch(() => ({})),
      apiFetch("/api/admin/homams").then(r => r.json()).catch(() => ({})),
      apiFetch("/api/admin/astrologers").then(r => r.json()).catch(() => ({})),
      apiFetch("/api/admin/enquiries").then(r => r.json()).catch(() => ({})),
      apiFetch("/api/admin/testimonials").then(r => r.json()).catch(() => ({})),
    ]).then(([svc, hom, ast, enq, tes]) => {
      setStats({
        services: svc.services?.length ?? 0,
        homams: hom.homams?.length ?? 0,
        astrologers: ast.astrologers?.length ?? 0,
        enquiries: enq.enquiries?.length ?? 0,
        testimonials: tes.testimonials?.length ?? 0,
      });
      setRecentEnquiries((enq.enquiries ?? []).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Helmet>
        <title>Dashboard — Admin — {siteConfig.name}</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-serif text-3xl text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Overview of your site content and recent activity.</p>
        </div>
        <a
          href="/"
          target="_blank"
          className="text-sm text-muted underline underline-offset-2 hover:text-ink"
        >
          View site ↗
        </a>
      </div>

      {/* Stats */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Services" value={stats.services} icon={BookOpen} loading={loading} />
        <StatCard label="Homams" value={stats.homams} icon={Flame} loading={loading} />
        <StatCard label="Astrologers" value={stats.astrologers} icon={Users} loading={loading} />
        <StatCard label="Enquiries" value={stats.enquiries} icon={ClipboardList} loading={loading} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Quick links */}
        <div className="lg:col-span-1">
          <h2 className="mb-3 font-serif text-xl text-ink">Manage</h2>
          <div className="overflow-hidden rounded-3xl border border-gold/20 bg-surface/60">
            {QUICK_LINKS.map((item, i) => (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gold/[0.04] ${i !== 0 ? "border-t border-gold/10" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="text-sm font-medium text-ink">{item.label}</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent enquiries */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-serif text-xl text-ink">Recent Enquiries</h2>
            <Link to="/admin/enquiries" className="text-xs text-gold-light underline underline-offset-2 hover:text-ink">
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-gold/20 bg-surface/60">
            {loading && (
              <div className="space-y-px">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="h-3 w-24 animate-pulse rounded bg-gold/10" />
                    <div className="h-3 w-16 animate-pulse rounded bg-gold/10" />
                  </div>
                ))}
              </div>
            )}
            {!loading && recentEnquiries.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-muted">No enquiries yet.</p>
            )}
            {!loading && recentEnquiries.map((e, i) => (
              <div
                key={e.id}
                className={`flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 ${i !== 0 ? "border-t border-gold/10" : ""}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{e.name}</p>
                  <p className="truncate text-xs text-muted">{e.subject ?? e.variant ?? "—"}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-medium capitalize ${statusColor(e.status)}`}>
                    {e.status}
                  </span>
                  <span className="text-[0.68rem] text-muted">
                    {new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
