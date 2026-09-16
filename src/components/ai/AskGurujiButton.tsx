import { cn } from "@/lib/utils";

const base =
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2 select-none h-13 px-8 text-base";

/**
 * Opens the site-wide Guruji AI chat (ServiceAiChat listens for this event).
 * Used where we want the "chat first, then hand off to WhatsApp" flow instead
 * of a direct WhatsApp link.
 */
export function AskGurujiButton({
  className,
  children,
  serviceTitle,
}: {
  className?: string;
  children: React.ReactNode;
  serviceTitle?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("open-guruji-ai", { detail: { serviceTitle } })
        )
      }
      className={cn(base, className)}
    >
      {children}
    </button>
  );
}
