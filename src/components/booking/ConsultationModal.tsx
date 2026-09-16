/**
 * ConsultationModal — full-screen popup form for booking a service consultation.
 *
 * Flow:
 *  Step 1 → Fill birth details
 *  Step 2 → Razorpay payment
 *  Step 3 → AI report generation (loading)
 *  Step 4 → Success + report preview
 */
import { useState } from "react";
import { X, Loader2, CheckCircle2, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RazorpayButton, type RazorpaySuccessPayload } from "@/components/payment/RazorpayButton";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────
export interface ConsultationService {
  slug: string;
  title: string;
  price: number;
  discountPrice?: number | null;
  duration: string;
  icon: string;
}

interface FormValues {
  name: string;
  email: string;
  phone: string;
  dob: string;
  tob: string;
  pob: string;
  gender: string;
  concern: string;
}

interface ReportSummary {
  nakshatra: string;
  rashi: string;
  lagna: string;
  summary: string;
  remedies: string;
  mantras: string;
  message: string;
}

type Step = "form" | "payment" | "generating" | "success" | "error";

// ─── Field helpers ────────────────────────────────────────────
function Field({
  label, required, children, error,
}: {
  label: string; required?: boolean; children: React.ReactNode; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-[#fff2d0]/90">
        {label}{required && <span className="ml-0.5 text-saffron">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-gold/30 bg-[#2a1018]/70 px-3 py-2.5 text-sm text-[#fff2d0] placeholder:text-[#fff2d0]/35 focus:border-gold/70 focus:outline-none focus:ring-1 focus:ring-gold/40 transition";

// ─── Main modal ───────────────────────────────────────────────
export function ConsultationModal({
  service,
  onClose,
}: {
  service: ConsultationService;
  onClose: () => void;
}) {
  const effectivePrice = service.discountPrice ?? service.price;

  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormValues>({
    name: "", email: "", phone: "", dob: "", tob: "", pob: "", gender: "Male", concern: "",
  });
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [payment, setPayment] = useState<RazorpaySuccessPayload | null>(null);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  function setField(key: keyof FormValues, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<FormValues> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    const digits = form.phone.replace(/\D/g, "");
    if (!digits || digits.length !== 10) e.phone = "Enter a valid 10-digit mobile number";
    if (!form.dob) e.dob = "Date of birth is required";
    if (!form.tob) e.tob = "Time of birth is required";
    if (!form.pob.trim()) e.pob = "Place of birth is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleFormNext() {
    if (validate()) setStep("payment");
  }

  async function handlePaymentSuccess(payload: RazorpaySuccessPayload) {
    setPayment(payload);
    setStep("generating");

    try {
      const res = await apiFetch("/api/consultation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          serviceTitle: service.title,
          serviceSlug: service.slug,
          paymentId: payload.razorpay_payment_id,
          orderId: payload.razorpay_order_id || "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Report generation failed");
      setReport({ ...data.report, message: data.message });
      setStep("success");
    } catch {
      setReport({
        nakshatra: "", rashi: "", lagna: "", summary: "", remedies: "", mantras: "",
        message: `Payment confirmed (ID: ${payload.razorpay_payment_id}). Your report will be sent to ${form.email} shortly.`,
      });
      setStep("success");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto bg-black/75 backdrop-blur-sm sm:items-start sm:p-4 sm:py-8"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-xl rounded-t-3xl border border-gold/25 bg-[#1a0a10] shadow-2xl sm:rounded-3xl">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-white/20" />
        </div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gold/20 bg-[#2a1018]/80 px-6 py-4 sm:rounded-t-3xl sm:py-5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{service.icon}</span>
            <div>
              <h2 className="font-serif text-xl text-[#fff8e8]">{service.title}</h2>
              <p className="text-sm text-[#ffd777]">
                ₹{effectivePrice.toLocaleString("en-IN")} · {service.duration}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 rounded-full p-1.5 text-[#fff2d0]/50 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step indicator */}
        <StepBar step={step} />

        {/* Body */}
        <div className="px-6 py-6">

          {step === "form" && (
            <FormStep form={form} errors={errors} setField={setField} onNext={handleFormNext} />
          )}

          {step === "payment" && (
            <PaymentStep
              service={service}
              form={form}
              effectivePrice={effectivePrice}
              onSuccess={handlePaymentSuccess}
              onError={(msg) => { setGenError(msg); setStep("error"); }}
              onBack={() => setStep("form")}
            />
          )}

          {step === "generating" && <GeneratingStep name={form.name} />}

          {step === "success" && report && (
            <SuccessStep name={form.name} email={form.email} report={report} onClose={onClose} />
          )}

          {step === "error" && (
            <ErrorStep error={genError} onClose={onClose} onRetry={() => setStep("payment")} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step bar ─────────────────────────────────────────────────
function StepBar({ step }: { step: Step }) {
  const steps = ["form", "payment", "generating", "success"] as const;
  const active = step === "error" ? 3 : steps.indexOf(step as typeof steps[number]);
  const labels = ["Details", "Payment", "Generating", "Report Ready"];
  return (
    <div className="flex items-center gap-0 px-6 py-3 border-b border-gold/10">
      {labels.map((label, i) => (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-0.5 flex-1">
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all",
              i < active ? "bg-saffron text-white" :
              i === active ? "bg-gold text-white ring-2 ring-gold/40" :
              "bg-white/10 text-white/30"
            )}>
              {i < active ? "✓" : i + 1}
            </div>
            <span className={cn("text-[10px]", i <= active ? "text-[#ffd777]" : "text-white/25")}>
              {label}
            </span>
          </div>
          {i < 3 && <div className={cn("h-px flex-1 -mt-3", i < active ? "bg-saffron/60" : "bg-white/10")} />}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Form ─────────────────────────────────────────────
function FormStep({
  form, errors, setField, onNext,
}: {
  form: FormValues;
  errors: Partial<FormValues>;
  setField: (k: keyof FormValues, v: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#fff2d0]/70 -mt-1">
        Your birth details are used to generate a personalized Vedic astrology report based on
        <strong className="text-[#ffd777]"> Parasara Hora Shastra</strong> and Lahiri ayanamsa.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full Name" required error={errors.name}>
          <input className={inputCls} placeholder="e.g. Ramesh Kumar" value={form.name}
            onChange={(e) => setField("name", e.target.value)} />
        </Field>
        <Field label="Phone Number" required error={errors.phone}>
          <div className="flex items-center overflow-hidden rounded-xl border border-gold/30 bg-[#2a1018]/70 focus-within:border-gold/70 focus-within:ring-1 focus-within:ring-gold/40 transition">
            <span className="shrink-0 select-none border-r border-gold/20 bg-[#1a0a10]/60 px-3 py-2.5 text-sm font-medium text-[#ffd777]">+91</span>
            <input
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[#fff2d0] placeholder:text-[#fff2d0]/35 outline-none"
              placeholder="98765 43210"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
          </div>
        </Field>
      </div>

      <Field label="Email Address" required error={errors.email}>
        <input className={inputCls} placeholder="your@email.com" value={form.email}
          onChange={(e) => setField("email", e.target.value)} type="email" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of Birth" required error={errors.dob}>
          <input className={inputCls} value={form.dob} type="date"
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setField("dob", e.target.value)} />
        </Field>
        <Field label="Time of Birth" required error={errors.tob}>
          <input className={inputCls} value={form.tob} type="time"
            onChange={(e) => setField("tob", e.target.value)} />
        </Field>
      </div>

      <Field label="Place of Birth" required error={errors.pob}>
        <input className={inputCls} placeholder="e.g. Bangalore, Karnataka, India" value={form.pob}
          onChange={(e) => setField("pob", e.target.value)} />
      </Field>

      <Field label="Gender">
        <select className={inputCls} value={form.gender}
          onChange={(e) => setField("gender", e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </Field>

      <Field label="Describe Your Concern (optional)">
        <textarea
          className={cn(inputCls, "min-h-[80px] resize-none")}
          placeholder="Share more about your specific situation so Guruji can give you the most accurate guidance…"
          value={form.concern}
          onChange={(e) => setField("concern", e.target.value)}
        />
      </Field>

      <div className="mt-1 rounded-2xl border border-gold/20 bg-[#2a1018]/60 px-4 py-3 text-xs text-[#fff2d0]/60">
        🔒 Your details are strictly confidential and used only to prepare your personal astrological report.
      </div>

      <Button variant="primary" size="lg" className="w-full mt-1" onClick={onNext}>
        <Send className="h-4 w-4" /> Continue to Payment
      </Button>
    </div>
  );
}

// ─── Step 2: Payment ──────────────────────────────────────────
function PaymentStep({
  service, form, effectivePrice, onSuccess, onError, onBack,
}: {
  service: ConsultationService;
  form: FormValues;
  effectivePrice: number;
  onSuccess: (p: RazorpaySuccessPayload) => void;
  onError: (msg: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-gold/25 bg-[#2a1018]/70 p-4">
        <p className="text-sm font-medium text-[#ffd777] mb-3">Order Summary</p>
        <div className="flex justify-between text-sm text-[#fff2d0]/80">
          <span>{service.title}</span>
          <span>₹{effectivePrice.toLocaleString("en-IN")}</span>
        </div>
        {service.price !== effectivePrice && (
          <div className="flex justify-between text-xs text-[#fff2d0]/40 mt-1">
            <span>Original Price</span>
            <span className="line-through">₹{service.price.toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="mt-3 border-t border-gold/20 pt-3 flex justify-between font-bold text-[#fff8e8]">
          <span>Total</span>
          <span className="text-gold">₹{effectivePrice.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/20 bg-[#2a1018]/60 px-4 py-3">
        <p className="text-xs text-[#fff2d0]/60 mb-1">Booking for:</p>
        <p className="text-sm font-medium text-[#fff8e8]">{form.name}</p>
        <p className="text-xs text-[#fff2d0]/50">{form.email || `+91 ${form.phone}`}</p>
      </div>

      <div className="rounded-2xl border border-saffron/30 bg-saffron/10 px-4 py-3 text-sm text-[#ffd777]">
        ✨ After payment, Guruji will generate your personalized report using{" "}
        <strong>Parasara Hora Shastra</strong> and send it to your email as a PDF.
      </div>

      <RazorpayButton
        amount={effectivePrice}
        serviceName={service.title}
        customerName={form.name}
        customerEmail={form.email}
        customerPhone={form.phone}
        onSuccess={onSuccess}
        onError={onError}
        className="w-full"
        label={`Pay ₹${effectivePrice.toLocaleString("en-IN")} & Get Report`}
      />

      <button onClick={onBack} className="text-sm text-[#fff2d0]/40 hover:text-[#fff2d0]/70 transition text-center">
        ← Back to edit details
      </button>
    </div>
  );
}

// ─── Step 3: Generating ───────────────────────────────────────
function GeneratingStep({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-gold/20 border-t-gold" />
        <div className="absolute inset-3 flex items-center justify-center text-3xl">🔮</div>
      </div>
      <div>
        <h3 className="font-serif text-xl text-[#fff8e8]">Generating Your Report…</h3>
        <p className="mt-2 text-sm text-[#fff2d0]/70">
          Guruji is analyzing <strong className="text-[#ffd777]">{name}</strong>'s birth chart
          using Parasara Hora Shastra and the Lahiri ayanamsa system.
        </p>
      </div>
      <div className="flex flex-col gap-2 text-xs text-[#fff2d0]/50 w-full max-w-xs">
        {["Calculating nakshatra & lagna…", "Analyzing planetary positions…", "Preparing remedies & mantras…", "Creating your PDF report…"].map((t) => (
          <div key={t} className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-gold/60 shrink-0" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────
function SuccessStep({
  name, email, report, onClose,
}: {
  name: string;
  email: string;
  report: ReportSummary;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <CheckCircle2 className="h-14 w-14 text-green-400" />
        <h3 className="font-serif text-xl text-[#fff8e8]">Your Report is Ready!</h3>
        <p className="text-sm text-[#fff2d0]/70">{report.message}</p>
      </div>

      {/* Quick highlights */}
      <div className="rounded-2xl border border-gold/25 bg-[#2a1018]/70 p-4 space-y-3">
        <p className="text-xs font-semibold text-[#ffd777] uppercase tracking-wide">Birth Chart Highlights</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            ["Nakshatra", report.nakshatra],
            ["Rashi", report.rashi],
            ["Lagna", report.lagna],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white/5 px-3 py-2">
              <p className="text-[10px] text-[#fff2d0]/50 mb-0.5">{label}</p>
              <p className="text-xs text-[#fff8e8] font-medium leading-snug">{value}</p>
            </div>
          ))}
        </div>

        {report.summary && (
          <div className="rounded-xl bg-white/5 px-3 py-2">
            <p className="text-[10px] text-[#fff2d0]/50 mb-1">Overview</p>
            <p className="text-xs text-[#fff2d0]/80 leading-relaxed line-clamp-4">{report.summary}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
        📩 Full report with remedies, mantras & gemstone advice sent to <strong>{email}</strong>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onClose}>
        <Star className="h-4 w-4" /> Done
      </Button>
    </div>
  );
}

// ─── Error step ───────────────────────────────────────────────
function ErrorStep({
  error, onClose, onRetry,
}: {
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <div className="text-5xl">⚠️</div>
      <div>
        <h3 className="font-serif text-xl text-[#fff8e8]">Something Went Wrong</h3>
        <p className="mt-2 text-sm text-[#fff2d0]/70">{error || "An error occurred during report generation."}</p>
        <p className="mt-2 text-xs text-[#fff2d0]/50">Your payment was successful. Please contact us for your report.</p>
      </div>
      <div className="flex gap-3">
        <Button variant="gold" size="md" onClick={onRetry}>Retry</Button>
        <Button variant="primary" size="md" onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
