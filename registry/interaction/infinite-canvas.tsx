"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame, useReducedMotion } from "motion/react";

export interface InfiniteCanvasProps {
  /** 타일 한 변 크기(px) */
  cellSize?: number;
  /** 타일 간격(px) */
  gap?: number;
  /** 관성: 놓은 뒤 미끄러짐 유지율 (0.8=짧게, 0.98=길게) */
  momentum?: number;
  /** 가만히 두면 천천히 흐르는 자동 드리프트 */
  drift?: boolean;
  /** 타일 이미지 URL들. 없으면 그라디언트 카드 */
  images?: string[];
}

const HUES = [252, 24, 190, 322, 152, 62, 210, 288, 8, 172];

/**
 * 사방으로 끝없이 이어지는 드래그 캔버스. 타일 좌표를 그리드 총폭으로
 * 모듈러 랩핑해 무한처럼 보이게 하고, 릴리즈 후에는 관성 감쇠·자동
 * 드리프트를 rAF에서 DOM transform으로 직접 갱신한다(리렌더 없음).
 */
export function InfiniteCanvas({
  cellSize = 220,
  gap = 16,
  momentum = 0.92,
  drift = true,
  images,
}: InfiniteCanvasProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const state = useRef({ x: 0, y: 0, vx: 0, vy: 0, dragging: false, px: 0, py: 0 });

  const step = cellSize + gap;

  // 컨테이너 크기에 맞춰 필요한 타일 수 계산 (양방향 +1줄 여유)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setGrid({
        cols: Math.ceil(width / step) + 1,
        rows: Math.ceil(height / step) + 1,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  useAnimationFrame(() => {
    const s = state.current;
    if (!s.dragging) {
      if (reducedMotion) {
        s.vx = 0;
        s.vy = 0;
      } else {
        // momentum 비율로 감쇠하며 드리프트 목표 속도에 수렴
        const tx = drift ? -0.3 : 0;
        const ty = drift ? -0.14 : 0;
        s.vx = s.vx * momentum + tx * (1 - momentum);
        s.vy = s.vy * momentum + ty * (1 - momentum);
        s.x += s.vx;
        s.y += s.vy;
      }
    }
    const totalW = grid.cols * step;
    const totalH = grid.rows * step;
    if (!totalW || !totalH) return;
    tileRefs.current.forEach((tile, i) => {
      if (!tile) return;
      const c = i % grid.cols;
      const r = Math.floor(i / grid.cols);
      const x = mod(c * step + s.x, totalW) - step;
      const y = mod(r * step + s.y, totalH) - step;
      tile.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });

  function onPointerDown(e: React.PointerEvent) {
    const s = state.current;
    s.dragging = true;
    s.px = e.clientX;
    s.py = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.px;
    const dy = e.clientY - s.py;
    s.px = e.clientX;
    s.py = e.clientY;
    s.x += dx;
    s.y += dy;
    s.vx = dx;
    s.vy = dy;
  }
  function onPointerUp() {
    state.current.dragging = false;
  }
  function onKeyDown(e: React.KeyboardEvent) {
    const s = state.current;
    const d = 60;
    if (e.key === "ArrowLeft") s.x += d;
    else if (e.key === "ArrowRight") s.x -= d;
    else if (e.key === "ArrowUp") s.y += d;
    else if (e.key === "ArrowDown") s.y -= d;
    else return;
    e.preventDefault();
  }

  const total = grid.cols * grid.rows;

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="드래그로 탐색하는 무한 캔버스. 방향키로도 이동할 수 있습니다"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className="relative h-96 w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
    >
      {Array.from({ length: total }).map((_, i) => {
        const c = i % grid.cols;
        const r = Math.floor(i / grid.cols);
        const visual = (r * 7 + c * 3) % HUES.length;
        const image = images && images.length > 0 ? images[i % images.length] : undefined;
        return (
          <div
            key={i}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              width: cellSize,
              height: cellSize,
              transform: `translate3d(${c * step}px, ${r * step}px, 0)`,
            }}
            aria-hidden="true"
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                draggable={false}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full flex-col justify-between rounded-xl p-4 ring-1 ring-white/10"
                style={{
                  background: `linear-gradient(145deg, hsl(${HUES[visual]} 45% 16%), hsl(${(HUES[visual] + 40) % 360} 55% 9%))`,
                }}
              >
                <span
                  className="text-xs font-mono tracking-widest"
                  style={{ color: `hsl(${HUES[visual]} 85% 72%)` }}
                >
                  {String(visual + 1).padStart(2, "0")}
                </span>
                <div
                  className="h-1/2 w-full rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, hsl(${HUES[visual]} 75% 60% / 0.85), hsl(${(HUES[visual] + 60) % 360} 75% 45% / 0.85))`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}

      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50 backdrop-blur">
        Drag to explore
      </p>
    </div>
  );
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
