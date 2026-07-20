"use client";

// deps: 없음 (CSS 3D transforms)
import { useEffect, useRef } from "react";

export interface SpiralItem {
  title: string;
  /** 이미지 URL. 없으면 hue 기반 그라디언트 카드 렌더 */
  image?: string;
  hue?: number;
}

export interface SpiralSliderProps {
  items?: SpiralItem[];
  /** 나선 반지름(px) */
  radius?: number;
  /** 카드 간 각도(deg) */
  step?: number;
  /** 카드당 상승 높이(px) */
  rise?: number;
}

const DEFAULT_ITEMS: SpiralItem[] = [
  { title: "Base camp", hue: 210 },
  { title: "Ridge", hue: 245 },
  { title: "Col", hue: 280 },
  { title: "Serac", hue: 315 },
  { title: "Crux", hue: 350 },
  { title: "Summit", hue: 25 },
  { title: "Descent", hue: 60 },
  { title: "Valley", hue: 150 },
];

/**
 * 카드들이 나선 계단처럼 감아 올라가는 3D 스파이럴 슬라이더.
 * 드래그하면 나선 전체가 회전·하강하며 다음 카드가 정면으로 온다.
 * 릴리즈 시 관성 감속 후 가장 가까운 카드에 스냅.
 */
export function SpiralSlider({
  items = DEFAULT_ITEMS,
  radius = 260,
  step = 45,
  rise = 46,
}: SpiralSliderProps) {
  const ringRef = useRef<HTMLDivElement>(null);
  // active: 연속값 (드래그 중 소수). 정면 카드 인덱스
  const sim = useRef({ active: 0, velocity: 0, dragging: false, lastX: 0 });
  const paramsRef = useRef({ step, rise });

  useEffect(() => {
    paramsRef.current = { step, rise };
  }, [step, rise]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();

    function apply() {
      const ring = ringRef.current;
      if (!ring) return;
      const p = paramsRef.current;
      const s = sim.current;
      ring.style.transform = `translateY(${s.active * p.rise}px) rotateY(${-s.active * p.step}deg)`;
    }

    function loop(now: number) {
      const s = sim.current;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!s.dragging) {
        if (Math.abs(s.velocity) > 0.05) {
          s.active += s.velocity * dt;
          s.velocity *= Math.pow(0.06, dt);
        } else {
          // 가장 가까운 정수로 스냅 (스프링 근사)
          const target = Math.round(s.active);
          const diff = target - s.active;
          if (Math.abs(diff) > 0.001) s.active += diff * Math.min(dt * 8, 1);
          else s.active = target;
        }
        // 범위 제한 (양끝에서 되튕김)
        const max = items.length - 1;
        if (s.active < 0) s.active += (0 - s.active) * Math.min(dt * 12, 1);
        if (s.active > max) s.active += (max - s.active) * Math.min(dt * 12, 1);
      }
      apply();
      raf = requestAnimationFrame(loop);
    }

    apply();
    if (!reduced) raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [items.length]);

  return (
    <div
      className="relative h-80 w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
      style={{ perspective: 1100, perspectiveOrigin: "50% 38%" }}
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
        s.active = Math.min(items.length - 1 + 0.4, Math.max(-0.4, s.active - dx / 160));
        s.velocity = (-dx / 160) * 60;
        const ring = ringRef.current;
        const p = paramsRef.current;
        if (ring)
          ring.style.transform = `translateY(${s.active * p.rise}px) rotateY(${-s.active * p.step}deg)`;
      }}
      onPointerUp={() => {
        sim.current.dragging = false;
      }}
      onPointerCancel={() => {
        sim.current.dragging = false;
      }}
      // 방향키로 한 카드씩 이동 — 드래그가 불가능한 사용자를 위한 대체 조작.
      onKeyDown={(e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const s = sim.current;
        s.velocity = 0;
        const dir = e.key === "ArrowRight" ? 1 : -1;
        s.active = Math.min(items.length - 1, Math.max(0, Math.round(s.active) + dir));
        const ring = ringRef.current;
        const p = paramsRef.current;
        if (ring)
          ring.style.transform = `translateY(${s.active * p.rise}px) rotateY(${-s.active * p.step}deg)`;
      }}
      role="group"
      aria-label="스파이럴 3D 슬라이더"
      tabIndex={0}
    >
      {/* 깊이감용 비네트 */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 50% 42%, transparent 50%, rgba(0,0,0,0.8) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute left-1/2 top-[42%]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div ref={ringRef} style={{ transformStyle: "preserve-3d" }}>
          {items.map((item, i) => (
            <div
              key={i}
              className="absolute h-48 w-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
              style={{
                // 나선: 각도와 높이가 인덱스에 비례
                transform: `rotateY(${i * step}deg) translateZ(${radius}px) translateY(${-i * rise}px)`,
              }}
            >
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt={item.title} draggable={false} className="h-full w-full object-cover" />
              ) : (
                <div
                  className="relative h-full w-full"
                  style={{
                    background: `linear-gradient(160deg, hsl(${item.hue ?? 240} 52% 48%), hsl(${((item.hue ?? 240) + 40) % 360} 58% 22%))`,
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
    </div>
  );
}
