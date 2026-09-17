import { useEffect, useRef, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/Button";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

const CONSULTATION_ITEMS = [
  { label: "Love & Relationship", href: "/services/love-relationship-problems", icon: "💖", desc: "Compatibility & harmony guidance" },
  { label: "Marriage & Delay Issues", href: "/services/marriage-delay-divorce-issues", icon: "💍", desc: "Manglik, delay & divorce guidance" },
  { label: "Career & Job Problems", href: "/services/career-confusion-job-problems", icon: "💼", desc: "Job change, growth & confusion" },
  { label: "Jataka Matching", href: "/services/jataka-matching-kundali-compatibility", icon: "🔗", desc: "Kundali compatibility analysis" },
  { label: "Janna Jataka (Full Chart)", href: "/services/janna-jataka-comprehensive-birth-chart", icon: "📜", desc: "Complete birth chart — ₹3000" },
  { label: "Rahu & Kuja Dosha", href: "/services/rahu-kuja-dosha-analysis", icon: "🌑", desc: "Dosha analysis & remedies" },
  { label: "Pitra Dosha Relief", href: "/services/pitra-dosha-rahu-dasha-relief", icon: "🙏", desc: "Ancestral dosha & Rahu dasha" },
  { label: "Health & Wellness", href: "/services/health-wellness-astrology", icon: "🌿", desc: "Health, recovery & well-being" },
  { label: "Financial Prosperity", href: "/services/financial-instability-debt-problems", icon: "💰", desc: "Wealth, debt & finance guidance" },
];

const OTHER_SERVICES = [
  { label: "Sacred Homams", href: "/homams", icon: "🔥", desc: "18 Vedic fire rituals" },
  { label: "Birth Chart PDF", href: "/birth-chart-pdf", icon: "📄", desc: "Detailed kundli report — 48hr" },
  { label: "Chat with Guruji", href: "/chat-with-guruji", icon: "💬", desc: "3 free questions, then personal" },
  { label: "Instant Palm Reader", href: "/palm-reading", icon: "🖐", desc: "Upload photo, get reading instantly" },
  { label: "Gemstone Guidance", href: "/services/gemstone-recommendation", icon: "💎", desc: "Right stone for your chart" },
  { label: "Black Magic Removal", href: "/services/black-magic-removal", icon: "🛡️", desc: "Protection & removal — ₹5000" },
];

function ServicesMegaMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLLIElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <li
      ref={triggerRef}
      className="relative"
      onMouseEnter={() => {
        if (leaveTimer.current) clearTimeout(leaveTimer.current);
        setOpen(true);
      }}
      onMouseLeave={() => {
        leaveTimer.current = setTimeout(() => setOpen(false), 200);
      }}
    >
      <NavLink
        to="/services"
        className={({ isActive: active }) =>
          cn(
            "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            (active || false)
              ? "text-gold-light"
              : "text-muted hover:text-ink"
          )
        }
        onClick={(e) => {
          // Don't navigate; let the mega menu handle clicks
          e.preventDefault();
          setOpen((o) => !o);
        }}
      >
        Services
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </NavLink>

      {open && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full w-[720px] max-w-[calc(100vw-2rem)] pt-3 opacity-100"
          onMouseEnter={() => {
            if (leaveTimer.current) clearTimeout(leaveTimer.current);
          }}
          onMouseLeave={() => {
            leaveTimer.current = setTimeout(() => setOpen(false), 200);
          }}
        >
          <div className="glass-card overflow-hidden rounded-2xl shadow-xl">
            <div className="grid grid-cols-2 divide-x divide-gold/15">
              {/* Left — Astrology Consultations */}
              <div className="p-4">
                <p className="mb-3 px-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-gold">
                  Astrology Consultations
                </p>
                <div className="space-y-0.5">
                  {CONSULTATION_ITEMS.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-start gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-[#b67a1b]/[0.06]",
                          isActive && "text-gold-light"
                        )
                      }
                    >
                      <span className="mt-0.5 text-base leading-none">{item.icon}</span>
                      <span>
                        <span className="block text-[0.8rem] font-medium leading-snug text-ink">
                          {item.label}
                        </span>
                        <span className="block text-[0.68rem] leading-snug text-faint">
                          {item.desc}
                        </span>
                      </span>
                    </NavLink>
                  ))}
                </div>
                <div className="mt-3 border-t border-gold/15 pt-3">
                  <NavLink
                    to="/services"
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-2 text-[0.75rem] font-semibold text-gold-light hover:bg-[#b67a1b]/[0.06]"
                  >
                    View all services →
                  </NavLink>
                </div>
              </div>

              {/* Right — Other Services */}
              <div className="p-4">
                <p className="mb-3 px-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-gold">
                  Other Services
                </p>
                <div className="space-y-0.5">
                  {OTHER_SERVICES.map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-start gap-2.5 rounded-xl px-3 py-2 transition-colors hover:bg-[#b67a1b]/[0.06]",
                          isActive && "text-gold-light"
                        )
                      }
                    >
                      <span className="mt-0.5 text-base leading-none">{item.icon}</span>
                      <span>
                        <span className="block text-[0.8rem] font-medium leading-snug text-ink">
                          {item.label}
                        </span>
                        <span className="block text-[0.68rem] leading-snug text-faint">
                          {item.desc}
                        </span>
                      </span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={cn(
            "container-x transition-all duration-300",
            scrolled ? "pt-2" : "pt-3 sm:pt-4"
          )}
        >
          <nav
            className={cn(
              "flex h-14 items-center justify-between gap-4 rounded-2xl px-3 transition-all duration-300 sm:px-5 lg:h-16",
              scrolled
                ? "border border-gold/30 bg-overlay/90 backdrop-blur-xl shadow-[0_18px_44px_-26px_rgba(74,15,26,0.28)]"
                : "border border-gold/20 bg-overlay/70 backdrop-blur-lg shadow-[0_14px_40px_-28px_rgba(74,15,26,0.20)]"
            )}
          >
            <BrandLogo compact />

            {/* Desktop nav */}
            <ul className="hidden items-center gap-1 lg:flex">
              {mainNav.map((item) => (
                <li key={item.href} className="group relative">
                  {item.label === "Services" ? (
                    <ServicesMegaMenu />
                  ) : item.children ? (
                    <>
                      <NavLink
                        to={item.href}
                        className={({ isActive: active }) =>
                          cn(
                            "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                            active ? "text-gold-light" : "text-muted hover:text-ink"
                          )
                        }
                      >
                        {item.label}
                        {item.children && (
                          <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
                        )}
                      </NavLink>
                      <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="glass-card overflow-hidden rounded-2xl p-2">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.href}
                              to={child.href}
                              className={({ isActive: active }) =>
                                cn(
                                  "block rounded-xl px-3 py-2.5 transition-colors hover:bg-[#b67a1b]/[0.04]",
                                  active && "text-gold-light"
                                )
                              }
                            >
                              <span className="block text-sm font-medium text-ink">
                                {child.label}
                              </span>
                              {child.description && (
                                <span className="mt-0.5 block text-xs text-faint">
                                  {child.description}
                                </span>
                              )}
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <NavLink
                      to={item.href}
                      className={({ isActive: active }) =>
                        cn(
                          "flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                          active ? "text-gold-light" : "text-muted hover:text-ink"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2 lg:flex">
              <Button href="/contact-us" variant="primary" size="sm">
                Book Now
              </Button>
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-gold-light"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
