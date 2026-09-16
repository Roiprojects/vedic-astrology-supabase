import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { astrologers } from "@/lib/astrologers";
import { useAppUser } from "@/hooks/useAppUser";
import { hapticSuccess } from "@/lib/native";
import { AppButton, AppLink, Screen } from "@/app/components/AppUI";

type Phase = "connecting" | "waiting" | "unavailable" | "confirmed";

export function ConsultationSessionScreen() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const mode = (params.get("mode") as "chat" | "call" | "book") || "chat";
  const astrologer = astrologers.find((a) => a.id === id);
  const { addConsult } = useAppUser();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>(astrologer?.online ? "connecting" : "unavailable");

  useEffect(() => {
    if (!astrologer) return;
    if (!astrologer.online) {
      setPhase("unavailable");
      return;
    }
    const t1 = window.setTimeout(() => setPhase("waiting"), 900);
    const t2 = window.setTimeout(() => {
      setPhase("confirmed");
      void hapticSuccess();
      void addConsult({
        astrologerId: astrologer.id,
        astrologerName: astrologer.name,
        mode,
        status: "confirmed",
      });
    }, 2200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [astrologer, mode, addConsult]);

  const copy = useMemo(() => {
    if (phase === "connecting") return { title: "Connecting", body: `Opening a ${mode} channel with ${astrologer?.name}.` };
    if (phase === "waiting")
      return { title: "Waiting", body: "Live consultation rooms will attach here when the realtime backend is enabled." };
    if (phase === "unavailable")
      return { title: "Currently unavailable", body: "This astrologer is offline. Book a slot or ask Guruji for guidance." };
    return { title: "Booking confirmed", body: "Your request is recorded. Guruji’s team will reach you with the session details." };
  }, [phase, mode, astrologer?.name]);

  if (!astrologer) return null;

  return (
    <Screen className="flex min-h-full flex-col items-center justify-center text-center">
      <div className="mx-auto h-20 w-20 rounded-full border border-[#D6AE57]/40 bg-[#11152F] p-1">
        <img src={astrologer.image} alt="" className="h-full w-full rounded-full object-cover" />
      </div>
      <p className="mt-5 font-display text-xs tracking-[0.28em] text-[#D6AE57]">{copy.title}</p>
      <h1 className="mt-2 font-serif text-3xl">{astrologer.name}</h1>
      <p className="mt-3 max-w-sm text-sm text-[#F3D899]/75">{copy.body}</p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        {phase === "unavailable" && (
          <AppLink to="/app/guruji" block>
            Ask Guruji for next slot
          </AppLink>
        )}
        {phase === "confirmed" && (
          <AppLink to="/app/guruji" block>
            Continue with Ask Guruji
          </AppLink>
        )}
        <AppButton variant="ghost" block onClick={() => navigate(-1)}>
          Back
        </AppButton>
      </div>
    </Screen>
  );
}
