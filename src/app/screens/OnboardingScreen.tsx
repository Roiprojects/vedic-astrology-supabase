import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppUser } from "@/hooks/useAppUser";
import type { BirthDetails } from "@/lib/cosmic";
import { hapticSuccess } from "@/lib/native";
import { AppButton, Field, Screen } from "@/app/components/AppUI";
import { cn } from "@/lib/utils";

const INTENTS = ["Love", "Marriage", "Career", "Money", "Family", "Self Discovery", "Spirituality"];

export function OnboardingScreen() {
  const { completeOnboarding, profile } = useAppUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BirthDetails>({
    name: profile.birth?.name || profile.name || "",
    dob: profile.birth?.dob || "",
    tob: profile.birth?.tob || "",
    pob: profile.birth?.pob || "",
    gender: profile.birth?.gender || "",
    language: profile.birth?.language || "English",
    intention: profile.birth?.intention || "",
  });

  async function finish() {
    await completeOnboarding(form);
    await hapticSuccess();
    navigate("/app", { replace: true });
  }

  return (
    <Screen className="flex min-h-full flex-col pb-8 pt-10">
      <p className="text-center text-[0.65rem] uppercase tracking-[0.3em] text-[#D6AE57]">
        Step {step + 1} of 3
      </p>
      <div className="mx-auto mt-4 grid h-1.5 w-40 grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("rounded-full", i <= step ? "bg-[#D6AE57]" : "bg-[#27205B]")}
          />
        ))}
      </div>

      {step === 0 && (
        <div className="mt-12 flex flex-1 flex-col text-center">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-[#D6AE57]/30 bg-gradient-to-b from-[#D6AE57]/15 to-transparent shadow-[0_0_40px_-10px_rgba(214,174,87,0.4)]">
            <img src="/logo-mark.png" alt="" className="h-14 w-14 rounded-full object-cover" />
          </div>
          <h1 className="font-serif text-4xl leading-tight">Welcome to your<br />cosmic journey</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#F3D899]/70">
            Ancient wisdom, held with the calm precision of a private observatory.
          </p>
          <div className="mt-auto pt-10">
            <AppButton block onClick={() => setStep(1)}>
              Begin your journey
            </AppButton>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="mt-8 flex flex-1 flex-col">
          <h1 className="font-serif text-3xl">What brings you here?</h1>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {INTENTS.map((intent, i) => (
              <button
                key={intent}
                type="button"
                onClick={() => setForm((f) => ({ ...f, intention: intent }))}
                className={cn(
                  "min-h-[4.25rem] rounded-2xl px-3 text-sm font-semibold transition-all duration-200 active:scale-95",
                  i === INTENTS.length - 1 && "col-span-2",
                  form.intention === intent
                    ? "bg-gradient-to-b from-[#F3D899] to-[#D6AE57] text-[#080A18] shadow-[0_4px_16px_-4px_rgba(214,174,87,0.55)]"
                    : "border border-[#D6AE57]/25 bg-[#11152F]/50 text-[#F3D899]"
                )}
              >
                {intent}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <AppButton block disabled={!form.intention} onClick={() => setStep(2)}>
              Continue
            </AppButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <form
          className="mt-8 flex flex-1 flex-col space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void finish();
          }}
        >
          <h1 className="font-serif text-3xl">Birth details</h1>
          <Field label="Name">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Date of birth">
            <input
              type="date"
              required
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
            />
          </Field>
          <Field label="Exact birth time">
            <input
              type="time"
              required
              value={form.tob}
              onChange={(e) => setForm({ ...form, tob: e.target.value })}
            />
          </Field>
          <Field label="Birth location">
            <input
              required
              value={form.pob}
              onChange={(e) => setForm({ ...form, pob: e.target.value })}
            />
          </Field>
          <Field label="Gender">
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Language">
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Kannada</option>
              <option>Tamil</option>
              <option>Telugu</option>
            </select>
          </Field>
          <div className="mt-auto pt-4">
            <AppButton type="submit" block>
              Generate my cosmic profile
            </AppButton>
          </div>
        </form>
      )}
    </Screen>
  );
}
