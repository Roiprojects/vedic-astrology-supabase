import { ArrowRight, Flame, MessageCircleMore } from "lucide-react";
import type { Homam } from "@/lib/data/types";
import { Button } from "@/components/ui/Button";
import { AskGurujiButton } from "@/components/ai/AskGurujiButton";
import { VedicSymbol } from "@/components/icons/VedicSymbol";
import { getHomamSymbol, getHomamImage } from "@/lib/presentation/vedic-symbols";
import { cn } from "@/lib/utils";

export function HomamCard({ homam }: { homam: Homam }) {
  const image = getHomamImage(homam.slug);
  const symbol = getHomamSymbol(homam.slug);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-[#c9993a]/30 bg-gradient-to-b from-[#3b172a] to-[#28101e] shadow-[0_24px_60px_-38px_rgba(20,5,12,0.9)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#e7b64c]/60 hover:shadow-[0_36px_82px_-34px_rgba(191,122,23,0.5)]">
      {/* Banner */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={homam.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
          />
        ) : (
          <div className={cn("absolute inset-0 bg-gradient-to-br", homam.gradient)}>
            {/* warm light source */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_30%_22%,rgba(255,238,188,0.7),transparent_55%)]"
            />
            {/* faint sunburst behind the medallion */}
            <div
              aria-hidden
              className="absolute inset-0 [background:repeating-conic-gradient(from_0deg_at_50%_46%,rgba(255,224,158,0.16)_0_1.6deg,transparent_1.6deg_15deg)] [mask-image:radial-gradient(circle_at_50%_46%,black,transparent_60%)]"
            />
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid h-24 w-24 place-items-center rounded-full border border-[#ffe0a0]/50 bg-[#331528]/45 text-[#ffe9c0] shadow-[0_10px_30px_-8px_rgba(20,5,8,0.6)] backdrop-blur-[2px] transition-transform duration-300 group-hover:scale-105">
                <VedicSymbol kind={symbol} size="xl" strokeWidth={1.5} />
              </span>
            </div>
          </div>
        )}

        {/* Wash so the banner fuses into the card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#28101e] via-[#28101e]/35 to-transparent" />

        {/* Symbol medallion — only when there's a photo (avoids double symbol) */}
        {image && (
          <span className="absolute bottom-3 left-3 grid h-12 w-12 place-items-center rounded-2xl border border-[#e7b64c]/55 bg-[#28101e]/85 text-[#ffe6a8] shadow-lg backdrop-blur">
            <VedicSymbol kind={symbol} size="md" strokeWidth={1.6} />
          </span>
        )}

        {/* hover shine */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl text-[#fff2d0]">
          <a href={`/homams/${homam.slug}`} className="after:absolute after:inset-0">
            {homam.name}
          </a>
        </h3>
        <span
          aria-hidden
          className="mt-3 block h-px w-12 bg-gradient-to-r from-[#e7b64c]/70 to-transparent"
        />
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-[#ecdcbc]/75">
          <Flame className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e7b64c]" />
          {homam.shortBenefit}
        </p>

        <div className="relative z-10 mt-auto pt-5 grid gap-2 grid-cols-2">
          <Button href={`/homams/${homam.slug}`} variant="primary" size="md" className="w-full">
            Book
            <ArrowRight className="h-4 w-4" />
          </Button>
          <AskGurujiButton
            serviceTitle={homam.name}
            className="w-full justify-center rounded-xl border border-gold/40 bg-[#3d1822]/80 text-[#ffe2a1] text-xs h-10 px-3 hover:bg-[#52202f]"
          >
            <MessageCircleMore className="h-3.5 w-3.5" /> Ask Guruji
          </AskGurujiButton>
        </div>
      </div>
    </article>
  );
}
