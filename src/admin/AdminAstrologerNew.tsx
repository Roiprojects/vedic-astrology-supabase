import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { AstrologerForm } from "./AdminAstrologerForm";
import { siteConfig } from "@/lib/site";

export default function AdminAstrologerNewPage() {
  return (
    <div>
      <Helmet>
        <title>New Astrologer — Admin — {siteConfig.name}</title>
      </Helmet>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/astrologers" className="flex items-center gap-1 text-sm text-muted hover:text-ink">
          <ChevronLeft className="h-4 w-4" /> Astrologers
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm text-ink">New</span>
      </div>
      <h1 className="mb-6 font-serif text-3xl text-ink">New Astrologer</h1>
      <AstrologerForm />
    </div>
  );
}
