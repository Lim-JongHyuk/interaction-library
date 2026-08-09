import Link from "next/link";
import { loadSpecs } from "@/lib/load-specs";
import { ComponentCard } from "@/components/site/component-card";

export default function Home() {
  const specs = loadSpecs();

  return (
    <div className="mk-home min-h-full px-4 pb-8 pt-5 md:px-6 md:pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
        <nav aria-label="Library views" className="flex items-center gap-3 font-mono text-sm">
          <Link href="/" className="bg-muted px-2.5 py-2 font-semibold text-foreground">
            Components
          </Link>
          <a href="#sections" className="px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground">
            Sections
          </a>
        </nav>
        <Link
          href="/components"
          className="border border-foreground bg-foreground px-3 py-2 font-mono text-xs font-semibold text-background transition-opacity hover:opacity-80"
        >
          Browse all →
        </Link>
      </div>

      <p className="mb-6 inline-flex border border-border bg-muted px-3 py-2 font-mono text-xs text-foreground/90">
        ORBIT is in beta. Motion components in orbit.
      </p>

      <section aria-label="Component gallery" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {specs.map((spec) => (
          <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} gallery />
        ))}
      </section>
    </div>
  );
}
