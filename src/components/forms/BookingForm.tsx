import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import {
  refineForVariant,
  type BookingInput,
  type BookingVariant,
} from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/forms/fields";
import { RazorpayButton } from "@/components/payment/RazorpayButton";
import { apiFetch } from "@/lib/api";
import { siteConfig } from "@/lib/site";

const titles: Record<BookingVariant, string> = {
  consultation: "Book Your Consultation",
  homam: "Book This Homam",
  "birth-chart": "Request Your Birth Chart PDF",
  chat: "Start Your Chat Booking",
  contact: "Send Us a Message",
};

type FieldErrors = Record<string, { message?: string }>;

export function BookingForm({
  variant,
  subject,
  price,
  className,
}: {
  variant: BookingVariant;
  subject?: string;
  /** If provided, a Razorpay Pay Now button will be shown after successful enquiry. */
  price?: number;
  className?: string;
}) {
  const schema = useMemo(
    () => refineForVariant(variant) as z.ZodType<BookingInput>,
    [variant]
  );
  const [reference, setReference] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // @ts-ignore react-hook-form / zod type mismatch (zod v3 + rhf v7)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: { variant, subject: subject ?? "" },
  });

  const needBirth = variant === "consultation" || variant === "birth-chart";
  const errs = errors as FieldErrors;

  // @ts-ignore onSubmit generic type mismatch
  async function onSubmit(values: unknown) {
    setServerError(null);
    try {
      const res = await apiFetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong");
      setReference(data.reference);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Could not submit. Please try again or email us."
      );
    }
  }

  const formValues = reference ? getValues() : null;

  if (reference) {
    return (
      <div className="glass-card rounded-3xl p-8">
        {paymentId ? (
          /* ── Payment success state ── */
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="mt-5 font-serif text-2xl text-ink">Payment Successful!</h3>
            <p className="mt-2 text-sm text-muted">
              Your booking is confirmed. A confirmation email has been sent to you.
            </p>
            <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              📬 If you don't see it, please check your <strong>spam or junk folder</strong>.
            </p>
            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-left text-sm">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-green-700">Payment Details</p>
              <div className="space-y-2 divide-y divide-green-100">
                <div className="flex justify-between pb-2">
                  <span className="text-green-800">Reference</span>
                  <span className="font-bold tracking-wider text-amber-700">{reference}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-green-800">Payment ID</span>
                  <span className="font-mono text-xs text-ink">{paymentId}</span>
                </div>
                {subject && (
                  <div className="flex justify-between pt-2">
                    <span className="text-green-800">Service</span>
                    <span className="text-ink">{subject}</span>
                  </div>
                )}
                {price && (
                  <div className="flex justify-between pt-2">
                    <span className="text-green-800">Amount Paid</span>
                    <span className="font-semibold text-green-700">₹{price.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs text-faint">
              Guruji will reach out within 24–48 hours · Keep your reference number safe
            </p>
          </div>
        ) : (
          /* ── Enquiry received, awaiting payment (if any) ── */
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/50">
              <CheckCircle2 className="h-10 w-10 text-amber-600" />
            </div>
            <h3 className="mt-5 font-serif text-2xl text-ink">Request Received!</h3>
            <p className="mt-2 text-sm text-muted">
              {formValues?.email
                ? "A confirmation email has been sent to you."
                : "Guruji will review your details and reach out to you shortly."}
            </p>
            {formValues?.email && (
              <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                📬 If you don't see it, please check your <strong>spam or junk folder</strong>.
              </p>
            )}
            <div className="mt-5 rounded-2xl border border-gold/25 bg-gold/[0.04] p-4 text-center">
              <p className="text-xs text-faint uppercase tracking-widest">Your Reference</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.2em] text-amber-700">{reference}</p>
              <p className="mt-1 text-xs text-faint">Please save this for follow-up</p>
            </div>

            {price && price > 0 && (
              <div className="mt-6 rounded-2xl border border-gold/20 bg-surface/60 p-5 text-left">
                <p className="mb-1 text-sm font-semibold text-ink">Complete your booking</p>
                <p className="mb-4 text-xs text-muted">Pay ₹{price.toLocaleString("en-IN")} to confirm your slot with Guruji.</p>
                <RazorpayButton
                  amount={price}
                  serviceName={subject || "Consultation"}
                  reference={reference}
                  customerName={formValues?.name}
                  customerPhone={formValues?.phone}
                  customerEmail={formValues?.email}
                  onSuccess={(payload) => setPaymentId(payload.razorpay_payment_id)}
                  onError={(msg) => setPaymentError(msg)}
                  label={`Pay ₹${price.toLocaleString("en-IN")} — Confirm Booking`}
                  className="w-full"
                />
                {paymentError && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3">
                    <span className="mt-0.5 text-danger">✕</span>
                    <div>
                      <p className="text-sm font-medium text-danger">Payment Failed</p>
                      <p className="mt-0.5 text-xs text-danger/80">{paymentError}</p>
                      <p className="mt-1 text-xs text-faint">Please try again or pay via UPI and email us the screenshot.</p>
                    </div>
                  </div>
                )}
                {!paymentError && (
                  <p className="mt-3 text-center text-xs text-faint">
                    Or pay via UPI / bank transfer and email us the screenshot
                  </p>
                )}
              </div>
            )}

            <p className="mt-4 text-xs text-faint">
              Guruji will reach out within 24–48 hours via phone or email
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            variant="gold"
            size="md"
            onClick={() => {
              setReference(null);
              setPaymentId(null);
              setPaymentError(null);
            }}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  const fieldError = (msg: string | undefined) =>
    msg ? <p className="mt-1 text-xs text-danger">{msg}</p> : null;

  return (
    <form
      // @ts-ignore onSubmit type mismatch with zod v4/v3
      onSubmit={handleSubmit(onSubmit)}
      className={className}
      noValidate
    >
      <h3 className="font-serif text-2xl text-ink">{titles[variant]}</h3>
      <p className="mt-1 text-sm text-faint">
        Fill in your details — all information stays strictly confidential.
      </p>

      <input type="hidden" {...register("variant")} />
      <input type="hidden" {...register("subject")} />
      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
        {...register("website")}
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name" required>Full Name</Label>
          <Input id="name" placeholder="Your name" {...register("name")} />
          {fieldError(errs.name?.message)}
        </div>

        <div>
          <Label htmlFor="phone" required>Phone</Label>
          <div className="flex items-center overflow-hidden rounded-xl border border-border bg-white/60 focus-within:border-gold/60 focus-within:ring-1 focus-within:ring-gold/30">
            <span className="shrink-0 select-none border-r border-border bg-amber-50/80 px-3 py-2.5 text-sm font-medium text-amber-800">+91</span>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder="98765 43210"
              className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted"
              {...register("phone")}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                e.target.value = digits;
                register("phone").onChange(e);
              }}
            />
          </div>
          {fieldError(errs.phone?.message)}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@email.com" {...register("email")} />
          {fieldError(errs.email?.message)}
        </div>

        {needBirth && (
          <>
            <div>
              <Label htmlFor="dob" required>Date of Birth</Label>
              <Input id="dob" type="date" {...register("dob")} />
              {fieldError(errs.dob?.message)}
            </div>
            <div>
              <Label htmlFor="tob" required>Time of Birth</Label>
              <Input id="tob" type="time" {...register("tob")} />
              {fieldError(errs.tob?.message)}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="pob" required>Place of Birth</Label>
              <Input id="pob" placeholder="City, State, Country" {...register("pob")} />
              {fieldError(errs.pob?.message)}
            </div>
          </>
        )}

        {variant === "birth-chart" && (
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select id="gender" defaultValue="" {...register("gender")}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
          </div>
        )}

        {variant === "consultation" && (
          <div>
            <Label htmlFor="preferredMode">Preferred Mode</Label>
            <Select id="preferredMode" defaultValue="" {...register("preferredMode")}>
              <option value="">Select</option>
              <option value="phone">Phone Call</option>
              <option value="video">Video Call</option>
              <option value="chat">Chat</option>
            </Select>
          </div>
        )}

        {variant === "homam" && (
          <div>
            <Label htmlFor="preferredDate">Preferred Date</Label>
            <Input id="preferredDate" type="date" {...register("preferredDate")} />
          </div>
        )}

        {variant === "contact" && (
          <>
            <div>
              <Label htmlFor="serviceInterested">Service Interested In</Label>
              <Select id="serviceInterested" defaultValue="" {...register("serviceInterested")}>
                <option value="">Select</option>
                <option value="astrology-consultation">Astrology Consultation</option>
                <option value="homam">Homam Booking</option>
                <option value="birth-chart">Birth Chart PDF</option>
                <option value="chat">Chat with Guruji</option>
                <option value="other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="preferredContact">Preferred Contact</Label>
              <Select id="preferredContact" defaultValue="" {...register("preferredContact")}>
                <option value="">Select</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
              </Select>
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <Label htmlFor="message" required={variant === "contact"}>
            {variant === "contact"
              ? "Message"
              : needBirth
                ? "Your Question / Concern"
                : "Message (optional)"}
          </Label>
          <Textarea
            id="message"
            placeholder="Share your concern or any details you'd like Guruji to know…"
            {...register("message")}
          />
          {fieldError(errs.message?.message)}
        </div>
      </div>

      {serverError && (
        <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Submit Request
            </>
          )}
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-faint sm:text-left">
        {siteConfig.disclaimer}
      </p>
    </form>
  );
}
