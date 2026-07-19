"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";

export interface DepthItem {
  title: string;
  /** 이미지 URL. 없으면 hue 기반 그라디언트 카드 렌더 */
  image?: string;
  hue?: number;
}

export interface DepthCarouselProps {
  items?: DepthItem[];
  /** 옆 카드가 밀려나는 간격(px) */
  spacing?: number;
  /** 옆 카드 축소 비율 (장당) */
  depthScale?: number;
  /** 옆 카드 블러 강도 (장당 px) */
  depthBlur?: number;
}

const DEFAULT_ITEMS: DepthItem[] = [
  { title: "Onsen", hue: 355 },
  { title: "Fjord", hue: 205 },
  { title: "Sahara", hue: 35 },
  { title: "Taiga", hue: 150 },
  { title: "Lagoon", hue: 180 },
  { title: "Dusk", hue: 275 },
];

/**
 * 중앙 카드를 축으로 옆 카드들이 깊이감 있게 물러나는 3D 뎁스 캐러셀.
 * 거리에 비례한 스케일·블러·디밍이 겹쳐 실제 초점 거리를 흉내 낸다.
 */
export function DepthCarousel({
  items = DEFAULT_ITEMS,
  spacing = 150,
  depthScale = 0.14,
  depthBlur = 1.6,
}: DepthCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(Math.floor(items.length / 2));

  function onDragEnd(_: unknown, info: PanInfo) {
    const move = Math.round(-info.offset.x / 120) || (Math.abs(info.velocity.x) > 500 ? (info.velocity.x < 0 ? 1 : -1) : 0);
    setActive((a) => Math.min(items.length - 1, Math.max(0, a + move)));
  }

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 250, damping: 28 };

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <motion.div
        className="relative h-72 w-full max-w-lg cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
        drag={reducedMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ perspective: 800 }}
        role="group"
        aria-roledescription="carousel"
        aria-label="뎁스 이미지 캐러셀"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
          else if (e.key === "ArrowRight") setActive((a) => Math.min(items.length - 1, a + 1));
          else return;
          e.preventDefault();
        }}
      >
        {items.map((item, i) => {
          const delta = i - active;
          const dist = Math.abs(delta);
          const isActive = delta === 0;
          return (
            <motion.div
              key={i}
              animate={{
                x: delta * spacing,
                scale: Math.max(1 - dist * depthScale, 0.4),
                rotateY: delta * -9,
                filter: `blur(${dist * depthBlur}px) brightness(${1 - Math.min(dist * 0.16, 0.5)})`,
                opacity: dist > 2.5 ? 0 : 1,
              }}
              transition={spring}
              className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-44 -translate-x-1/2 -translate-y-1/2"
              style={{ zIndex: 20 - dist }}
              aria-hidden={!isActive}
            >
              <div
                className="h-full w-full overflow-hidden rounded-2xl ring-1 ring-white/10"
                style={{
                  boxShadow: isActive
                    ? "0 28px 56px -16px rgba(0,0,0,0.55)"
                    : "0 14px 28px -10px rgba(0,0,0,0.4)",
                }}
              >
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" draggable={false} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="relative h-full w-full"
                    style={{
                      background: `linear-gradient(160deg, hsl(${item.hue ?? 240} 55% 48%), hsl(${((item.hue ?? 240) + 40) % 360} 60% 24%))`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.1]"
                      style={{
                        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                        backgroundSize: "15px 15px",
                      }}
                    />
                    <span className="absolute bottom-3.5 left-3.5 text-xs font-semibold uppercase tracking-widest text-white/85">
                      {item.title}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="flex items-center gap-1.5" aria-hidden="true">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => setActive(i)}
            className="h-1.5 rounded-full bg-current transition-all duration-300"
            style={{ width: active === i ? 16 : 6, opacity: active === i ? 0.9 : 0.25 }}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {items[active]?.title}
      </p>
    </div>
  );
}
