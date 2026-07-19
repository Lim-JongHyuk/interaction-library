"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export interface PixelHeroProps {
  title?: string;
  subtitle?: string;
  pixelSize?: number;
  duration?: number;
  color?: string;
}

// 고정 캔버스 비율(16:7) 기준으로 셀 수를 계산하고 상한(~500)을 적용
function makeGrid(pixelSize: number) {
  const cols = Math.min(40, Math.max(8, Math.round(480 / pixelSize)));
  const rows = Math.min(14, Math.max(4, Math.round(210 / pixelSize)));
  const delays = Array.from({ length: cols * rows }, () => Math.random());
  return { cols, rows, delays };
}

/**
 * 콘텐츠 위를 덮은 픽셀 그리드가 무작위 순서로 디졸브되며 히어로를 드러낸다.
 * 픽셀 개수는 성능을 위해 내부적으로 상한(~500)이 있다.
 */
export function PixelHero({
  title = "Pixels, dissolved.",
  subtitle = "A hero that de-materializes into view.",
  pixelSize = 28,
  duration = 1.4,
  color = "#4f46e5",
}: PixelHeroProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [replaySeed, setReplaySeed] = useState(0);

  // 랜덤 딜레이는 렌더 순수성을 지키기 위해 state로 보관하고,
  // pixelSize/replaySeed가 바뀔 때만 렌더 중 조정 패턴으로 재생성한다.
  const [grid, setGrid] = useState(() => makeGrid(pixelSize));
  const [prevKey, setPrevKey] = useState(`${pixelSize}-${replaySeed}`);
  const gridKey = `${pixelSize}-${replaySeed}`;
  if (prevKey !== gridKey) {
    setPrevKey(gridKey);
    setGrid(makeGrid(pixelSize));
  }

  const play = inView && !reducedMotion;

  return (
    <div
      ref={ref}
      onClick={() => setReplaySeed((s) => s + 1)}
      className="relative flex aspect-[16/7] w-full max-w-lg cursor-pointer select-none items-center justify-center overflow-hidden rounded-xl border border-border bg-[#0a0a0f]"
    >
      <div className="relative z-0 px-6 text-center">
        <p className="text-2xl font-semibold tracking-tight text-white">{title}</p>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>

      {!reducedMotion && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 grid"
          style={{
            gridTemplateColumns: `repeat(${grid.cols}, 1fr)`,
            gridTemplateRows: `repeat(${grid.rows}, 1fr)`,
          }}
        >
          {grid.delays.map((delay, i) => (
            <motion.span
              key={`${replaySeed}-${i}`}
              initial={{ opacity: 1 }}
              animate={play ? { opacity: 0 } : { opacity: 1 }}
              transition={{ duration: 0.25, delay: delay * duration, ease: "easeOut" }}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
