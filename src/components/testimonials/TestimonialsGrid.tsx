import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import type { Testimonial } from "@/lib/data/types";
import { testimonialFilters } from "@/lib/data/testimonials";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { cn } from "@/lib/utils";

export function TestimonialsGrid({ items }: { items: Testimonial[] }) {
  const [active, setActive] = useState<string>("all");
  const prefersReducedMotion = useReducedMotion();

  const filtered =
    active === "all" ? items : items.filter((t) => t.serviceType === active);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-2">
        {testimonialFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActive(f.key)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === f.key
                ? "border-gold bg-gold/15 text-gold-light"
                : "border-gold/20 text-muted hover:border-gold/40 hover:text-ink"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
            >
              <TestimonialCard t={t} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-muted">
          No testimonials in this category yet.
        </p>
      )}
    </div>
  );
}
