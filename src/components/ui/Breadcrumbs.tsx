import { ChevronRight } from "lucide-react";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex justify-center">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-faint">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {item.href ? (
              <a href={item.href} className="transition-colors hover:text-gold-light">
                {item.name}
              </a>
            ) : (
              <span className="text-gold-light">{item.name}</span>
            )}
            {i < items.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
