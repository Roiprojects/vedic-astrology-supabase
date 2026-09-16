import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getAdminService } from "@/lib/admin-data";
import type { Service } from "@/lib/data/types";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site";

export default function AdminServiceEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const serviceSlug = slug ?? "";
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = await getAdminService(serviceSlug);
      if (!cancelled) setService(data);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">Loading…</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">Service not found.</p>
        <Link to="/admin/services" className="text-gold-light underline">
          Back to services
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Edit · {service.title} — Admin — {siteConfig.name}</title>
      </Helmet>
      <Link
        to="/admin/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to services
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink">Edit service</h1>
      <p className="mt-1 text-sm text-muted">
        Editing <span className="font-medium text-ink">{service.title}</span>
      </p>

      <ServiceForm mode="edit" initial={service} />
    </div>
  );
}
