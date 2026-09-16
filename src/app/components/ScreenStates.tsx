import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("va-skeleton", className)} />;
}

export function ScreenError({
  title = "Something went wrong",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-gold/20 bg-[#11152F]/80 p-6 text-center">
      <p className="font-display text-sm tracking-[0.2em] text-[#D6AE57]">{title}</p>
      <p className="mt-2 text-sm text-[#F3D899]/80">{message || "Please try again."}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="app-btn app-btn-primary mt-4">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-gold/25 bg-[#11152F]/50 p-8 text-center">
      <p className="font-serif text-xl text-[#FFF9EE]">{title}</p>
      <p className="mt-2 text-sm text-[#F3D899]/70">{message}</p>
    </div>
  );
}
