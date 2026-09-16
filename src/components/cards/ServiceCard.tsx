import { ArrowRight, MessageCircleMore } from "lucide-react";
import type { Service } from "@/lib/data/types";
import { Button } from "@/components/ui/Button";
import { AskGurujiButton } from "@/components/ai/AskGurujiButton";
import { PriceBadge } from "@/components/ui/Badge";
import { VedicSymbol } from "@/components/icons/VedicSymbol";
import { getServiceSymbol } from "@/lib/presentation/vedic-symbols";
import { cn } from "@/lib/utils";
import { useConsultation } from "@/components/booking/ConsultationContext";

export function ServiceCard({ service }: { service: Service }) {
  const { openConsultation } = useConsultation();
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold/20 bg-surface/60 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[var(--shadow-glow-gold)]">
      {/* accent glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-70",
          service.gradient
        )}
      />

      {/* Service image */}
      {service.image && (
        <div className="relative h-44 w-full overflow-hidden rounded-t-3xl">
          <img
            src={service.image}
            alt={service.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0510]/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-3">
            <PriceBadge price={service.price} discountPrice={service.discountPrice} />
          </div>
        </div>
      )}

      <div className={cn("relative flex flex-1 flex-col", service.image ? "p-5" : "p-6")}>
        {!service.image && (
          <div className="flex items-start justify-between gap-3">
            <div
              className={cn(
                "grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-gradient-to-br text-gold-deep shadow-[inset_0_0_0_5px_rgba(193,145,47,0.08)]",
                service.gradient
              )}
              title={service.icon}
            >
              <VedicSymbol kind={getServiceSymbol(service.slug)} size="lg" strokeWidth={1.6} />
            </div>
            <PriceBadge price={service.price} discountPrice={service.discountPrice} />
          </div>
        )}

      <h3 className={cn("relative font-serif text-xl text-ink", service.image ? "" : "mt-5")}>
        <a
          href={`/services/${service.slug}`}
          className="after:absolute after:inset-0"
        >
          {service.title}
        </a>
      </h3>
      <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted">
        {service.shortDescription}
      </p>

        <div className="relative z-10 mt-6 grid gap-2 grid-cols-2">
          <Button
            variant="primary" size="md" className="w-full"
            onClick={() => openConsultation({
              slug: service.slug,
              title: service.title,
              price: service.price,
              discountPrice: service.discountPrice,
              duration: service.duration,
              icon: service.icon,
            })}
          >
            Book
            <ArrowRight className="h-4 w-4" />
          </Button>
          <AskGurujiButton
            serviceTitle={service.title}
            className="w-full justify-center rounded-xl border border-gold/40 bg-[#3d1822]/80 text-[#ffe2a1] text-xs h-10 px-3 hover:bg-[#52202f]"
          >
            <MessageCircleMore className="h-3.5 w-3.5" /> Ask Guruji
          </AskGurujiButton>
        </div>
      </div>

      {/* hover shine */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
      />
    </article>
  );
}
