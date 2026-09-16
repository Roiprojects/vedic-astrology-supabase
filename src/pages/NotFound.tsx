import { Helmet } from "react-helmet-async";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { StarField } from "@/components/effects/StarField";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <StarField count={60} seed={99} />
      <div className="relative">
        <BrandLogo showText={false} size={72} />
        <Helmet>
          <title>404 — {siteConfig.name}</title>
          <meta name="description" content="Page not found." />
        </Helmet>
        <p className="mt-8 font-serif text-7xl text-gold-gradient">404</p>
        <h1 className="mt-2 font-serif text-2xl text-ink sm:text-3xl">
          This Path Isn&apos;t Written in the Stars
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          The page you&apos;re looking for could not be found. Let us guide you back.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" variant="primary" size="lg">
            Return Home
          </Button>
          <Button href="/services" variant="gold" size="lg">
            Explore Services
          </Button>
        </div>
        <a
          href="/contact-us"
          className="mt-6 inline-block text-sm text-faint underline-offset-4 hover:text-gold-light hover:underline"
        >
          Or contact Guruji for guidance →
        </a>
      </div>
    </main>
  );
}
