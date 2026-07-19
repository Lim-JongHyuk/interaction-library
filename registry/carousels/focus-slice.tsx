"use client";

// deps: motion
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface SliceItem {
  title: string;
  subtitle?: string;
  /** 이미지 URL. 없으면 hue 기반 그라디언트 렌더 */
  image?: string;
  hue?: number;
}

export interface FocusSliceCarouselProps {
  items?: SliceItem[];
  /** 활성 슬라이스가 차지하는 비율 (다른 슬라이스 대비 배수) */
  expand?: number;
  /** 슬라이스 간격(px) */
  gap?: number;
  /** 자동 순환 간격(초). 0이면 끔 */
  autoPlay?: number;
}

const DEFAULT_ITEMS: SliceItem[] = [
  { title: "Alpine", subtitle: "Switzerland, 2026", hue: 210 },
  { title: "Dune", subtitle: "Morocco, 2025", hue: 28 },
  { title: "Reef", subtitle: "Palau, 2026", hue: 172 },
  { title: "Aurora", subtitle: "Iceland, 2024", hue: 262 },
  { title: "Canyon", subtitle: "Utah, 2025", hue: 8 },
];

/**
 * 호버/탭한 슬라이스가 확장되며 나머지가 압축되는 포커스 갤러리.
 * 스프링 기반 flex 전환과 캡션 리빌로 밀도 높은 카루셀을 만든다.
 */
export function FocusSliceCarousel({
  items = DEFAULT_ITEMS,
  expand = 3.4,
  gap = 8,
  autoPlay = 0,
}: FocusSliceCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);

  // 자동 순환 (호버 중이거나 reduced-motion이면 정지)
  useEffect(() => {
    if (autoPlay <= 0 || hovering || reducedMotion) return;
    const id = setInterval(() => {
      setActive((a) => (a + 1) % items.length);
    }, autoPlay * 1000);
    return () => clearInterval(id);
  }, [autoPlay, hovering, reducedMotion, items.length]);

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 260, damping: 30 };

  return (
    <div
      className="flex h-72 w-full"
      style={{ gap }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      role="listbox"
      aria-label="포커스 슬라이스 갤러리"
      aria-activedescendant={`slice-${active}`}
    >
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <motion.button
            key={i}
            id={`slice-${i}`}
            type="button"
            role="option"
            aria-selected={isActive}
            aria-label={item.title}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            animate={{ flexGrow: isActive ? expand : 1 }}
            transition={spring}
            className="relative min-w-0 basis-0 cursor-pointer overflow-hidden rounded-2xl outline-none ring-offset-2 focus-visible:ring-2"
            initial={false}
          >
            {/* 배경 */}
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(160deg, hsl(${item.hue ?? 220} 60% 42%), hsl(${((item.hue ?? 220) + 40) % 360} 70% 22%))`,
                }}
              >
                {/* 질감용 노이즈 도트 */}
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />
              </div>
            )}

            {/* 비활성 딤 */}
            <motion.div
              animate={{ opacity: isActive ? 0 : 0.42 }}
              transition={spring}
              className="absolute inset-0 bg-black"
            />

            {/* 캡션 — 활성 시에만 리빌 */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-left">
              <motion.div
                animate={
                  isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
                }
                transition={reducedMotion ? { duration: 0 } : { duration: 0.3, delay: isActive ? 0.12 : 0 }}
              >
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.subtitle && (
                  <p className="mt-0.5 text-xs text-white/60">{item.subtitle}</p>
                )}
              </motion.div>
            </div>

            {/* 세로 라벨 — 비활성 시에만 */}
            <motion.span
              animate={{ opacity: isActive ? 0 : 1 }}
              transition={spring}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] font-medium uppercase tracking-widest text-white/70 [writing-mode:vertical-rl]"
              aria-hidden="true"
            >
              {item.title}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
