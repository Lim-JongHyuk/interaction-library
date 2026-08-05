"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { loadSpecs } from "@/lib/load-specs";
import { CATEGORY_ICONS } from "@/components/site/category-icons";
import { SearchTrigger } from "@/components/site/search-modal";
import { registryComponents } from "@/lib/registry-components";
import { defaultParamValues } from "@/lib/codegen";
import { LazyPreview } from "@/components/site/lazy-preview";
import { cn } from "@/lib/cn";
import { BrandMark } from "@/components/site/brand-mark";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const specs = loadSpecs();
  const detailMatch = pathname.match(/^\/docs\/([^/]+)\/([^/]+)$/);
  const category = detailMatch?.[1];
  const selectedSlug = detailMatch?.[2];

  return (
    <nav className="min-h-full px-3 py-4 font-mono text-sm">
      <Brand onNavigate={onNavigate} />
      <div className="mb-5 [&_button]:!flex [&_button]:!max-w-none [&_button]:!rounded-none [&_button]:!border-0 [&_button]:!bg-[#2c2c2f] [&_button]:!py-2.5"><SearchTrigger /></div>
      {category && selectedSlug ? <ComponentBrowser specs={specs.filter((spec) => spec.category === category)} category={category} selectedSlug={selectedSlug} onNavigate={onNavigate} /> : <LibraryNav specs={specs} pathname={pathname} onNavigate={onNavigate} />}
    </nav>
  );
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return <Link href="/" onClick={onNavigate} className="mb-5 flex items-center gap-2.5 px-0.5 text-lg"><BrandMark label="Kinetiq" /><span className="border border-border px-1 py-0.5 text-[10px] font-normal text-muted-foreground">BETA</span></Link>;
}

function ComponentBrowser({ specs, category, selectedSlug, onNavigate }: { specs: ReturnType<typeof loadSpecs>; category: string; selectedSlug: string; onNavigate?: () => void }) {
  const [view, setView] = useState<"list" | "grid">("list");
  const meta = CATEGORIES.find((item) => item.slug === category);
  return <section>
    <Link href={`/docs/${category}`} onClick={onNavigate} className="mb-5 flex items-center gap-2 border-b border-dashed border-border pb-4 text-xs font-bold uppercase text-foreground hover:text-accent">‹ {meta?.label ?? category}</Link>
    <div className="mb-5 grid grid-cols-2 border border-border text-xs"><button type="button" onClick={() => setView("list")} className={cn("py-2 transition-colors", view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted")}>☷ List</button><button type="button" onClick={() => setView("grid")} className={cn("border-l border-border py-2 transition-colors", view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted")}>▦ Grid</button></div>
    <div className={cn(view === "grid" ? "grid grid-cols-2 gap-2" : "space-y-1")}>
      {specs.map((spec) => <SidebarItem key={spec.slug} spec={spec} selected={spec.slug === selectedSlug} grid={view === "grid"} onNavigate={onNavigate} />)}
    </div>
  </section>;
}

function SidebarItem({ spec, selected, grid, onNavigate }: { spec: ReturnType<typeof loadSpecs>[number]; selected: boolean; grid: boolean; onNavigate?: () => void }) {
  const Preview = registryComponents[`${spec.category}/${spec.slug}`];
  const href = `/docs/${spec.category}/${spec.slug}`;
  if (!grid) return <Link href={href} onClick={onNavigate} className={cn("block border-l-2 px-3 py-2.5 transition-colors", selected ? "border-accent bg-muted text-foreground" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground")}>{spec.name}</Link>;
  return <Link href={href} onClick={onNavigate} className={cn("group overflow-hidden border bg-black transition-colors", selected ? "border-accent" : "border-border hover:border-muted-foreground")}><div className="pointer-events-none relative aspect-[1.45] overflow-hidden">{Preview ? <LazyPreview className="absolute inset-0 flex items-center justify-center p-1 [&>*]:max-h-full [&>*]:max-w-full" poster={<span className="text-[9px] text-muted-foreground">Preview</span>}>{<Preview {...spec.demo} {...defaultParamValues(spec)} />}</LazyPreview> : null}</div><span className={cn("block truncate px-2 py-2 text-xs", selected ? "bg-muted text-foreground" : "text-muted-foreground")}>{spec.name}</span></Link>;
}

function LibraryNav({ specs, pathname, onNavigate }: { specs: ReturnType<typeof loadSpecs>; pathname: string; onNavigate?: () => void }) {
  return <><NavSection label="GET STARTED"><SimpleLink href="/" label="⌂  Introduction" active={pathname === "/"} onNavigate={onNavigate} /><SimpleLink href="/components" label="⌘  Components" active={pathname === "/components"} onNavigate={onNavigate} /></NavSection><NavSection label="EXPLORE"><SimpleLink href="/components?view=trending" label="⌁  Trending" onNavigate={onNavigate} /><SimpleLink href="/components?view=featured" label="♡  Featured" onNavigate={onNavigate} /><SimpleLink href="/components?view=recent" label="♨  Recent" onNavigate={onNavigate} /></NavSection><NavSection label="CATEGORIES"><div className="space-y-0.5">{CATEGORIES.map((category) => { const href = `/docs/${category.slug}`; const active = pathname.startsWith(href); const Icon = CATEGORY_ICONS[category.slug]; const count = specs.filter((spec) => spec.category === category.slug).length; return <Link key={category.slug} href={href} onClick={onNavigate} className={cn("flex items-center gap-2 px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground", active ? "bg-muted text-foreground" : "text-muted-foreground")}>{Icon && <Icon className="size-3.5" />}<span>{category.label}</span><span className="ml-auto tabular-nums">{count}</span></Link>; })}</div></NavSection><NavSection label="ALL COMPONENTS"><div className="space-y-0.5 text-muted-foreground">{specs.slice(0, 7).map((spec) => <Link key={`${spec.category}/${spec.slug}`} href={`/docs/${spec.category}/${spec.slug}`} onClick={onNavigate} className="block px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground">{spec.name}</Link>)}<Link href="/components" onClick={onNavigate} className="mt-2 block px-2 py-1.5 text-accent hover:underline">View all →</Link></div></NavSection></>;
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) { return <section className="mb-5 border-b border-dashed border-border pb-4 last:border-0"><h2 className="mb-3 px-2 text-xs font-bold text-foreground">{label}</h2>{children}</section>; }
function SimpleLink({ href, label, active = false, onNavigate }: { href: string; label: string; active?: boolean; onNavigate?: () => void }) { return <Link href={href} onClick={onNavigate} className={cn("block px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground", active ? "bg-muted text-foreground" : "text-muted-foreground")}>{label}</Link>; }
