import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { astrologers } from "@/lib/astrologers";
import { useAppUser } from "@/hooks/useAppUser";
import { formatINR } from "@/lib/utils";
import { ScreenError } from "@/app/components/ScreenStates";
import { AppButton, BackLink, ButtonRow, Screen } from "@/app/components/AppUI";
import { RazorpayButton } from "@/components/payment/RazorpayButton";

export function AstrologerProfileScreen() {
  const { id } = useParams();
  const astrologer = astrologers.find((a) => a.id === id);
  const { toggleSavedAstrologer, savedAstrologers, addConsult, profile } = useAppUser();
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);

  if (!astrologer) {
    return (
      <ScreenError
        title="Astrologer unavailable"
        message="This profile could not be found."
        onRetry={() => navigate("/app/consult")}
      />
    );
  }

  const person = astrologer;
  const saved = savedAstrologers.includes(person.id);

  async function start(mode: "chat" | "call" | "book") {
    await addConsult({
      astrologerId: person.id,
      astrologerName: person.name,
      mode,
      status: person.online ? "connecting" : "unavailable",
    });
    navigate(`/app/session/${person.id}?mode=${mode}`);
  }

  return (
    <Screen>
      <BackLink to="/app/consult">← Consult</BackLink>
      <div className="relative mt-4 overflow-hidden rounded-[1.75rem] border border-[#D6AE57]/20 bg-gradient-to-br from-[#16193e] to-[#11152F] p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#D6AE57]/8 blur-3xl" />
        <div className="flex items-center gap-4">
          <img
            src={astrologer.image}
            alt=""
            className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-2 ring-[#D6AE57]/35 shadow-[0_8px_24px_-8px_rgba(214,174,87,0.3)]"
          />
          <div className="min-w-0">
            <h1 className="app-title truncate">{astrologer.name}</h1>
            <p className="app-sub">{astrologer.title}</p>
            <p className="mt-1.5 text-xs text-[#F3D899]/60">
              <span className="text-[#D6AE57]">{astrologer.rating} ★</span> · {astrologer.experienceYears} yrs · {astrologer.languages.join(", ")}
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-[#FFF9EE]/75">{astrologer.about}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {astrologer.specialties.map((s) => (
            <span key={s} className="app-chip pointer-events-none">
              {s}
            </span>
          ))}
        </div>
      </div>

      <ButtonRow className="mt-6">
        <AppButton onClick={() => void start("chat")} variant="primary">
          Chat
        </AppButton>
        <AppButton onClick={() => void start("call")} variant="ghost">
          Call
        </AppButton>
        <AppButton onClick={() => void start("book")} variant="ghost">
          Book
        </AppButton>
      </ButtonRow>

      <div className="app-card mt-5 p-4">
        <p className="app-kicker">Consultation payment</p>
        <p className="mt-1 font-serif text-2xl">{formatINR(astrologer.priceChat)}</p>
        {paid ? (
          <p className="mt-3 text-sm text-[#3ad67f]">Payment received. You can start the session.</p>
        ) : (
          <div className="mt-3">
            <RazorpayButton
              amount={astrologer.priceChat}
              serviceName={`${astrologer.name} consultation`}
              customerName={profile.name}
              onSuccess={() => setPaid(true)}
              label="Pay & continue"
              className="w-full from-[#F3D899] via-[#D6AE57] to-[#c1912f] text-[#080A18] shadow-none"
            />
          </div>
        )}
      </div>

      <ButtonRow className="mt-4">
        <AppButton onClick={() => void toggleSavedAstrologer(astrologer.id)} variant="ghost">
          {saved ? "Saved" : "Save"}
        </AppButton>
        <AppButton variant="ghost" onClick={() => navigate("/app/guruji")}>
          Ask Guruji
        </AppButton>
      </ButtonRow>
    </Screen>
  );
}
