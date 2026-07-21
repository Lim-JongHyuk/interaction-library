"use client";

// deps: motion  (모션 값 없이도 동작하지만 라이브러리 규약상 reduced-motion 감지에 사용)
import { useRef } from "react";
import { useReducedMotion } from "motion/react";

export interface SpotlightCard {
  title: string;
  body: string;
  /** 카드 좌상단 글리프/이모지 */
  icon?: string;
}

export interface SpotlightCardGridProps {
  cards?: SpotlightCard[];
  /** 스포트라이트 반경(px) */
  size?: number;
  /** 스포트라이트·테두리 액센트 색 */
  accent?: string;
  /** 커서 근처 테두리가 그라디언트로 드러나는 효과 */
  border?: boolean;
}

const DEFAULT_CARDS: SpotlightCard[] = [
  { title: "Edge network", body: "300+ 로케이션에서 밀리초 단위로 응답합니다.", icon: "◎" },
  { title: "Instant rollback", body: "모든 배포는 원자적이며 즉시 되돌릴 수 있습니다.", icon: "↺" },
  { title: "Preview deploys", body: "PR마다 격리된 미리보기 URL이 생성됩니다.", icon: "◇" },
  { title: "Analytics", body: "실사용자 지표를 표본 없이 그대로 수집합니다.", icon: "▤" },
  { title: "Zero config", body: "프레임워크를 감지해 빌드 설정을 자동화합니다.", icon: "✦" },
  { title: "Team access", body: "역할 기반 권한으로 협업을 세밀하게 제어합니다.", icon: "☺" },
];

/**
 * 커서를 따라다니는 공용 스포트라이트를 공유하는 카드 그리드.
 * 각 카드는 컨테이너 포인터의 로컬 좌표를 CSS 변수로 받아 radial-gradient
 * 하이라이트를 그리고, 테두리는 mask-composite로 그라디언트만 도려내 빛난다.
 */
export function SpotlightCardGrid({
  cards = DEFAULT_CARDS,
  size = 260,
  accent = "#6366f1",
  border = true,
}: SpotlightCardGridProps) {
  const reducedMotion = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    if (reducedMotion) return;
    const cards = gridRef.current?.querySelectorAll<HTMLElement>("[data-spot]");
    if (!cards) return;
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  }

  return (
    <div
      ref={gridRef}
      onPointerMove={onMove}
      className="grid w-full gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3"
      style={{ ["--spot" as string]: `${size}px`, ["--accent" as string]: accent } as React.CSSProperties}
    >
      {cards.map((card, i) => (
        <article
          key={i}
          data-spot
          className="group relative overflow-hidden rounded-2xl bg-zinc-900/70 p-6 ring-1 ring-white/10"
        >
          {/* 채움 스포트라이트 */}
          {!reducedMotion && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(var(--spot) circle at var(--mx) var(--my), color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)",
              }}
            />
          )}

          {/* 테두리 리빌: 그라디언트 위에 mask-composite로 1px 링만 남긴다 */}
          {border && !reducedMotion && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] [padding:1px]"
              style={{
                background:
                  "radial-gradient(var(--spot) circle at var(--mx) var(--my), var(--accent), transparent 65%)",
              }}
            />
          )}

          <div className="relative">
            <span
              className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-lg ring-1 ring-white/10"
              style={{ color: accent, background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
              aria-hidden="true"
            >
              {card.icon ?? "•"}
            </span>
            <h3 className="text-base font-semibold text-zinc-100">{card.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{card.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
