"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { CATEGORY_ICONS } from "@/components/site/category-icons";
import { cn } from "@/lib/cn";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      {CATEGORIES.map((category) => {
        const href = `/docs/${category.slug}`;
        const active = pathname.startsWith(href);
        const Icon = CATEGORY_ICONS[category.slug];
        return (
          <Link
            key={category.slug}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
            )}
            {Icon && (
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-accent" : "text-muted-foreground/70"
                )}
              />
            )}
            <span>{category.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
