import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { calculatePanchanga } from "@/lib/panchanga";
import { moonPhaseName as lunarName } from "@/lib/cosmic";
import { useAppUser } from "@/hooks/useAppUser";
import { RASHIS } from "@/lib/cosmic";
import { AppLink, BackLink, Screen } from "@/app/components/AppUI";

const RAHU: Record<number, string> = {
  0: "16:30 – 18:00",
  1: "07:30 – 09:00",
  2: "15:00 – 16:30",
  3: "12:00 – 13:30",
  4: "13:30 – 15:00",
  5: "10:30 – 12:00",
  6: "09:00 – 10:30",
};

export function DiscoverModuleScreen() {
  const { slug } = useParams();
  const { profile } = useAppUser();
  const p = useMemo(() => calculatePanchanga(new Date()), []);
  const rashi = profile.chart?.sunSign || RASHIS[new Date().getMonth() % 12];

  const body = contentFor(slug || "horoscope", { p, rashi, moon: lunarName() });

  return (
    <Screen>
      <BackLink to="/app/discover">← Discover</BackLink>
      <h1 className="app-title mt-3">{body.title}</h1>
      <div className="app-card-ivory mt-5 space-y-4 p-5">
        {body.paragraphs.map((para) => (
          <p key={para} className="text-sm leading-relaxed text-[#3a2a1c]">
            {para}
          </p>
        ))}
      </div>
      <AppLink to="/app/guruji" variant="ghost" block className="mt-5">
        Ask Guruji about this
      </AppLink>
    </Screen>
  );
}

function contentFor(
  slug: string,
  ctx: { p: ReturnType<typeof calculatePanchanga>; rashi: string; moon: string }
) {
  const map: Record<string, { title: string; paragraphs: string[] }> = {
    horoscope: {
      title: "Daily Horoscope",
      paragraphs: [
        `${ctx.rashi}: keep decisions measured and speech kind.`,
        `Moon in ${ctx.p.nakshatra} supports sincere work over display.`,
        "A short prayer at sunrise steadies the day's planetary weather.",
      ],
    },
    weekly: {
      title: "Weekly Horoscope",
      paragraphs: [
        "The week favours completion of unfinished tasks rather than new speculation.",
        "Midweek is better for conversations; weekend for rest and family ritual.",
      ],
    },
    monthly: {
      title: "Monthly Horoscope",
      paragraphs: [
        "This month asks for financial hygiene and honest relationships.",
        "Remedies work best when practiced daily, not only on crisis days.",
      ],
    },
    panchang: {
      title: "Panchang",
      paragraphs: [
        `Tithi: ${ctx.p.tithi}`,
        `Paksha: ${ctx.p.paksha}`,
        `Nakshatra: ${ctx.p.nakshatra}`,
        `Vara: ${ctx.p.vara} (${ctx.p.varaEn})`,
      ],
    },
    moon: {
      title: "Moon Phase",
      paragraphs: [`The sky holds a ${ctx.moon}.`, "Fasting, mantra, and water offerings are gentler than forceful remedies."],
    },
    nakshatra: {
      title: "Nakshatra",
      paragraphs: [`Today's nakshatra is ${ctx.p.nakshatra}.`, "Wear calm colours and avoid unnecessary arguments after sunset."],
    },
    "rahu-kalam": {
      title: "Rahu Kalam",
      paragraphs: [
        `Avoid new beginnings during ${RAHU[new Date().getDay()]}.`,
        "Existing work may continue; do not launch, sign, or travel if you can wait.",
      ],
    },
    choghadiya: {
      title: "Choghadiya",
      paragraphs: ["Amrit and Shubh windows are preferred for travel and contracts.", "Rog and Udveg are better reserved for routine tasks."],
    },
    muhurat: {
      title: "Muhurat",
      paragraphs: [
        "For personalised muhurat, share birth details with Guruji.",
        "A general rule: sunrise puja, avoid Rahu Kalam, prefer waxing moon for beginnings.",
      ],
    },
    compatibility: {
      title: "Compatibility",
      paragraphs: ["Guna milan is a map, not a verdict.", "Venus, the 7th house, and current dasha often matter more than a single score."],
    },
    remedies: {
      title: "Remedies",
      paragraphs: ["Light a diya at dusk, offer water to the Sun, and keep speech clean.", "Homams and gemstones should follow a personal chart reading."],
    },
    mantras: {
      title: "Mantras",
      paragraphs: ["Gayatri at sunrise. Mahamrityunjaya when fear rises. A simple Om Namah Shivaya when the mind is restless."],
    },
    articles: {
      title: "Articles",
      paragraphs: ["Read slowly. Jyotisha is a language of time, not a headline.", "Start with your lagna, then moon, then current dasha."],
    },
  };
  return map[slug] || { title: "Discover", paragraphs: ["This module will continue to grow with the CMS."] };
}
