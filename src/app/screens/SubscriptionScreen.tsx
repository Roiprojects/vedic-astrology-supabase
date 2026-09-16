import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Crown, Sparkles, Star, Zap } from "lucide-react";
import { useAppUser } from "@/hooks/useAppUser";
import { AppButton, Screen, ScreenTitle } from "@/app/components/AppUI";
import { apiBaseUrl } from "@/lib/api";

type RazorpayInstance = { open(): void };
type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string | null;
  features: string[];
  badge: string | null;
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Star className="h-5 w-5" />,
  star: <Sparkles className="h-5 w-5" />,
  cosmic: <Crown className="h-5 w-5" />,
};

export function SubscriptionScreen() {
  const { userId, userToken, plan: currentPlan } = useAppUser();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${apiBaseUrl()}/api/subscriptions/plans`)
      .then((r) => r.json())
      .then((d: { ok: boolean; plans?: Plan[] }) => {
        if (d.ok && d.plans) setPlans(d.plans);
      })
      .catch(() => setError("Could not load plans."))
      .finally(() => setLoading(false));
  }, []);

  async function subscribe(planId: string) {
    if (!userId || !userToken) {
      navigate("/app/auth");
      return;
    }
    setBusy(planId);
    setError("");

    try {
      const res = await fetch(`${apiBaseUrl()}/api/subscriptions/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ planId }),
      });
      const data = (await res.json()) as { ok: boolean; subscriptionId?: string; keyId?: string; error?: string };
      if (!data.ok || !data.subscriptionId) {
        setError(data.error || "Could not create subscription.");
        return;
      }

      // Load Razorpay script if not already loaded
      if (!(window as unknown as Record<string, unknown>)["Razorpay"]) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }

      const RazorpayClass = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;
      const rzp = new RazorpayClass({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "My Vedic Astrology",
        description: `${plans.find((p) => p.id === planId)?.name ?? planId} Plan`,
        image: "/logo-mark.png",
        theme: { color: "#b45309" },
        handler: () => {
          // Webhook handles DB update; just show success
          navigate("/app/profile", { replace: true });
        },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen className="pb-8">
      <ScreenTitle kicker="Membership" title="Choose Your Plan" />

      <p className="mt-1 text-sm text-[#F3D899]/65">
        Unlock deeper Vedic guidance with a membership.
      </p>

      {loading && (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-[#16193e]" />
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="mt-6 rounded-xl border border-[#e5484d]/30 bg-[#e5484d]/10 px-4 py-3 text-sm text-[#e5484d]">{error}</p>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isPopular = plan.badge === "Popular";
            const isBest = plan.badge === "Best Value";

            return (
              <div
                key={plan.id}
                className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
                  isCurrent
                    ? "border-[#D6AE57] bg-gradient-to-br from-[#1e1a08] to-[#110e04]"
                    : isPopular
                    ? "border-[#D6AE57]/50 bg-gradient-to-br from-[#16193e] to-[#11152F]"
                    : "border-[#D6AE57]/15 bg-[#0d1028]"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-[#D6AE57] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[#080A18]">
                    {plan.badge}
                  </span>
                )}

                {/* Header */}
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-[#D6AE57]/30 bg-[#D6AE57]/10 text-[#D6AE57]">
                    {PLAN_ICONS[plan.id] ?? <Zap className="h-5 w-5" />}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg text-[#FFF9EE]">{plan.name}</h3>
                    <p className="text-sm text-[#F3D899]/70">
                      {plan.price === 0
                        ? "Free forever"
                        : `₹${plan.price.toLocaleString("en-IN")}/${plan.interval === "monthly" ? "mo" : plan.interval}`}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#F3D899]/80">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D6AE57]" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-5">
                  {isCurrent ? (
                    <div className="flex items-center gap-2 rounded-xl border border-[#D6AE57]/30 bg-[#D6AE57]/8 px-4 py-2.5 text-sm text-[#D6AE57]">
                      <CheckCircle2 className="h-4 w-4" />
                      Current plan
                    </div>
                  ) : plan.price === 0 ? (
                    <div className="rounded-xl border border-[#ffffff]/10 px-4 py-2.5 text-center text-sm text-[#F3D899]/50">
                      Already included
                    </div>
                  ) : (
                    <AppButton
                      block
                      disabled={busy === plan.id}
                      onClick={() => void subscribe(plan.id)}
                    >
                      {busy === plan.id ? "Opening checkout…" : `Subscribe — ₹${plan.price.toLocaleString("en-IN")}/mo`}
                    </AppButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-[0.65rem] leading-relaxed text-[#F3D899]/35">
        Subscriptions are recurring. Cancel anytime from your account.
        Powered by Razorpay. Prices include GST.
      </p>
    </Screen>
  );
}
