"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/site/header";
import { SidebarNav } from "@/components/site/sidebar-nav";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/cn";
import { PanelResizeHandle } from "@/components/site/panel-resize-handle";
import { SearchDialog } from "@/components/site/search-modal";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  useEffect(() => {
    const closeDrawer = () => setDrawerOpen(false);
    window.addEventListener("orbit:navigate", closeDrawer);
    return () => window.removeEventListener("orbit:navigate", closeDrawer);
  }, []);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SearchDialog />
      <div className="lg:hidden">
        <Header onMenuClick={() => setDrawerOpen(true)} />
      </div>

      <div className="flex flex-1">
        <aside style={{ width: sidebarWidth }} className="relative hidden shrink-0 border-r border-border bg-[#1d1d1f] lg:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <SidebarNav />
          </div>
          <PanelResizeHandle label="Resize library sidebar" className="-right-1 top-0 h-full" onResize={(delta) => setSidebarWidth((width) => Math.min(460, Math.max(220, width + delta)))} />
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
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <footer className="border-t border-border px-4 py-5 font-mono text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="font-medium text-foreground/80">ORBIT</span>
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
