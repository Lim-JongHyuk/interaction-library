import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { loadSpecs } from "@/lib/load-specs";
import { ComponentCard } from "@/components/site/component-card";
import { ShuffleText } from "@/registry/typography/shuffle";
import { AuroraMesh } from "@/registry/backgrounds/aurora-mesh";

const FEATURED = [
  "typography/shuffle",
  "interaction/iridescent-logo-3d",
  "data/location-globe",
  "buttons/magnetic-button",
  "sections/faq-accordion",
  "carousels/coverflow-carousel",
];

export default function Home() {
  const specs = loadSpecs();
  const featured = FEATURED.map((key) => specs.find((s) => `${s.category}/${s.slug}` === key)).filter(
    (s): s is (typeof specs)[number] => Boolean(s)
  );

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="relative flex min-h-[420px] items-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 opacity-70">
          <AuroraMesh speed={20} intensity={0.4} />
        </div>
        <div className="relative mx-auto flex max-w-2xl flex-col items-start gap-5 px-6 py-24">
          <span className="rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            {specs.length} components · {CATEGORIES.length} categories
          </span>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            <ShuffleText text="Motion, defined." />
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            움직임(motion)을 정의하고, 미리보고, 바로 가져다 쓰는 오픈 컴포넌트 갤러리.
          </p>
          <div className="flex gap-3">
            <Link
              href="/components"
              className="mk-border-beam rounded-lg border border-border bg-background/80 px-5 py-2.5 text-sm font-semibold backdrop-blur transition-colors hover:bg-muted"
            >
              Browse components
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-muted"
            >
              GitHub ★
            </a>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-20 px-6">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {CATEGORIES.map((c) => {
              const count = specs.filter((s) => s.category === c.slug).length;
              return (
                <Link
                  key={c.slug}
                  href={`/docs/${c.slug}`}
                  className="flex flex-col items-center gap-1 rounded-xl border border-border p-4 text-center transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-muted"
                >
                  <span className="text-sm font-medium">{c.label}</span>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">New &amp; Popular</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((spec) => (
              <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
