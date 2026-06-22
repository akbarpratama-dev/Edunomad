import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-body-sm text-neutral-gray">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-neutral-dark">
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-dark">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
