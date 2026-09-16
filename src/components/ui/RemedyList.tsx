import { VedicSymbol } from "@/components/icons/VedicSymbol";
import { getRemedySymbol } from "@/lib/presentation/vedic-symbols";
import { cn } from "@/lib/utils";

export function RemedyList({
  items,
  className,
  columns = 1,
}: {
  items: string[];
  className?: string;
  columns?: 1 | 2;
}) {
  return (
    <ul className={cn("grid gap-3", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-gold/30 bg-saffron/10 text-gold-light">
            <VedicSymbol kind={getRemedySymbol(item)} size="sm" />
          </span>
          <span className="pt-1 text-sm leading-relaxed text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}
