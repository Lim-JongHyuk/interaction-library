"use client";

// deps: 없음 (CSS 3D transforms)
import { useEffect, useRef } from "react";

export interface PanoramaItem {
  title: string;
  /** 이미지 URL. 없으면 hue 기반 그라디언트 카드 렌더 */
  image?: string;
  hue?: number;
}

export interface PanoramaCarouselProps {
  items?: PanoramaItem[];
  /** 원통 반지름(px). 클수록 완만한 곡면 */
  radius?: number;
  /** 유휴 시 자동 회전 속도 (deg/s) */
  spinSpeed?: number;
  /** 카드 간 각도(deg) */
  step?: number;
}

const DEFAULT_ITEMS: PanoramaItem[] = [
  { title: "Nocturne", hue: 248 },
  { title: "Solstice", hue: 32 },
  { title: "Mirage", hue: 180 },
  { title: "Verdant", hue: 140 },
  { title: "Bloom", hue: 315 },
  { title: "Drift", hue: 205 },
  { title: "Ember", hue: 10 },
  { title: "Halcyon", hue: 265 },
  { title: "Zenith", hue: 55 },
  { title: "Abyss", hue: 225 },
];

/**
 * 뷰어가 원통 안에 서 있는 듯한 콘케이브 3D 파노라마 캐러셀.
 * 카드 벽이 주변을 감싸며 돌아가고, 드래그로 돌리면 관성으로 감속한다.
 * perspective를 radius보다 작게 두는 것이 "공간 안" 느낌의 핵심.
 */
export function PanoramaCarousel({
  items = DEFAULT_ITEMS,
  radius = 640,
  spinSpeed = 4,
  step = 22,
}: PanoramaCarouselProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  const sim = useRef({ angle: 0, velocity: 0, dragging: false, lastX: 0 });
  const paramsRef = useRef({ spinSpeed });

  useEffect(() => {
    paramsRef.current = { spinSpeed };
  }, [spinSpeed]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    function loop(now: number) {
      const s = sim.current;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!s.dragging) {
        if (Math.abs(s.velocity) > 0.5) {
          s.angle += s.velocity * dt;
          s.velocity *= Math.pow(0.12, dt);
        } else {
          s.angle += paramsRef.current.spinSpeed * dt;
        }
      }
      const ring = ringRef.current;
      if (ring) ring.style.transform = `rotateY(${s.angle}deg)`;
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="relative h-80 w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-zinc-950 active:cursor-grabbing"
      style={{ perspective: Math.round(radius * 0.62), perspectiveOrigin: "50% 45%" }}
      onPointerDown={(e) => {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        sim.current.dragging = true;
        sim.current.lastX = e.clientX;
        sim.current.velocity = 0;
      }}
      onPointerMove={(e) => {
        const s = sim.current;
        if (!s.dragging) return;
        const dx = e.clientX - s.lastX;
        s.lastX = e.clientX;
        // 안쪽에서 보는 시점이라 드래그 방향과 회전 방향을 일치시킨다
        s.angle += dx * 0.22;
        s.velocity = dx * 0.22 * 60;
        const ring = ringRef.current;
        if (ring) ring.style.transform = `rotateY(${s.angle}deg)`;
      }}
      onPointerUp={() => {
        sim.current.dragging = false;
      }}
      onPointerCancel={() => {
        sim.current.dragging = false;
      }}
      role="group"
      aria-label="파노라마 3D 캐러셀"
    >
      {/* 바닥 반사 느낌의 비네트 */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 40%, transparent 55%, rgba(0,0,0,0.75) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        ref={ringRef}
        className="absolute left-1/2 top-1/2 h-0 w-0"
        style={{ transformStyle: "preserve-3d" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="absolute h-56 w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl ring-1 ring-white/10"
            style={{
              // rotateY(θ) 후 -radius로 밀면 카드 정면이 원통 중심(뷰어)을 향한다
              transform: `rotateY(${i * step}deg) translateZ(${-radius}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image} alt={item.title} draggable={false} className="h-full w-full object-cover" />
            ) : (
              <div
                className="relative h-full w-full"
                style={{
                  background: `linear-gradient(165deg, hsl(${item.hue ?? 240} 50% 46%), hsl(${((item.hue ?? 240) + 45) % 360} 55% 22%))`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-[0.1]"
                  style={{
                    backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />
                <span className="absolute bottom-3 left-3 text-[11px] font-semibold uppercase tracking-widest text-white/85">
                  {item.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
