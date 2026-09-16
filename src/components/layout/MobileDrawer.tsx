import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

const CONSULTATION_ITEMS = [
  { label: "Love & Relationship", href: "/services/love-relationship-problems" },
  { label: "Marriage & Delay Issues", href: "/services/marriage-delay-divorce-issues" },
  { label: "Career & Job Problems", href: "/services/career-confusion-job-problems" },
  { label: "Jataka Matching", href: "/services/jataka-matching-kundali-compatibility" },
  { label: "Janna Jataka (Full Chart)", href: "/services/janna-jataka-comprehensive-birth-chart" },
  { label: "Rahu & Kuja Dosha", href: "/services/rahu-kuja-dosha-analysis" },
  { label: "Pitra Dosha Relief", href: "/services/pitra-dosha-rahu-dasha-relief" },
  { label: "Health & Wellness", href: "/services/health-wellness-astrology" },
  { label: "Financial Prosperity", href: "/services/financial-instability-debt-problems" },
  { label: "Gemstone Guidance", href: "/services/gemstone-recommendation" },
  { label: "Black Magic Removal", href: "/services/black-magic-removal" },
];

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { pathname } = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Top-level nav items (non-Services)
  const topLinks = mainNav.filter((item) => item.label !== "Services");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-overlay/95 backdrop-blur-xl" />
          <motion.div
            className="relative flex h-full flex-col"
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container-x flex h-16 items-center justify-between gold-hairline">
              <BrandLogo compact size={40} />
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-gold-light"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="container-x flex-1 overflow-y-auto py-6">
              <ul className="space-y-1">
                {/* Home & other top links before Services */}
                {topLinks.slice(0, 2).map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i + 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium text-ink transition-colors hover:bg-[#b67a1b]/[0.04]"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}

                {/* Services — expandable */}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 }}
                >
                  <button
                    type="button"
                    onClick={() => setServicesOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium text-ink transition-colors hover:bg-[#b67a1b]/[0.04]"
                  >
                    Services
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 text-gold transition-transform duration-200",
                        servicesOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {servicesOpen && (
                    <div className="mt-1 ml-3 space-y-0.5 rounded-2xl border border-gold/15 bg-[#b67a1b]/[0.03] p-3">
                      <p className="px-3 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-gold">
                        Astrology Consultations
                      </p>
                      {CONSULTATION_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={onClose}
                          className="block rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-[#b67a1b]/[0.06] hover:text-ink"
                        >
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-gold/15 pt-2 mt-2">
                        <p className="px-3 pb-1 text-[0.6rem] font-bold uppercase tracking-widest text-gold">
                          Other Services
                        </p>
                        <Link to="/homams" onClick={onClose} className="block rounded-xl px-3 py-2 text-sm text-muted hover:bg-[#b67a1b]/[0.06] hover:text-ink">Sacred Homams</Link>
                        <Link to="/birth-chart-pdf" onClick={onClose} className="block rounded-xl px-3 py-2 text-sm text-muted hover:bg-[#b67a1b]/[0.06] hover:text-ink">Birth Chart PDF</Link>
                        <Link to="/chat-with-guruji" onClick={onClose} className="block rounded-xl px-3 py-2 text-sm text-muted hover:bg-[#b67a1b]/[0.06] hover:text-ink">Chat with Guruji</Link>
                        <Link to="/palm-reading" onClick={onClose} className="block rounded-xl px-3 py-2 text-sm text-muted hover:bg-[#b67a1b]/[0.06] hover:text-ink">Instant Palm Reader</Link>
                      </div>
                    </div>
                  )}
                </motion.li>

                {/* Remaining links */}
                {topLinks.slice(2).map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * (i + 3) + 0.1 }}
                  >
                    <Link
                      to={link.href}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg font-medium text-ink transition-colors hover:bg-[#b67a1b]/[0.04]"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="container-x flex flex-col gap-3 border-t border-gold/20 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <Button href="/contact-us" variant="primary" size="lg" onClick={onClose}>
                Book Consultation
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
