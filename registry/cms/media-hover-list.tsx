"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

export interface MediaHoverItem {
  title: string;
  meta: string;
  /** 미리보기 카드의 그라디언트 (CSS background 값) */
  media: string;
}

export interface MediaHoverListProps {
  items?: MediaHoverItem[];
  cardWidth?: number;
  tilt?: boolean;
}

const DEFAULT_ITEMS: MediaHoverItem[] = [
  { title: "Aurora identity system", meta: "Branding · 2026", media: "linear-gradient(135deg,#6366f1,#a855f7)" },
  { title: "Nebula commerce app", meta: "Product · 2026", media: "linear-gradient(135deg,#f97316,#ef4444)" },
  { title: "Vertex data platform", meta: "Web · 2025", media: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { title: "Halo motion reel", meta: "Film · 2025", media: "linear-gradient(135deg,#22c55e,#14b8a6)" },
];

/**
 * 프로젝트 목록에 커서를 올리면 미디어 미리보기 카드가
 * 커서를 스프링으로 따라다니는 포트폴리오형 리스트.
 */
export function MediaHoverList({ items = DEFAULT_ITEMS, cardWidth = 176, tilt = true }: MediaHoverListProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springX = useSpring(mx, { stiffness: 260, damping: 26, mass: 0.6 });
  const springY = useSpring(my, { stiffness: 260, damping: 26, mass: 0.6 });
  const rotate = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const lastX = useRef(0);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mx.set(x);
    my.set(y);
    if (tilt) {
      const velocity = x - lastX.current;
      rotate.set(Math.max(-12, Math.min(12, velocity * 0.6)));
      lastX.current = x;
    }
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setActiveIndex(null)}
      className="relative w-full max-w-md"
    >
      <ul className="flex flex-col">
        {items.map((item, i) => (
          <li key={item.title}>
            <button
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(null)}
              className="group flex w-full items-baseline justify-between gap-4 border-b border-border py-4 text-left transition-colors hover:border-accent/40"
            >
              <span className="text-base font-semibold tracking-tight transition-transform duration-300 group-hover:translate-x-2">
                {item.title}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{item.meta}</span>
            </button>
          </li>
        ))}
      </ul>

      {!reducedMotion && activeIndex !== null && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            x: springX,
            y: springY,
            rotate: tilt ? rotate : 0,
            width: cardWidth,
            height: cardWidth * 0.68,
            background: items[activeIndex].media,
            translateX: "-50%",
            translateY: "-115%",
          }}
          transition={{ duration: 0.2 }}
          className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden rounded-lg shadow-2xl"
        >
          <div className="absolute inset-x-0 bottom-0 bg-black/35 px-2.5 py-1.5 text-[10px] font-medium text-white backdrop-blur-sm">
            {items[activeIndex].title}
          </div>
        </motion.div>
      )}
    </div>
  );
}
