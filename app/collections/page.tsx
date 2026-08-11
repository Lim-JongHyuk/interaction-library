import Link from "next/link";
import { ComponentCard } from "@/components/site/component-card";
import { loadSpecs } from "@/lib/load-specs";
import type { Category } from "@/lib/spec";

export const metadata = { title: "Collections" };

const collectionDefinitions: Array<{ id: string; label: string; title: string; description: string; categories: readonly Category[] }> = [
  { id: "responsive", label: "01 / Responsive motion", title: "Motion that answers back.", description: "Cursor, click, and drag interactions that make an interface feel present without asking users to learn a new pattern.", categories: ["interaction", "buttons"] },
  { id: "atmosphere", label: "02 / Ambient surfaces", title: "Give the canvas its own tempo.", description: "Atmospheric backgrounds designed to support content first, with enough character to make a product feel unmistakably yours.", categories: ["backgrounds"] },
  { id: "narrative", label: "03 / Editorial flow", title: "Make reading a little more physical.", description: "Typography and sections that pace a story, reveal information, and turn a long page into a guided experience.", categories: ["typography", "sections"] },
];

export default function CollectionsPage() {
  const specs = loadSpecs();
  return <main className="mx-auto w-full max-w-[1280px] px-5 py-8 sm:px-8 sm:py-10 lg:px-6 lg:py-12">
    <header className="max-w-2xl border-b border-border pb-8 sm:pb-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Curated paths</p>
      <h1 className="mt-3 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-5xl">Start from an intent, not a component.</h1>
      <p className="mt-5 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">A small set of ready-made directions for the moments that make a product feel more responsive, more expressive, or simply easier to read.</p>
    </header>
    <div className="mt-12 space-y-16 sm:mt-16 sm:space-y-20">
      {collectionDefinitions.map((collection) => {
        const featured = specs.filter((spec) => collection.categories.includes(spec.category)).slice(0, 4);
        return <section key={collection.id} aria-labelledby={`${collection.id}-title`} className="grid gap-7 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-12">
          <div className="lg:pt-2"><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{collection.label}</p><h2 id={`${collection.id}-title`} className="mt-3 text-3xl font-semibold leading-[1.02] tracking-[-0.045em]">{collection.title}</h2><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">{collection.description}</p><Link href={`/components?category=${collection.categories[0]}`} className="mt-6 inline-flex items-center gap-2 border-b border-foreground pb-1 font-mono text-xs font-semibold text-foreground transition-colors hover:border-accent hover:text-accent">Browse this direction <span aria-hidden="true">→</span></Link></div>
          <div className="grid gap-3 sm:grid-cols-2">{featured.map((spec) => <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} />)}</div>
        </section>;
      })}
    </div>
  </main>;
}
