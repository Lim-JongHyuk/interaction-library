"use client";

// deps: motion
import { useState } from "react";
import { useReducedMotion } from "motion/react";

export interface ExpandingPanel {
  title: string;
  subtitle: string;
  /** 패널 배경 hue (0–360) */
  hue?: number;
  /** 이미지 URL. 지정하면 패널 배경으로 렌더 */
  image?: string;
}

export interface ExpandingPanelsProps {
  panels?: ExpandingPanel[];
  /** 열린 패널이 차지하는 flex 비율 */
  expandFlex?: number;
  /** 패널 사이 간격(px) */
  gap?: number;
  /** 라벨·강조 액센트 색 */
  accent?: string;
}

const DEFAULT_PANELS: ExpandingPanel[] = [
  { title: "Reykjavík", subtitle: "Aurora expeditions", hue: 220 },
  { title: "Kyoto", subtitle: "Temple gardens", hue: 150 },
  { title: "Marrakesh", subtitle: "Desert markets", hue: 28 },
  { title: "Lisbon", subtitle: "Tiled coastline", hue: 190 },
  { title: "Seoul", subtitle: "Neon after dark", hue: 320 },
];

/**
 * 가로로 나열된 패널이 hover·focus 시 부드럽게 펼쳐지고 나머지는 접히는
 * 확장형 갤러리. flex-grow 트랜지션 기반이라 이미지 없이도 편집 감각이 산다.
 */
export function ExpandingPanels({
  panels = DEFAULT_PANELS,
  expandFlex = 5,
  gap = 12,
  accent = "#6366f1",
}: ExpandingPanelsProps) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  return (
    <div
      role="group"
      aria-label="확장형 갤러리"
      className="flex h-[380px] w-full px-6 py-8"
      style={{ gap }}
    >
      {panels.map((panel, i) => {
        const isActive = i === active;
        const hue = panel.hue ?? 250;
        return (
          <button
            key={i}
            type="button"
            aria-expanded={isActive}
            aria-label={`${panel.title} — ${panel.subtitle}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="relative overflow-hidden rounded-2xl text-left outline-none ring-white/40 [transition-property:flex-grow] ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2"
            style={{
              flexGrow: isActive ? expandFlex : 1,
              flexBasis: 0,
              transitionDuration: reducedMotion ? "0ms" : "600ms",
              background: panel.image
                ? undefined
                : `linear-gradient(160deg, hsl(${hue} 62% 48%), hsl(${(hue + 40) % 360} 68% 22%))`,
            }}
          >
            {panel.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={panel.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" aria-hidden="true" />

            {/* 접힌 상태: 세로 라벨 */}
            <span
              className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-semibold tracking-wide text-white [writing-mode:vertical-rl] transition-opacity duration-300"
              style={{ opacity: isActive ? 0 : 1 }}
              aria-hidden="true"
            >
              {panel.title}
            </span>

            {/* 열린 상태: 가로 라벨 블록 */}
            <span
              className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 transition-opacity duration-300"
              style={{ opacity: isActive ? 1 : 0 }}
              aria-hidden="true"
            >
              <span className="h-1 w-8 rounded-full" style={{ backgroundColor: accent }} />
              <span className="mt-1 text-xl font-semibold text-white">{panel.title}</span>
              <span className="text-sm text-white/75">{panel.subtitle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
