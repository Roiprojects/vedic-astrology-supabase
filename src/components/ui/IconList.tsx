import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconList({
  items,
  className,
  columns = 1,
}: {
  items: string[];
  className?: string;
  columns?: 1 | 2;
}) {
  return (
    <ul
      className={cn(
        "grid gap-3",
        columns === 2 ? "sm:grid-cols-2" : "grid-cols-1",
        className
      )}
    >
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 ring-1 ring-gold/30">
            <Check className="h-3.5 w-3.5 text-gold-light" />
          </span>
          <span className="text-sm leading-relaxed text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}
