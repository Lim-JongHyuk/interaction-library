"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SearchTrigger } from "@/components/site/search-modal";
import { siteConfig } from "@/lib/site-config";
import { BrandMark } from "@/components/site/brand-mark";
import { cn } from "@/lib/cn";

export function Header({ onMenuClick, showMenu = true }: { onMenuClick: () => void; showMenu?: boolean }) {
  const pathname = usePathname();
  const navItems = [
    { href: "/components", label: "Components", active: pathname === "/components" || pathname.startsWith("/docs") },
    { href: "/collections", label: "Collections", active: pathname === "/collections" },
    { href: "/changelog", label: "Changelog", active: pathname === "/changelog" },
  ];
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-border bg-background/90 px-4 backdrop-blur-xl lg:px-5">
      <div className={cn("mx-auto flex h-full w-[calc(100%-2.5rem)] items-center gap-3 sm:w-[calc(100%-4rem)]", pathname === "/" ? "max-w-[1280px]" : "max-w-[1340px]")}>
      {showMenu && <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 hover:bg-muted lg:hidden"
      >
        <MenuIcon className="h-5 w-5" />
      </button>}

      <Link href="/" aria-label="ORBIT home"><BrandMark label="ORBIT" /></Link>

      <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
        {navItems.map((item) => <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} className={`rounded-md px-2.5 py-1.5 text-xs transition-colors ${item.active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`}>{item.label}</Link>)}
      </nav>

      <div className="ml-4 flex-1 max-w-sm lg:ml-auto lg:max-w-[280px]">
        <SearchTrigger />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {siteConfig.github && (
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-foreground/80 hover:bg-muted"
          >
            <GitHubIcon className="h-4 w-4" />
          </a>
        )}
        <ThemeToggle />
      </div>
      </div>
    </header>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.97-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97.01 1.95.13 2.87.39 2.19-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}
