"use client";

// deps: motion
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export interface SpatialCarouselProps {
  radius?: number;
  autoSpin?: boolean;
  spinSpeed?: number;
}

const PANELS = ["01", "02", "03", "04", "05", "06", "07", "08"];

/**
 * 패널들이 3D 실린더 링으로 배치되어 드래그로 회전하는 공간형 캐러셀.
 * 드래그 놓으면 관성으로 감속하고, 유휴 시 천천히 자동 회전한다.
 */
export function SpatialCarousel({ radius = 220, autoSpin = true, spinSpeed = 6 }: SpatialCarouselProps) {
  const reducedMotion = useReducedMotion();
  const ringRef = useRef<HTMLDivElement>(null);
  const simRef = useRef({
    angle: 0,
    velocity: 0,
    dragging: false,
    pointerId: null as number | null,
    lastX: 0,
    lastTime: 0,
  });
  const rafRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    let lastFrame = performance.now();

    function loop(now: number) {
      const sim = simRef.current;
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;

      if (!sim.dragging) {
        if (Math.abs(sim.velocity) > 0.02) {
          sim.angle += sim.velocity;
          sim.velocity *= 0.955;
        } else if (autoSpin) {
          sim.angle += spinSpeed * dt;
        }
      }

      const ring = ringRef.current;
      if (ring) ring.style.transform = `rotateY(${sim.angle}deg)`;
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion, autoSpin, spinSpeed]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const sim = simRef.current;
    sim.dragging = true;
    sim.pointerId = e.pointerId;
    sim.lastX = e.clientX;
    sim.velocity = 0;
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const sim = simRef.current;
    if (!sim.dragging || e.pointerId !== sim.pointerId) return;
    const dx = e.clientX - sim.lastX;
    sim.lastX = e.clientX;
    sim.angle += dx * 0.35;
    sim.velocity = dx * 0.35;
    const ring = ringRef.current;
    if (ring) ring.style.transform = `rotateY(${sim.angle}deg)`;
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const sim = simRef.current;
    if (e.pointerId !== sim.pointerId) return;
    sim.dragging = false;
    sim.pointerId = null;
  }

  const step = 360 / PANELS.length;

  // 방향키로 한 패널씩 회전 — 드래그가 불가능한 사용자를 위한 대체 조작.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const sim = simRef.current;
    sim.velocity = 0;
    sim.angle += e.key === "ArrowLeft" ? step : -step;
    const ring = ringRef.current;
    if (ring) ring.style.transform = `rotateY(${sim.angle}deg)`;
  }

  return (
    <div
      role="group"
      aria-label="3D 실린더 캐러셀"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ perspective: 900 }}
      className="flex h-64 w-full max-w-lg cursor-grab touch-none items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30 outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
    >
      <div
        ref={ringRef}
        style={{ transformStyle: "preserve-3d", width: 120, height: 160 }}
        className="relative"
      >
        {PANELS.map((label, i) => (
          <div
            key={label}
            style={{
              transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
              backfaceVisibility: "hidden",
            }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-border bg-card shadow-lg"
          >
            <span className="text-3xl font-semibold tracking-tight text-accent">{label}</span>
            <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">panel</span>
          </div>
        ))}
      </div>
    </div>
  );
}
