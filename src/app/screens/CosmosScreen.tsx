import { motion, useReducedMotion } from "framer-motion";
import { useAppUser } from "@/hooks/useAppUser";
import { calculatePanchanga, getUpcomingFestival } from "@/lib/panchanga";
import { moonPhaseName } from "@/lib/cosmic";
import { AppLink, Screen } from "@/app/components/AppUI";

export function CosmosScreen() {
  const { profile, insights } = useAppUser();
  const reduce = useReducedMotion();
  const p = calculatePanchanga(new Date());
  const fest = getUpcomingFestival();

  return (
    <Screen className="relative overflow-hidden">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full border border-[#D6AE57]/20"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-28 h-40 w-40 -translate-x-1/2 rounded-full border border-[#F3D899]/15"
        animate={reduce ? undefined : { rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
      />

      <p className="relative text-center text-[0.65rem] uppercase tracking-[0.34em] text-[#D6AE57]">Observatory</p>
      <h1 className="relative mt-2 text-center font-serif text-4xl">Cosmos</h1>
      <p className="relative mx-auto mt-2 max-w-xs text-center text-sm text-[#F3D899]/70">
        A quieter sky than Home — planetary weather, personal influence, and the dates that matter.
      </p>

      <div className="relative mt-10 grid grid-cols-2 gap-3">
        <Card k="Daily energy" v={`${profile.chart?.dailyEnergy ?? 58}%`} />
        <Card k="Moon phase" v={moonPhaseName()} />
        <Card k="Personal influence" v={profile.chart ? `${profile.chart.moonSign} moon` : "Add birth details"} />
        <Card k="Nakshatra now" v={p.nakshatra} />
        <Card k="Upcoming muhurat" v={fest ? `${fest.name}` : "Sunrise rhythm"} wide />
        <Card k="Saved insights" v={`${insights.length} kept`} wide />
      </div>

      <section className="app-card relative mt-8 p-5">
        <h2 className="font-serif text-2xl">Cosmic timeline</h2>
        <ol className="mt-4 space-y-3 text-sm text-[#F3D899]/80">
          <li>Sunrise — water offering, set one intention.</li>
          <li>Rahu Kalam — pause new beginnings.</li>
          <li>Evening — review, not react.</li>
        </ol>
        <AppLink to="/app/discover/panchang" variant="ghost" block className="mt-4">
          Open Panchang
        </AppLink>
      </section>
    </Screen>
  );
}

function Card({ k, v, wide }: { k: string; v: string; wide?: boolean }) {
  return (
    <div className={`min-h-[5.5rem] rounded-3xl border border-[#D6AE57]/15 bg-[#080A18]/70 p-4 backdrop-blur-md ${wide ? "col-span-2" : ""}`}>
      <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#D6AE57]/80">{k}</p>
      <p className="mt-1 font-serif text-xl leading-snug">{v}</p>
    </div>
  );
}
