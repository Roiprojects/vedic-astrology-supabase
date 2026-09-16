import type { Testimonial } from "@/lib/data/types";
import { StarRating } from "@/components/ui/StarRating";
import { Quote } from "lucide-react";

const serviceLabels: Record<string, string> = {
  love: "Love & Relationship",
  marriage: "Marriage",
  career: "Career",
  finance: "Finance",
  homam: "Homam",
  "birth-chart": "Birth Chart",
  chat: "Chat Consultation",
};

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="relative flex h-full flex-col rounded-3xl border border-gold/20 bg-surface/60 p-6">
      <Quote className="absolute right-5 top-5 h-8 w-8 text-gold/15" />
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-saffron-deep font-serif text-lg font-semibold text-ink">
          {t.avatarInitial}
        </div>
        <div>
          <figcaption className="font-medium text-ink">{t.name}</figcaption>
          <p className="text-xs text-faint">{t.location}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <StarRating rating={t.rating} />
        <span className="rounded-full border border-gold/20 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-gold-light/80">
          {serviceLabels[t.serviceType] ?? t.serviceType}
        </span>
      </div>

      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted">
        &ldquo;{t.text}&rdquo;
      </blockquote>
    </figure>
  );
}
