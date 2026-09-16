import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { isPageId, PAGE_CONFIG } from "@/lib/data";
import { getAdminPageContent } from "@/lib/admin-data";
import type { PageContent } from "@/lib/data";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { Link, useParams } from "react-router-dom";
import { siteConfig } from "@/lib/site";

export default function AdminPagesPage() {
  const { page: pageParam } = useParams<{ page: string }>();
  const page = pageParam ?? "";

  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!page || !isPageId(page)) {
      setContent(null);
      setLoading(false);
      return;
    }
    setError(null);
    getAdminPageContent(page)
      .then(setContent)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load page content."))
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) {
    return <div className="mx-auto max-w-3xl"><p className="text-muted">Loading…</p></div>;
  }

  if (!content || !isPageId(page)) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">{error || "Page not found."}</p>
        <Link to="/admin" className="text-gold-light underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const config = PAGE_CONFIG[page];

  return (
    <div className="mx-auto max-w-3xl">
      <Helmet>
        <title>Edit · {config.label} — Admin — {siteConfig.name}</title>
      </Helmet>
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl text-ink">{config.label}</h1>
        <Link to={config.href} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-gold-light hover:text-gold">
          View page <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">Edit the hero and content shown on this page.</p>

      <PageContentForm pageId={page} initial={content} config={config} />
    </div>
  );
}
