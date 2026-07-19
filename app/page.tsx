import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { loadSpecs } from "@/lib/load-specs";
import { siteConfig } from "@/lib/site-config";
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
            {siteConfig.github && (
              <a
                href={siteConfig.github}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-muted"
              >
                GitHub ★
              </a>
            )}
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
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">New &amp; Popular</h2>
            <Link href="/components" className="text-xs text-muted-foreground hover:text-foreground">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((spec) => (
              <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">How it works</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Browse & preview",
                body: "모든 컴포넌트는 라이브로 움직이는 상태에서 고른다. 정지된 스크린샷이 아니라 실제 모션을 본다.",
              },
              {
                step: "02",
                title: "Tune in the studio",
                body: "duration·stagger·easing 같은 파라미터를 슬라이더로 조정하면 사용 코드가 그 값 그대로 갱신된다.",
              },
              {
                step: "03",
                title: "Copy or install",
                body: "소스를 복사하거나 shadcn CLI 한 줄로 설치한다. 의존성은 motion 하나뿐.",
              },
            ].map((f) => (
              <div key={f.step} className="flex flex-col gap-2 rounded-xl border border-border p-5">
                <span className="text-xs font-mono text-accent">{f.step}</span>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border bg-muted px-5 py-4 font-mono text-sm text-muted-foreground">
            <span className="select-none text-accent">$ </span>
            pnpm dlx shadcn@latest add {siteConfig.url}/r/typography/shuffle.json
          </pre>
        </section>
      </div>
    </div>
  );
}
