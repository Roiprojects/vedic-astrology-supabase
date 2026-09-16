import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { useAuth } from "@/hooks/useAuth";
import { siteConfig } from "@/lib/site";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { loading, session, isAdmin } = useAuth();

  if (loading) {
    return <main className="container-x py-8 text-muted">Loading…</main>;
  }

  if (!session || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Admin — {siteConfig.name}</title>
      </Helmet>
      <header className="sticky top-0 z-40 border-b border-gold/20 bg-overlay/85 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo href="/admin/services" compact size={40} />
            <span className="hidden rounded-full border border-gold/25 px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide text-gold-light sm:inline">
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-1">
            <a
              href="/admin"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              Dashboard
            </a>
            <a
              href="/admin/services"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink sm:inline"
            >
              Services
            </a>
            <a
              href="/admin/homams"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink sm:inline"
            >
              Homams
            </a>
            <a
              href="/admin/astrologers"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink sm:inline"
            >
              Astrologers
            </a>
            <a
              href="/admin/testimonials"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink lg:inline"
            >
              Testimonials
            </a>
            <a
              href="/admin/enquiries"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink lg:inline"
            >
              Enquiries
            </a>
            <a
              href="/"
              target="_blank"
              className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink md:inline"
            >
              View site
            </a>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container-x py-8">
        {children}
      </main>
    </>
  );
}
