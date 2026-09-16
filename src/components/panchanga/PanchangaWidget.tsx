import { useMemo } from "react";
import { CalendarDays, Moon, Star, Sun } from "lucide-react";
import { calculatePanchanga, getUpcomingFestival, getTodayFestival } from "@/lib/panchanga";

interface ItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}

function PanchangaItem({ icon: Icon, label, value, sub }: ItemProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-[#c8933a]/25 bg-[#fff8ec]/80 px-3.5 py-3 shadow-[0_2px_8px_-4px_rgba(140,70,10,0.1)]">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-[#a8501a]" />
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#9a6030]">{label}</p>
      </div>
      <p className="font-serif text-base leading-snug text-[#35180d]">{value}</p>
      {sub && <p className="text-[0.68rem] text-[#7a5030]">{sub}</p>}
    </div>
  );
}

export function PanchangaWidget() {
  const today = useMemo(() => new Date(), []);
  const p = useMemo(() => calculatePanchanga(today), [today]);
  const festival = useMemo(() => getTodayFestival(today), [today]);
  const upcoming = useMemo(() => getUpcomingFestival(today), [today]);

  const displayDate = today.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  let upcomingText: string | undefined;
  if (upcoming) {
    const diff = Math.round((new Date(upcoming.date).getTime() - today.getTime()) / 86400000);
    if (diff === 0) upcomingText = "Today!";
    else if (diff === 1) upcomingText = "Tomorrow";
    else if (diff <= 7) upcomingText = `in ${diff} days`;
    else upcomingText = new Date(upcoming.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#c8933a]/40 bg-[#fdf3db] shadow-[0_8px_32px_-12px_rgba(140,70,10,0.22)]">
      {/* Header band */}
      <div className="border-b border-[#c8933a]/30 bg-gradient-to-r from-[#3b1224] to-[#5a1e32] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-[#ffd777]/60">Vedic Calendar</p>
            <h3 className="mt-0.5 font-serif text-lg text-[#fff8e8]">Today&apos;s Panchanga</h3>
          </div>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#e7b64c]/30 bg-[#e7b64c]/10">
            <CalendarDays className="h-5 w-5 text-[#e7b64c]" />
          </div>
        </div>
        <p className="mt-1.5 text-sm text-[#ffd777]/80">{displayDate}</p>
      </div>

      <div className="p-4">
        {/* Festival today */}
        {festival && (
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#b67a1b]/40 bg-gradient-to-r from-[#fff0c8] to-[#fde9b0] px-4 py-2.5">
            <span className="text-lg">✨</span>
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#9a5010]">Today&apos;s Festival</p>
              <p className="font-serif text-base text-[#35180d]">{festival.name}</p>
            </div>
          </div>
        )}

        {/* 2×2 grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <PanchangaItem
            icon={Moon}
            label="Tithi"
            value={p.tithi}
            sub={`${p.paksha} Paksha · ${p.tithiNumber}`}
          />
          <PanchangaItem
            icon={Star}
            label="Nakshatra"
            value={p.nakshatra}
            sub={`Nakshatra ${p.nakshatraNumber}`}
          />
          <PanchangaItem
            icon={Sun}
            label="Paksha"
            value={`${p.paksha} Paksha`}
            sub={p.paksha === "Shukla" ? "Bright fortnight" : "Dark fortnight"}
          />
          <PanchangaItem
            icon={CalendarDays}
            label="Vara"
            value={p.vara}
            sub={p.varaEn}
          />
        </div>

        {/* Upcoming festival */}
        {upcoming && !festival && (
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#c8933a]/30 bg-[#fff8ec]/80 px-4 py-3">
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#9a6030]">Next Festival</p>
              <p className="mt-0.5 font-serif text-base text-[#35180d]">{upcoming.name}</p>
            </div>
            <span className="rounded-full border border-[#b67a1b]/40 bg-[#fff0c8] px-3 py-1 text-xs font-semibold text-[#8a4010]">
              {upcomingText}
            </span>
          </div>
        )}

        {/* Footer */}
        <p className="mt-3 text-center text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#9a6030]/60">
          Lahiri ayanamsa · IST calculations
        </p>
      </div>
    </div>
  );
}
