"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useMotionValue, useAnimationFrame, useReducedMotion } from "motion/react";

export interface TickerItem {
  time: string;
  tag: string;
  headline: string;
}

export interface EditorialTickerProps {
  items?: TickerItem[];
  /** 스크롤 속도 (px/s) */
  speed?: number;
  /** 호버 시 일시정지 */
  pauseOnHover?: boolean;
  /** 위·아래 페이드 마스크 */
  edgeFade?: boolean;
  /** 태그 칩 액센트 색 */
  accent?: string;
}

const DEFAULT_ITEMS: TickerItem[] = [
  { time: "09:41", tag: "Design", headline: "Variable fonts are eating the web, quietly" },
  { time: "10:02", tag: "Release", headline: "MotionKit ships 55 components in one summer" },
  { time: "10:18", tag: "Craft", headline: "Why the best easing curve is the one you never notice" },
  { time: "11:05", tag: "Studio", headline: "Inside a two-person agency billing seven figures" },
  { time: "11:47", tag: "Type", headline: "The return of the serif: portfolios in 2026" },
  { time: "12:30", tag: "Tools", headline: "Prototypes are dead. Long live the artifact" },
];

/**
 * 뉴스 와이어 스타일의 세로 무한 티커. 프레임 기반 래핑으로 이음새 없이
 * 순환하고, 호버하면 멈춰서 읽을 수 있다. 에디토리얼 사이트 사이드바 단골.
 */
export function EditorialTicker({
  items = DEFAULT_ITEMS,
  speed = 28,
  pauseOnHover = true,
  edgeFade = true,
  accent = "#6366f1",
}: EditorialTickerProps) {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const [hovered, setHovered] = useState(false);
  const factor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollHeight / 2;
    if (half <= 0) return;

    const dt = Math.min(delta, 64) / 1000;
    const target = pauseOnHover && hovered ? 0 : 1;
    factor.current += (target - factor.current) * Math.min(dt * 10, 1);

    let next = y.get() - speed * factor.current * dt;
    next = ((next % half) + half) % half;
    y.set(next - half);
  });

  const rows = (ariaHidden: boolean) => (
    <div className="flex flex-col" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <div
          key={i}
          className="group flex cursor-default items-baseline gap-3 border-b border-current/10 py-3.5"
        >
          <span className="shrink-0 text-[11px] tabular-nums opacity-40">{item.time}</span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
          >
            {item.tag}
          </span>
          <span className="min-w-0 truncate text-sm font-medium leading-snug opacity-80 transition-opacity duration-200 group-hover:opacity-100">
            {item.headline}
          </span>
        </div>
      ))}
    </div>
  );

  if (reducedMotion) {
    // 스크롤 없이 정적 목록
    return <div className="w-full max-w-md overflow-hidden">{rows(false)}</div>;
  }

  return (
    <div
      className="h-64 w-full max-w-md overflow-hidden"
      style={
        edgeFade
          ? {
              maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
            }
          : undefined
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div ref={trackRef} style={{ y }}>
        {rows(false)}
        {rows(true)}
      </motion.div>
    </div>
  );
}
