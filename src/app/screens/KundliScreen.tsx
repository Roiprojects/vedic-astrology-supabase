import { useMemo, useState } from "react";
import { useAppUser } from "@/hooks/useAppUser";
import { RASHIS } from "@/lib/cosmic";
import { NAKSHATRAS } from "@/lib/panchanga";
import { AppButton, AppLink, Chip, HScroll, IconButton, IconLink, Screen } from "@/app/components/AppUI";
import { Download, Share2 } from "lucide-react";

const TABS = ["Overview", "Lagna", "Planets", "Houses", "Nakshatra", "Dasha", "Yogas", "Doshas", "Predictions", "Remedies", "Reports"] as const;

export function KundliScreen() {
  const { profile } = useAppUser();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [zoom, setZoom] = useState(1);
  const chart = profile.chart;

  const houses = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        house: i + 1,
        sign: RASHIS[(RASHIS.indexOf((chart?.ascendant as (typeof RASHIS)[number]) || RASHIS[0]) + i) % 12],
      })),
    [chart]
  );

  async function share() {
    const text = `My Kundli — Sun ${chart?.sunSign}, Moon ${chart?.moonSign}, Lagna ${chart?.ascendant}, Nakshatra ${chart?.nakshatra}`;
    if (navigator.share) await navigator.share({ title: "My Kundli", text });
  }

  return (
    <Screen>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="app-kicker">Birth chart</p>
          <h1 className="app-title">My Kundli</h1>
          <p className="app-sub truncate">{profile.birth?.name || profile.name || "Your chart"}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <IconButton onClick={() => void share()} aria-label="Share">
            <Share2 className="h-4 w-4" />
          </IconButton>
          <IconLink to="/birth-chart-pdf" aria-label="Download PDF">
            <Download className="h-4 w-4" />
          </IconLink>
        </div>
      </div>

      <div className="app-card mt-4 overflow-hidden p-4">
        <div
          className="grid grid-cols-4 gap-1 text-center text-[0.65rem]"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        >
          {houses.map((h) => (
            <div key={h.house} className="aspect-square rounded-xl border border-[#D6AE57]/20 p-1">
              <p className="text-[#D6AE57]">{h.house}</p>
              <p className="text-[#FFF9EE]">{h.sign.split(" ")[0]}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <AppButton variant="ghost" className="app-btn-sm" onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}>
          Zoom +
        </AppButton>
        <AppButton variant="ghost" className="app-btn-sm" onClick={() => setZoom((z) => Math.max(0.8, z - 0.1))}>
          Zoom −
        </AppButton>
      </div>

      <HScroll className="mt-4">
        {TABS.map((t) => (
          <Chip key={t} active={t === tab} onClick={() => setTab(t)}>
            {t}
          </Chip>
        ))}
      </HScroll>

      <div className="app-card-ivory mt-4 p-5 text-sm leading-relaxed">
        {tab === "Overview" && (
          <p>
            Sun {chart?.sunSign || "—"}. Moon {chart?.moonSign || "—"}. Lagna {chart?.ascendant || "—"}. Nakshatra{" "}
            {chart?.nakshatra || NAKSHATRAS[0]}.
          </p>
        )}
        {tab === "Lagna" && <p>Lagna lord: {chart?.lagnaLord || "—"}. The ascendant colours how the world first meets you.</p>}
        {tab === "Planets" && <p>Rashi lord {chart?.rashiLord}. A full planetary longitude table is prepared in the PDF report.</p>}
        {tab === "Houses" && <p>Twelve bhavas from the lagna. Expand any house during a live consultation for dasha overlays.</p>}
        {tab === "Nakshatra" && <p>{chart?.nakshatra}. The lunar mansion shapes mind and timing.</p>}
        {tab === "Dasha" && (
          <p>Vimshottari dasha requires exact birth time. Order a report or speak with Guruji for the current mahadasha.</p>
        )}
        {tab === "Yogas" && <p>Yogas are confirmed only after house-lord combinations are verified on the birth chart PDF.</p>}
        {tab === "Doshas" && (
          <p>Manglik, Kaal Sarp, and Pitra indications are reviewed personally — never from a single app score.</p>
        )}
        {tab === "Predictions" && <p>{chart?.guidance}</p>}
        {tab === "Remedies" && (
          <p>Sunrise water offering, Saturday oil lamp if Saturn is heavy, and a homam only when advised.</p>
        )}
        {tab === "Reports" && (
          <p>
            Preserve the existing Birth Chart PDF workflow.{" "}
            <AppLink to="/birth-chart-pdf" variant="ghost" className="app-btn-sm mt-3 w-full">
              Order report
            </AppLink>
          </p>
        )}
      </div>

      <AppLink to="/birth-chart-pdf" block className="mt-4">
        Order detailed kundli report
      </AppLink>
    </Screen>
  );
}
