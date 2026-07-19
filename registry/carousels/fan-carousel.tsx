"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";

export interface FanCard {
  title: string;
  /** 이미지 URL. 없으면 hue 기반 그라디언트 카드 렌더 */
  image?: string;
  hue?: number;
}

export interface FanCarouselProps {
  items?: FanCard[];
  /** 카드 사이 각도(deg) */
  spread?: number;
  /** 활성 카드가 떠오르는 높이(px) */
  lift?: number;
  /** 부채 회전 중심까지의 거리(px). 클수록 완만한 호 */
  radius?: number;
}

const DEFAULT_ITEMS: FanCard[] = [
  { title: "Midnight", hue: 250 },
  { title: "Ember", hue: 15 },
  { title: "Moss", hue: 140 },
  { title: "Tide", hue: 195 },
  { title: "Orchid", hue: 300 },
];

/**
 * 손에 쥔 카드처럼 부채꼴로 펼쳐진 카루셀. 좌우로 드래그해 부채를 돌리고,
 * 중앙에 온 카드가 떠오른다. 릴리즈하면 가장 가까운 카드에 스냅.
 */
export function FanCarousel({
  items = DEFAULT_ITEMS,
  spread = 14,
  lift = 36,
  radius = 420,
}: FanCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(Math.floor(items.length / 2));
  // 드래그 중 부채의 소수점 오프셋 (카드 단위)
  const [dragShift, setDragShift] = useState(0);
  const dragStart = useRef(0);

  const PX_PER_CARD = 90; // 드래그 픽셀 → 카드 1장

  function onDrag(_: unknown, info: PanInfo) {
    setDragShift(-(info.point.x - dragStart.current) / PX_PER_CARD);
  }
  function onDragEnd(_: unknown, info: PanInfo) {
    const flick = -info.velocity.x / 800;
    const raw = active + dragShift + flick;
    const next = Math.min(items.length - 1, Math.max(0, Math.round(raw)));
    setActive(next);
    setDragShift(0);
  }

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 240, damping: 26 };

  const shift = active + dragShift;

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative h-72 w-full max-w-md cursor-grab touch-none select-none active:cursor-grabbing"
        drag={reducedMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={(_, info) => {
          dragStart.current = info.point.x;
        }}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        role="group"
        aria-roledescription="carousel"
        aria-label="팬 카드 카루셀"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setActive((a) => Math.max(0, a - 1));
          else if (e.key === "ArrowRight") setActive((a) => Math.min(items.length - 1, a + 1));
          else return;
          e.preventDefault();
        }}
      >
        {items.map((card, i) => {
          const delta = i - shift;
          const angle = delta * spread;
          const isActive = Math.abs(delta) < 0.5;
          return (
            <motion.div
              key={i}
              animate={{
                rotate: angle,
                y: isActive ? -lift : 0,
                scale: isActive ? 1.04 : 1,
              }}
              transition={spring}
              className="pointer-events-none absolute left-1/2 top-8 h-52 w-36 -ml-18"
              style={{
                transformOrigin: `50% ${radius}px`,
                zIndex: 10 - Math.round(Math.abs(delta)),
              }}
              aria-hidden={!isActive}
            >
              <div className="h-full w-full overflow-hidden rounded-xl shadow-xl ring-1 ring-black/10">
                {card.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.image} alt="" draggable={false} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="relative h-full w-full"
                    style={{
                      background: `linear-gradient(160deg, hsl(${card.hue ?? 240} 55% 50%), hsl(${((card.hue ?? 240) + 40) % 360} 60% 26%))`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-[0.1]"
                      style={{
                        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                        backgroundSize: "14px 14px",
                      }}
                    />
                    <span className="absolute bottom-3 left-3 text-xs font-semibold uppercase tracking-widest text-white/85">
                      {card.title}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 인디케이터 */}
      <div className="flex gap-1.5" aria-hidden="true">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => setActive(i)}
            className="h-1.5 w-1.5 rounded-full bg-current transition-opacity duration-200"
            style={{ opacity: active === i ? 0.9 : 0.25 }}
          />
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {items[active]?.title}
      </p>
    </div>
  );
}
