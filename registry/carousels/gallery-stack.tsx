"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";

export interface StackCard {
  title: string;
  subtitle?: string;
  /** 이미지 URL. 없으면 hue 기반 그라디언트 카드 렌더 */
  image?: string;
  hue?: number;
}

export interface GalleryStackProps {
  items?: StackCard[];
  /** 뒤 카드가 아래로 밀리는 간격(px) */
  offset?: number;
  /** 뒤 카드 축소 비율 (장당) */
  scaleStep?: number;
  /** 드래그 방출 임계값(px) */
  threshold?: number;
}

const DEFAULT_ITEMS: StackCard[] = [
  { title: "Editorial 01", subtitle: "Art direction", hue: 250 },
  { title: "Branding kit", subtitle: "Identity", hue: 180 },
  { title: "Lookbook SS26", subtitle: "Photography", hue: 20 },
  { title: "Type specimen", subtitle: "Typography", hue: 320 },
  { title: "Poster series", subtitle: "Print", hue: 130 },
];

/**
 * 맨 위 카드를 드래그해 넘기는 갤러리 스택. 임계값을 넘기면 카드가
 * 스택 맨 뒤로 순환하고, 아래 카드들이 스프링으로 한 칸씩 올라온다.
 */
export function GalleryStack({
  items = DEFAULT_ITEMS,
  offset = 16,
  scaleStep = 0.05,
  threshold = 110,
}: GalleryStackProps) {
  const reducedMotion = useReducedMotion();
  // order[0] = 맨 위 카드의 items 인덱스
  const [order, setOrder] = useState<number[]>(() => items.map((_, i) => i));

  function advance() {
    setOrder((o) => [...o.slice(1), o[0]]);
  }
  function goBack() {
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > 600) {
      advance();
    }
  }

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 28 };

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative h-72 w-56"
        role="group"
        aria-roledescription="carousel"
        aria-label="갤러리 스택"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") advance();
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goBack();
          else return;
          e.preventDefault();
        }}
      >
        {items.map((card, i) => {
          const pos = order.indexOf(i); // 0 = top
          const isTop = pos === 0;
          const hidden = pos > 3; // 4장까지만 보이게
          return (
            <motion.div
              key={i}
              drag={isTop && !reducedMotion ? true : false}
              dragMomentum={false}
              dragElastic={0.65}
              onDragEnd={isTop ? onDragEnd : undefined}
              animate={{
                x: 0,
                y: pos * offset,
                scale: 1 - pos * scaleStep,
                rotate: 0,
                opacity: hidden ? 0 : 1,
              }}
              transition={spring}
              tabIndex={isTop ? 0 : -1}
              aria-label={`${card.title} (${pos + 1}/${items.length})`}
              aria-hidden={!isTop}
              className={
                "absolute inset-0 select-none overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10 outline-none focus-visible:ring-2 " +
                (isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")
              }
              style={{ zIndex: items.length - pos, touchAction: "none" }}
            >
              {card.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={card.image}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(150deg, hsl(${card.hue ?? 240} 55% 48%), hsl(${((card.hue ?? 240) + 45) % 360} 65% 26%))`,
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                      backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-12">
                <p className="text-sm font-semibold text-white">{card.title}</p>
                {card.subtitle && <p className="mt-0.5 text-xs text-white/60">{card.subtitle}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 인디케이터 + 버튼 (터치·키보드·reduced-motion 대체 수단) */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          aria-label="이전 카드"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs opacity-60 transition-opacity hover:opacity-100"
        >
          ←
        </button>
        <div className="flex gap-1.5" aria-hidden="true">
          {items.map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-current transition-opacity duration-200"
              style={{ opacity: order[0] === i ? 0.9 : 0.25 }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={advance}
          aria-label="다음 카드"
          className="flex h-7 w-7 items-center justify-center rounded-full border border-current/20 text-xs opacity-60 transition-opacity hover:opacity-100"
        >
          →
        </button>
      </div>
    </div>
  );
}
