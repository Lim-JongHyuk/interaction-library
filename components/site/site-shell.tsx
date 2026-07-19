"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/site/header";
import { SidebarNav } from "@/components/site/sidebar-nav";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/cn";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header onMenuClick={() => setDrawerOpen(true)} />

      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border lg:block">
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
            <SidebarNav />
          </div>
        </aside>

        <div
          className={cn(
            "fixed inset-0 z-50 lg:hidden",
            drawerOpen ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <div
            className={cn(
              "absolute inset-0 bg-black/50 transition-opacity",
              drawerOpen ? "opacity-100" : "opacity-0"
            )}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className={cn(
              "absolute inset-y-0 left-0 w-64 border-r border-border bg-background transition-transform",
              drawerOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex h-14 items-center border-b border-border px-4 font-semibold">
              MotionKit
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-medium text-foreground/80">MotionKit</span>
          <span>MIT License</span>
          <span className="hidden sm:inline">Built with Next.js · motion · Tailwind CSS</span>
          {siteConfig.github && (
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
