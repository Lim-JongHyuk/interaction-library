import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { loadSpecs } from "@/lib/load-specs";
import { siteConfig } from "@/lib/site-config";
import { ComponentCard } from "@/components/site/component-card";
import { ShuffleText } from "@/registry/typography/shuffle";
import { AuroraMesh } from "@/registry/backgrounds/aurora-mesh";
import { BorderBeamButton } from "@/registry/buttons/border-beam-button";
import { LogoMarquee } from "@/registry/cms/logo-marquee";

const FEATURED = [
  "navigation/gooey-menu",
  "embeds/terminal-frame",
  "interaction/iridescent-logo-3d",
  "data/orbit-avatars",
  "forms/otp-input",
  "carousels/coverflow-carousel",
];

export default function Home() {
  const specs = loadSpecs();
  const featured = FEATURED.map((key) => specs.find((s) => `${s.category}/${s.slug}` === key)).filter(
    (s): s is (typeof specs)[number] => Boolean(s)
  );

  return (
    <div className="flex flex-col gap-20 pb-20">
      <section className="relative flex min-h-[520px] items-center overflow-hidden border-b border-border">
        {/* 배경: 오로라 + 가독성용 오버레이 */}
        <div className="absolute inset-0 opacity-60">
          <AuroraMesh speed={20} intensity={0.4} />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/20"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-6 py-24">
          <div className="flex max-w-xl flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {specs.length} components · {CATEGORIES.length} categories · MIT
            </span>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">
              <ShuffleText text="Motion," />
              <br />
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                defined.
              </span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-foreground/70">
              스펙으로 정의된 모션을 라이브로 미리보고, 파라미터를 튜닝한 뒤,
              <br className="hidden sm:block" />
              복사 한 번 또는 CLI 한 줄로 프로젝트에 넣는다.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <BorderBeamButton href="/components" colorFrom="#f97316" colorTo="#e11d48" duration={4}>
                Browse components
              </BorderBeamButton>
              {siteConfig.github && (
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:bg-muted"
                >
                  GitHub ★
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 하단: 데모 워드마크 마퀴 */}
        <div className="absolute inset-x-0 bottom-5 opacity-50">
          <LogoMarquee speed={40} gap={64} />
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
