import Link from "next/link";
import { loadSpecs } from "@/lib/load-specs";
import { CATEGORIES } from "@/lib/categories";
import { ComponentCard } from "@/components/site/component-card";

const featuredSlugs = ["ripple-distortion", "molten-metal", "web-threads", "halftone-reveal", "fluid-glass", "swarm-cursor"];

export default function Home() {
  const specs = loadSpecs();
  const featured = featuredSlugs
    .map((slug) => specs.find((spec) => spec.slug === slug))
    .filter((spec): spec is NonNullable<typeof spec> => Boolean(spec));

  return (
    <main className="orbit-home min-h-full px-4 py-4 md:px-6 md:py-6 lg:px-8">
      <section className="orbit-hero relative overflow-hidden border border-border px-5 py-7 sm:px-8 sm:py-10 lg:min-h-[440px] lg:px-12 lg:py-12">
        <div className="orbit-hero-grid" aria-hidden="true" />
        <div className="orbit-signal orbit-signal-a" aria-hidden="true" />
        <div className="orbit-signal orbit-signal-b" aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-10">
          <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-accent" /> Motion systems / 01</span>
            <span>{specs.length} live studies</span>
          </div>

          <div className="max-w-3xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-accent">Build with a pulse</p>
            <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[0.96] tracking-[-0.065em] text-foreground sm:text-6xl lg:text-7xl">
              Motion that gives interfaces a reason to exist.
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              A working archive of tactile React components—made to preview, tune, and ship without slowing the product down.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/components" className="bg-foreground px-4 py-3 font-mono text-xs font-semibold text-background transition-transform hover:-translate-y-0.5">
              Explore all components <span aria-hidden="true">→</span>
            </Link>
            <a href="#featured" className="border border-border bg-background/60 px-4 py-3 font-mono text-xs font-semibold text-foreground transition-colors hover:border-foreground">
              View featured studies
            </a>
          </div>
        </div>
      </section>

      <section aria-labelledby="categories-title" className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Choose a system</p><h2 id="categories-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Browse by behavior</h2></div>
          <Link href="/components" className="font-mono text-xs text-muted-foreground hover:text-foreground">Open full index →</Link>
        </div>
        <div className="grid border-l border-t border-border sm:grid-cols-2 xl:grid-cols-4">
          {CATEGORIES.map((category) => {
            const count = specs.filter((spec) => spec.category === category.slug).length;
            return <Link key={category.slug} href={`/docs/${category.slug}`} className="group flex min-h-24 items-end justify-between border-b border-r border-border bg-background px-4 py-4 transition-colors hover:bg-muted"><span className="text-lg font-medium tracking-tight">{category.label}</span><span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-accent">{String(count).padStart(2, "0")} ↗</span></Link>;
          })}
        </div>
      </section>

      <section id="featured" aria-labelledby="featured-title" className="mt-12 scroll-mt-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Selected studies</p><h2 id="featured-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Start with the parts people notice.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">Six high-signal components, selected for expressive product surfaces.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((spec) => <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} />)}
        </div>
      </section>

      <section className="mt-12 border-y border-border py-8 sm:flex sm:items-end sm:justify-between sm:gap-8">
        <div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Ready when you are</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Find the interaction. Make it yours.</h2></div>
        <Link href="/components" className="mt-5 inline-flex border-b border-foreground pb-1 font-mono text-xs font-semibold text-foreground sm:mt-0">Browse the full library →</Link>
      </section>
    </main>
  );
}
