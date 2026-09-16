import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAdminHomam } from "@/lib/admin-data";
import type { Homam } from "@/lib/data/types";
import { HomamForm } from "@/components/admin/HomamForm";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site";

export default function AdminHomamEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const homamSlug = slug ?? "";
  const [homam, setHomam] = useState<Homam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getAdminHomam(homamSlug);
      if (!cancelled) setHomam(data);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [homamSlug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!homam) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">Homam not found.</p>
        <Link to="/admin/homams" className="text-gold-light underline">
          Back to homams
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Edit · {homam.name} — Admin — {siteConfig.name}</title>
      </Helmet>
      <Link to="/admin/homams" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to homams
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Edit homam</h1>
      <p className="mt-1 text-sm text-muted">
        Editing <span className="font-medium text-ink">{homam.name}</span>
      </p>
      <HomamForm mode="edit" initial={homam} />
    </div>
  );
}
