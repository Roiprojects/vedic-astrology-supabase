import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { AppButton, Screen } from "@/app/components/AppUI";
import { useAppUser } from "@/hooks/useAppUser";

type HomamItem = {
  slug: string;
  name: string;
  icon: string;
  price: number;
  short_benefit: string;
  active: boolean;
};

type BookingState = "idle" | "submitting" | "success" | "error";

interface HomamForm {
  homamSlug: string;
  name: string;
  email: string;
  dob: string;
  nakshatra: string;
  preferredDate: string;
  message: string;
}

const EMPTY: HomamForm = {
  homamSlug: "",
  name: "",
  email: "",
  dob: "",
  nakshatra: "",
  preferredDate: "",
  message: "",
};

export function HomamsScreen() {
  const { profile } = useAppUser();
  const [homams, setHomams] = useState<HomamItem[]>([]);
  const [loadingHomams, setLoadingHomams] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState<HomamForm>({ ...EMPTY, name: profile.name || "", email: profile.email || "" });
  const [state, setState] = useState<BookingState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    apiFetch("/api/public/homams")
      .then((r) => r.json())
      .then((d: { homams?: HomamItem[] }) => { if (d.homams) setHomams(d.homams); })
      .catch(() => {})
      .finally(() => setLoadingHomams(false));
  }, []);

  const activeHomam = homams.find((h) => h.slug === selected);

  function openModal(slug: string) {
    setSelected(slug);
    setForm((f) => ({ ...f, homamSlug: slug, name: profile.name || "", email: profile.email || "" }));
    setState("idle");
    setErrorMsg("");
  }

  function closeModal() {
    setSelected(null);
    setState("idle");
  }

  function setField(key: keyof HomamForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    try {
      const homam = homams.find((h: HomamItem) => h.slug === form.homamSlug);
      const res = await apiFetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant: "homam",
          name: form.name,
          email: form.email,
          dob: form.dob,
          preferredDate: form.preferredDate,
          subject: `Homam Booking – ${homam?.name}`,
          message: `Homam: ${homam?.name}\nNakshatra/Rashi: ${form.nakshatra || "—"}\nPreferred date: ${form.preferredDate || "—"}\n${form.message}`.trim(),
          serviceInterested: homam?.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not submit. Please try again.");
      setState("error");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[#D6AE57]/20 bg-[#11152F] px-4 py-3 text-sm text-[#FFF9EE] placeholder:text-[#F3D899]/40 focus:border-[#D6AE57]/60 focus:outline-none";

  return (
    <Screen>
      <p className="app-kicker">Sacred Fire Rituals</p>
      <h1 className="app-title">Homam Bookings</h1>
      <p className="app-sub mt-1">Select a homam below to submit your booking request</p>

      <div className="mt-5 space-y-3">
        {loadingHomams ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-[#16193e]" />
          ))
        ) : homams.filter((h) => h.active).map((h) => (
          <button
            key={h.slug}
            type="button"
            onClick={() => openModal(h.slug)}
            className="app-list w-full text-left"
          >
            <span className="flex items-center gap-4 p-4">
              <span className="shrink-0 text-2xl">{h.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-[#FFF9EE]">{h.name}</span>
                <span className="block truncate text-xs text-[#F3D899]/65 mt-0.5">{h.short_benefit}</span>
              </span>
              <span className="shrink-0 text-xs font-medium text-[#D6AE57]">{formatINR(h.price)}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selected && activeHomam && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={closeModal}>
          <div
            className="relative w-full max-w-lg overflow-y-auto rounded-t-[2rem] border-t border-[#D6AE57]/30 bg-[#0d1128] px-5 pb-8 pt-6"
            style={{ maxHeight: "90dvh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-[#D6AE57]/40" />
            <div className="mb-5">
              <p className="text-lg font-semibold text-[#FFF9EE]">
                {activeHomam.icon} {activeHomam.name}
              </p>
              <p className="text-xs text-[#F3D899]/60 mt-0.5">{activeHomam.short_benefit} · {formatINR(activeHomam.price)}</p>
            </div>

            {state === "success" ? (
              <div className="py-8 text-center">
                <p className="text-3xl">🙏</p>
                <p className="mt-4 font-serif text-xl text-[#FFF9EE]">Booking request sent</p>
                <p className="mt-2 text-sm text-[#F3D899]/70">
                  Guruji's team will confirm an auspicious muhurta and reach you at {form.email}.
                </p>
                <AppButton variant="ghost" block className="mt-6" onClick={closeModal}>
                  Close
                </AppButton>
              </div>
            ) : (
              <form onSubmit={(e) => void submit(e)} className="space-y-3">
                <div>
                  <label className="mb-1 block text-[0.65rem] uppercase tracking-wider text-[#D6AE57]/80">
                    Full Name *
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.65rem] uppercase tracking-wider text-[#D6AE57]/80">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    className={inputCls}
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.65rem] uppercase tracking-wider text-[#D6AE57]/80">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.dob}
                    onChange={(e) => setField("dob", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.65rem] uppercase tracking-wider text-[#D6AE57]/80">
                    Nakshatra / Rashi
                  </label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Rohini / Vrishabha"
                    value={form.nakshatra}
                    onChange={(e) => setField("nakshatra", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.65rem] uppercase tracking-wider text-[#D6AE57]/80">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.preferredDate}
                    onChange={(e) => setField("preferredDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[0.65rem] uppercase tracking-wider text-[#D6AE57]/80">
                    Message (optional)
                  </label>
                  <textarea
                    rows={3}
                    className={inputCls}
                    placeholder="Any specific sankalpa or intent for this homam…"
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                  />
                </div>

                {state === "error" && (
                  <p className="text-xs text-[#e5484d]">{errorMsg}</p>
                )}

                <AppButton
                  type="submit"
                  variant="primary"
                  block
                  className="mt-2"
                  disabled={state === "submitting"}
                >
                  {state === "submitting" ? "Sending…" : "Submit Booking Request"}
                </AppButton>
                <AppButton variant="ghost" block onClick={closeModal} type="button">
                  Cancel
                </AppButton>
              </form>
            )}
          </div>
        </div>
      )}
    </Screen>
  );
}
