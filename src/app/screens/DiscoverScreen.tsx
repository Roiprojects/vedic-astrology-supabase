import { Link } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Clock,
  Flame,
  Heart,
  Moon,
  Sparkles,
  Star,
  Sun,
} from "lucide-react";
import { Screen, ScreenTitle } from "@/app/components/AppUI";
import { cn } from "@/lib/utils";

const MODULES = [
  { slug: "horoscope", title: "Daily Horoscope", icon: Sun, blurb: "Rashi guidance for today" },
  { slug: "weekly", title: "Weekly Horoscope", icon: Calendar, blurb: "Seven-day planetary weather" },
  { slug: "monthly", title: "Monthly Horoscope", icon: Star, blurb: "Month-ahead themes" },
  { slug: "panchang", title: "Panchang", icon: BookOpen, blurb: "Tithi, vara, yoga, karana" },
  { slug: "moon", title: "Moon Phase", icon: Moon, blurb: "Lunar mood and rituals" },
  { slug: "nakshatra", title: "Nakshatra", icon: Sparkles, blurb: "Today's lunar mansion" },
  { slug: "rahu-kalam", title: "Rahu Kalam", icon: Clock, blurb: "Inauspicious windows" },
  { slug: "choghadiya", title: "Choghadiya", icon: Clock, blurb: "Day and night muhurat slots" },
  { slug: "muhurat", title: "Muhurat", icon: Flame, blurb: "Auspicious timings" },
  { slug: "compatibility", title: "Compatibility", icon: Heart, blurb: "Guna matching primer" },
  { slug: "remedies", title: "Remedies", icon: Flame, blurb: "Mantra, daan, homam" },
  { slug: "mantras", title: "Mantras", icon: Sparkles, blurb: "Sacred recitations" },
  { slug: "articles", title: "Articles", icon: BookOpen, blurb: "Guided reading" },
];

export function DiscoverScreen() {
  return (
    <Screen>
      <ScreenTitle
        kicker="Library"
        title="Discover"
        subtitle="Vedic timing, ritual, and insight — a private observatory."
      />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {MODULES.map((m, i) => (
          <Link
            key={m.slug}
            to={`/app/discover/${m.slug}`}
            className={cn("app-discover-card", i === MODULES.length - 1 && "col-span-2")}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#D6AE57]/15">
              <m.icon className="h-4 w-4 text-[#8a6a22]" />
            </span>
            <p className="mt-3 font-serif text-lg leading-tight">{m.title}</p>
            <p className="mt-1 text-xs leading-snug text-[#6a5340]">{m.blurb}</p>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
