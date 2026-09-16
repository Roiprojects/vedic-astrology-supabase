import { Mail, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { Container } from "@/components/ui/Container";
import { footerLinks, siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  const iconLink =
    "grid h-10 w-10 place-items-center rounded-full border border-gold/40 text-[#ffd777] transition-colors hover:border-gold hover:bg-gold/15";
  const link = "text-sm text-[#e9d6b3]/75 transition-colors hover:text-[#ffe1a0]";
  const heading = "font-display text-sm uppercase tracking-[0.2em] text-[#ffd777]";

  return (
    <footer className="relative overflow-hidden bg-[#2a121c] text-[#e9d6b3]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_60%_at_12%_-5%,rgba(217,100,28,0.16),transparent_58%),radial-gradient(55%_55%_at_92%_5%,rgba(193,145,47,0.12),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e0b34e]/60 to-transparent"
      />
      <Container className="relative py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:pr-6">
            <BrandLogo size={48} compact />
            <p className="mt-4 text-sm leading-relaxed text-[#e9d6b3]/70">
              {siteConfig.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={iconLink}
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={iconLink}
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href={`mailto:${siteConfig.email}`} aria-label="Email" className={iconLink}>
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className={heading}>Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.quick.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className={heading}>Services</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.services.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={link}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={heading}>Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#e9d6b3]/80">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#e0b34e]" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-[#ffe1a0]">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e0b34e]" />
                <span>{siteConfig.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 rounded-2xl border border-gold/20 bg-white/[0.03] p-5">
          <p className="text-xs leading-relaxed text-[#e9d6b3]/55">
            <span className="font-semibold text-[#e9d6b3]/80">Disclaimer: </span>
            {siteConfig.disclaimer}
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gold/15 pt-6 text-xs text-[#e9d6b3]/50 sm:flex-row">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center gap-4">
            {footerLinks.legal.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-[#ffe1a0]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
