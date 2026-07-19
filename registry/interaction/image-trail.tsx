"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

export interface ImageTrailProps {
  /** 트레일로 뿌려질 이미지 URL들. 없으면 hue 그라디언트 카드 */
  images?: string[];
  /** 새 이미지가 생성되는 이동 거리(px) */
  spawnDistance?: number;
  /** 이미지가 사라지기까지의 시간(초) */
  lifetime?: number;
  /** 카드 크기(px) */
  size?: number;
  /** 최대 동시 표시 개수 */
  maxCount?: number;
}

interface TrailItem {
  id: number;
  x: number;
  y: number;
  rotate: number;
  visual: number;
}

const HUES = [250, 20, 180, 320, 140, 60, 210, 290];

/**
 * 커서가 지나간 자리에 이미지가 흩뿌려지며 따라오는 트레일 인터랙션.
 * 이동 거리 기반 스폰과 스프링 등장·퇴장으로 에이전시 히어로의 질감을 낸다.
 */
export function ImageTrail({
  images,
  spawnDistance = 34,
  lifetime = 0.9,
  size = 104,
  maxCount = 10,
}: ImageTrailProps) {
  const reducedMotion = useReducedMotion();
  const [items, setItems] = useState<TrailItem[]>([]);
  const acc = useRef({ x: 0, y: 0, dist: 0, id: 0 });
  const visuals = images && images.length > 0 ? images.length : HUES.length;

  function onPointerMove(e: React.PointerEvent) {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const a = acc.current;
    a.dist += Math.hypot(x - a.x, y - a.y);
    a.x = x;
    a.y = y;
    if (a.dist < spawnDistance) return;
    a.dist = 0;
    const id = a.id++;
    const item: TrailItem = {
      id,
      x,
      y,
      rotate: (Math.random() - 0.5) * 22,
      visual: id % visuals,
    };
    setItems((prev) => [...prev.slice(-(maxCount - 1)), item]);
    setTimeout(() => {
      setItems((prev) => prev.filter((p) => p.id !== id));
    }, lifetime * 1000);
  }

  return (
    <div
      onPointerMove={onPointerMove}
      className="relative h-80 w-full overflow-hidden rounded-2xl bg-zinc-950"
    >
      <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm uppercase tracking-[0.3em] text-white/30">
        Move your cursor
      </p>

      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0.3, opacity: 0, rotate: item.rotate * 2 }}
            animate={{ scale: 1, opacity: 1, rotate: item.rotate }}
            exit={{ scale: 0.6, opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="pointer-events-none absolute overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/15"
            style={{
              left: item.x - size / 2,
              top: item.y - size * 0.65,
              width: size,
              height: size * 1.3,
            }}
          >
            {images && images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[item.visual]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  background: `linear-gradient(155deg, hsl(${HUES[item.visual]} 60% 52%), hsl(${(HUES[item.visual] + 45) % 360} 65% 26%))`,
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
