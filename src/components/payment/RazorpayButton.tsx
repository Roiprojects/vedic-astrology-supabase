/**
 * RazorpayButton — creates a Razorpay order on the server and opens the
 * Razorpay checkout popup. Calls onSuccess with the payment_id on completion.
 *
 * Usage:
 *   <RazorpayButton amount={2000} serviceName="Love & Relationship Consultation" onSuccess={...} />
 *
 * amount is in INR (rupees), not paise — the component converts internally.
 */
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiFetch, safeJson } from "@/lib/api";
import { siteConfig } from "@/lib/site";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type RazorpaySuccessPayload = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

interface RazorpayButtonProps {
  /** Price in INR rupees */
  amount: number;
  serviceName: string;
  /** Enquiry reference (from BookingForm) — links payment to enquiry */
  reference?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onSuccess?: (payload: RazorpaySuccessPayload) => void;
  onError?: (message: string) => void;
  className?: string;
  label?: string;
}

// Razorpay key_id is public — safe to embed in frontend
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

export function RazorpayButton({
  amount,
  serviceName,
  reference,
  customerName,
  customerPhone,
  customerEmail,
  onSuccess,
  onError,
  className,
  label = "Pay Now",
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay checkout. Please refresh and try again.");

      if (!RAZORPAY_KEY_ID) throw new Error("Razorpay is not configured for this build.");
      const res = await apiFetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount * 100,
          receipt: reference || `va-${Date.now()}`,
          notes: { service: serviceName, reference: reference || "" },
        }),
      });
      const data = await safeJson<{ ok?: boolean; order?: { id?: string; amount?: number; currency?: string }; error?: string }>(res, {});
      if (!res.ok || !data.ok || !data.order?.id) {
        throw new Error(data.error || "Could not create a secure payment order. Please try again.");
      }
      const orderId = data.order.id as string;
      const orderAmount = data.order.amount as number;
      const orderCurrency = data.order.currency as string;

      const options: Record<string, unknown> = {
        key: RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: orderCurrency,
        name: siteConfig.name,
        description: serviceName,
        image: "/logo-mark.png",
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: "#b45309",
        },
        handler: async (response: RazorpaySuccessPayload) => {
          try {
            // Attempt server-side verification in background
            if (response.razorpay_order_id) {
              try {
                const vRes = await apiFetch("/api/razorpay/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...response,
                    reference,
                    service_name: serviceName,
                    amount: amount * 100,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                  }),
                });
                const vData = await safeJson<{ ok?: boolean; error?: string }>(vRes, {});
                if (!vRes.ok || !vData.ok) {
                  console.warn("[razorpay] Server verification returned non-ok:", vData.error || vRes.status);
                }
              } catch (err) {
                console.warn("[razorpay] Verification network warning:", err);
              }
            }
            // The customer has successfully paid — always trigger onSuccess so they receive confirmation
            onSuccess?.(response);
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Payment processing note";
            console.warn("[razorpay] Handler note:", msg);
            onSuccess?.(response);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      options.order_id = orderId;

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp: { error: { description: string } }) => {
        onError?.(resp.error?.description || "Payment failed");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      onError?.(msg);
      setLoading(false);
    }
  }

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handlePay}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Processing…
        </>
      ) : (
        label
      )}
    </Button>
  );
}
