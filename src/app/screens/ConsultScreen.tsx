import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { AppLink, ButtonRow, Chip, HScroll, Screen, ScreenTitle } from "@/app/components/AppUI";
import { EmptyState, Skeleton } from "@/app/components/ScreenStates";
import { cn } from "@/lib/utils";

type Astrologer = {
  id: number;
  slug: string;
  name: string;
  title: string;
  image?: string;
  verified: boolean;
  online: boolean;
  rating: number;
  reviews: number;
  experience_years: number;
  languages: string[];
  specialties: string[];
  price_chat: number;
  price_call: number;
  about: string;
};

const CATEGORIES = [
  "Vedic Astrology","KP Astrology","Numerology","Tarot","Vastu",
  "Palmistry","Relationship","Marriage","Career","Finance",
];

function filter(list: Astrologer[], q: string, specialty: string, language: string, onlineOnly: boolean, sort: string) {
  let out = list.filter((a) => {
    if (onlineOnly && !a.online) return false;
    if (specialty !== "all" && !a.specialties.includes(specialty)) return false;
    if (language !== "all" && !a.languages.includes(language)) return false;
    if (q) {
      const lq = q.toLowerCase();
      if (
        !a.name.toLowerCase().includes(lq) &&
        !a.specialties.join(" ").toLowerCase().includes(lq) &&
        !a.languages.join(" ").toLowerCase().includes(lq)
      ) return false;
    }
    return true;
  });
  if (sort === "price") out = [...out].sort((a, b) => a.price_chat - b.price_chat);
  else if (sort === "experience") out = [...out].sort((a, b) => b.experience_years - a.experience_years);
  else out = [...out].sort((a, b) => b.rating - a.rating);
  return out;
}

export function ConsultScreen() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [language, setLanguage] = useState("all");
  const [sort, setSort] = useState<"rating" | "price" | "experience">("rating");
  const [onlineOnly, setOnlineOnly] = useState(false);

  useEffect(() => {
    apiFetch("/api/public/astrologers")
      .then((r) => r.json())
      .then((d) => setAstrologers(d.astrologers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const list = useMemo(
    () => filter(astrologers, query, specialty, language, onlineOnly, sort),
    [astrologers, query, specialty, language, onlineOnly, sort]
  );

  return (
    <Screen>
      <ScreenTitle
        kicker="Verified guides"
        title="Consult"
        subtitle="Chat, call, or book a private Vedic reading."
      />

      <label className="mt-5 flex min-h-12 items-center gap-2 rounded-2xl border border-[#D6AE57]/25 bg-[#11152F] px-3">
        <Search className="h-4 w-4 shrink-0 text-[#D6AE57]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, language, specialty"
          className="h-12 w-full bg-transparent text-sm text-[#FFF9EE] outline-none placeholder:text-[#F3D899]/40"
        />
      </label>

      <HScroll className="mt-3">
        <Chip active={specialty === "all"} onClick={() => setSpecialty("all")}>All</Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={specialty === c} onClick={() => setSpecialty(c)}>{c}</Chip>
        ))}
      </HScroll>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="app-input app-input-select !mt-0 h-11 min-h-11 px-3 text-xs"
        >
          <option value="rating">Rating</option>
          <option value="price">Price</option>
          <option value="experience">Experience</option>
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="app-input app-input-select !mt-0 h-11 min-h-11 px-3 text-xs"
        >
          <option value="all">Language</option>
          <option>English</option><option>Hindi</option><option>Kannada</option>
          <option>Tamil</option><option>Telugu</option><option>Malayalam</option><option>Marathi</option>
        </select>
        <button
          type="button"
          onClick={() => setOnlineOnly((v) => !v)}
          className={cn("app-chip h-11 w-full justify-center", onlineOnly && "app-chip-active")}
        >
          Online
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {loading && [1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        {!loading && list.length === 0 && (
          <EmptyState
            title={astrologers.length === 0 ? "No astrologers yet" : "No matches"}
            message={astrologers.length === 0 ? "Astrologers will appear here once added from the admin panel." : "Try another language, specialty, or turn off Online."}
          />
        )}
        {list.map((a) => (
          <article key={a.slug} className="app-card overflow-hidden">
            <Link to={`/app/consult/${a.slug}`} className="flex gap-3 p-4">
              <span className="relative shrink-0">
                {a.image ? (
                  <img src={a.image} alt="" className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#D6AE57]/20" />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#D6AE57]/10 font-serif text-2xl text-[#D6AE57] ring-2 ring-[#D6AE57]/20">
                    {a.name.slice(0, 1)}
                  </span>
                )}
                <span
                  className={cn(
                    "absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full ring-2 ring-[#11152F]",
                    a.online ? "va-pulse-online bg-[#3ad67f]" : "bg-[#6a5340]"
                  )}
                />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-semibold text-[#FFF9EE]">
                    {a.name} {a.verified && <span className="text-[#D6AE57] text-xs">✓</span>}
                  </p>
                  <p className="shrink-0 font-semibold text-sm text-[#D6AE57]">
                    ₹{a.price_chat}<span className="text-[0.6rem] font-normal text-[#F3D899]/50">/min</span>
                  </p>
                </div>
                <p className="mt-0.5 text-xs text-[#F3D899]/65">
                  {a.title} · {a.experience_years} yrs · <span className="text-[#F3D899]/80">{a.rating} ★</span>
                </p>
                <p className="mt-1.5 truncate text-xs text-[#F3D899]/55">{a.specialties.join(" · ")}</p>
                <p className="truncate text-[0.67rem] text-[#F3D899]/40">{a.languages.join(", ")}</p>
              </div>
            </Link>
            <div className="border-t border-[#D6AE57]/10 px-4 py-3">
              <ButtonRow>
                <AppLink to={`/app/session/${a.slug}?mode=chat`} variant="primary" className="app-btn-sm">Chat</AppLink>
                <AppLink to={`/app/session/${a.slug}?mode=call`} variant="ghost" className="app-btn-sm">Call</AppLink>
                <AppLink to={`/app/consult/${a.slug}`} variant="ghost" className="app-btn-sm">Book</AppLink>
              </ButtonRow>
            </div>
          </article>
        ))}
      </div>
    </Screen>
  );
}
