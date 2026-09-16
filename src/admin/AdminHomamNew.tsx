import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { getAdminHomams } from "@/lib/admin-data";
import { HomamForm } from "@/components/admin/HomamForm";
import type { Homam } from "@/lib/data/types";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site";

export default function AdminHomamNewPage() {
  const [loading, setLoading] = useState(true);
  const [nextOrder, setNextOrder] = useState(1);

  useEffect(() => {
    getAdminHomams()
      .then((data) => setNextOrder(data.reduce((max, h) => Math.max(max, h.order), 0) + 1))
      .finally(() => setLoading(false));
  }, []);

  const blank: Homam = {
    slug: "",
    name: "",
    icon: "🔥",
    shortBenefit: "",
    fullDescription: "",
    price: 0,
    discountPrice: null,
    duration: "2–3 hours",
    gradient: "from-orange-500/30 to-red-600/30",
    benefits: [],
    suitableFor: [],
    poojaItems: [],
    bookingInstructions: "",
    faqs: [],
    featured: false,
    order: nextOrder,
    active: true,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>New Homam — Admin — {siteConfig.name}</title>
      </Helmet>
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <>
          <Link to="/admin/homams" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            Back to homams
          </Link>
          <h1 className="mt-4 font-serif text-3xl text-ink">New homam</h1>
          <p className="mt-1 text-sm text-muted">Add a new sacred fire ritual to the site.</p>
          <HomamForm mode="create" initial={blank} />
        </>
      )}
    </div>
  );
}
