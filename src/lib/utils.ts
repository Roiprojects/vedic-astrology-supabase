import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function whatsappLink(number: string, message?: string): string {
  const clean = number.replace(/[^0-9]/g, "");
  const text = message ? encodeURIComponent(message) : "";
  return text ? `https://wa.me/${clean}?text=${text}` : `https://wa.me/${clean}`;
}

export function formatINR(value: number): string {
  if (Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
