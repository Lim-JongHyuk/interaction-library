"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { loadSpecs } from "@/lib/load-specs";
import { CATEGORY_ICONS } from "@/components/site/category-icons";
import { cn } from "@/lib/cn";
import { BrandMark } from "@/components/site/brand-mark";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const specs = loadSpecs();
  const detailMatch = pathname.match(/^\/docs\/([^/]+)\/([^/]+)$/);
  const category = detailMatch?.[1];
  const selectedSlug = detailMatch?.[2];

  return <nav className="min-h-full px-5 py-6 font-sans text-sm">
    <div className="mb-6 lg:hidden"><Brand onNavigate={onNavigate} /></div>
    {category && selectedSlug ? <ComponentBrowser specs={specs.filter((spec) => spec.category === category)} category={category} selectedSlug={selectedSlug} onNavigate={onNavigate} /> : <LibraryNav specs={specs} pathname={pathname} onNavigate={onNavigate} />}
  </nav>;
}

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return <Link href="/" onClick={onNavigate} className="mb-5 flex items-center gap-2.5 px-0.5 text-lg"><BrandMark label="ORBIT" /><span className="border border-border px-1 py-0.5 text-[10px] font-normal text-muted-foreground">BETA</span></Link>;
}

function ComponentBrowser({ specs, category, selectedSlug, onNavigate }: { specs: ReturnType<typeof loadSpecs>; category: string; selectedSlug: string; onNavigate?: () => void }) {
  const meta = CATEGORIES.find((item) => item.slug === category);
  return <section>
    <Link href={`/docs/${category}`} onClick={onNavigate} className="mb-5 flex items-center gap-3 border-b border-border pb-4 hover:text-accent"><span className="text-lg text-muted-foreground" aria-hidden="true">‹</span><span><span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Collection</span><span className="mt-0.5 block text-xs font-semibold uppercase tracking-[0.08em] text-foreground">{meta?.label ?? category}</span></span><span className="ml-auto font-mono text-[10px] text-muted-foreground">{String(specs.length).padStart(2, "0")}</span></Link>
    <div className="space-y-0.5">{specs.map((spec) => <SidebarItem key={spec.slug} spec={spec} selected={spec.slug === selectedSlug} onNavigate={onNavigate} />)}</div>
  </section>;
}

function SidebarItem({ spec, selected, onNavigate }: { spec: ReturnType<typeof loadSpecs>[number]; selected: boolean; onNavigate?: () => void }) {
  const href = `/docs/${spec.category}/${spec.slug}`;
  return <Link href={href} onClick={onNavigate} aria-current={selected ? "page" : undefined} className={cn("block rounded-md px-3 py-2 transition-colors", selected ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")}>{spec.name}</Link>;
}

function LibraryNav({ specs, pathname, onNavigate }: { specs: ReturnType<typeof loadSpecs>; pathname: string; onNavigate?: () => void }) {
  return <>
    <NavSection label="GET STARTED"><SimpleLink href="/" label="Introduction" active={pathname === "/"} onNavigate={onNavigate} /><SimpleLink href="/components" label="Components" active={pathname === "/components"} onNavigate={onNavigate} /></NavSection>
    <NavSection label="EXPLORE"><SimpleLink href="/collections" label="Collections" active={pathname === "/collections"} onNavigate={onNavigate} /><SimpleLink href="/changelog" label="Changelog" active={pathname === "/changelog"} onNavigate={onNavigate} /><SimpleLink href="/components?view=trending" label="Trending" onNavigate={onNavigate} /></NavSection>
    <NavSection label="CATEGORIES"><div className="space-y-0.5">{CATEGORIES.map((category) => { const href = `/docs/${category.slug}`; const active = pathname.startsWith(href); const Icon = CATEGORY_ICONS[category.slug]; const count = specs.filter((spec) => spec.category === category.slug).length; return <Link key={category.slug} href={href} onClick={onNavigate} className={cn("flex items-center gap-2 px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground", active ? "bg-muted text-foreground" : "text-muted-foreground")}>{Icon && <Icon className="size-3.5" />}<span>{category.label}</span><span className="ml-auto tabular-nums">{count}</span></Link>; })}</div></NavSection>
    <NavSection label="ALL COMPONENTS"><div className="space-y-0.5 text-muted-foreground">{specs.slice(0, 7).map((spec) => <Link key={`${spec.category}/${spec.slug}`} href={`/docs/${spec.category}/${spec.slug}`} onClick={onNavigate} className="block px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground">{spec.name}</Link>)}<Link href="/components" onClick={onNavigate} className="mt-2 block px-2 py-1.5 text-accent hover:underline">View all</Link></div></NavSection>
  </>;
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) { return <section className="mb-6 last:border-0"><h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</h2>{children}</section>; }
function SimpleLink({ href, label, active = false, onNavigate }: { href: string; label: string; active?: boolean; onNavigate?: () => void }) { return <Link href={href} onClick={onNavigate} className={cn("block px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground", active ? "bg-muted text-foreground" : "text-muted-foreground")}>{label}</Link>; }
