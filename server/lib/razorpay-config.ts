import { getConfig } from "./runtime-config";

export async function getRazorpayKeys() {
  const { RAZORPAY_KEY_ID: keyId, RAZORPAY_KEY_SECRET: keySecret } = getConfig();
  return { keyId: keyId || "", keySecret: keySecret || "" };
}
