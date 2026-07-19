"use client";

// deps: motion
import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

export interface GravityGalleryProps {
  gravity?: number;
  bounce?: number;
  friction?: number;
}

const ITEMS = [
  { label: "🌊", hue: 210 },
  { label: "🔥", hue: 18 },
  { label: "🌿", hue: 140 },
  { label: "⚡", hue: 48 },
  { label: "🪐", hue: 270 },
  { label: "🫧", hue: 190 },
  { label: "🍓", hue: 340 },
];

const CARD = 64; // px, 정사각 카드 한 변

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  va: number;
  dragging: boolean;
  pointerId: number | null;
  lastPointerX: number;
  lastPointerY: number;
}

/**
 * 카드들이 중력으로 낙하해 바닥에 쌓이고, 서로 원형 충돌하며,
 * 드래그로 집어 던지면 관성으로 날아가는 미니 물리 갤러리.
 * 물리는 외부 엔진 없이 자체 rAF 시뮬레이션으로 구현했다.
 */
export function GravityGallery({ gravity = 0.9, bounce = 0.55, friction = 0.99 }: GravityGalleryProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bodiesRef = useRef<Body[]>([]);
  const rafRef = useRef(0);
  const inView = useInView(containerRef, { once: true, amount: 0.4 });
  // once:true 이므로 inView는 한 번 true가 되면 유지된다 — 파생값으로 충분
  const started = inView && !reducedMotion;

  useEffect(() => {
    if (!started) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const R = CARD / 2;

    // 상단 밖 무작위 위치에서 낙하 시작
    bodiesRef.current = ITEMS.map((_, i) => ({
      x: 20 + Math.random() * Math.max(1, W - CARD - 40),
      y: -CARD - i * 70 - Math.random() * 40,
      vx: (Math.random() - 0.5) * 3,
      vy: 0,
      angle: (Math.random() - 0.5) * 40,
      va: (Math.random() - 0.5) * 4,
      dragging: false,
      pointerId: null,
      lastPointerX: 0,
      lastPointerY: 0,
    }));

    function step() {
      const bodies = bodiesRef.current;

      for (const b of bodies) {
        if (b.dragging) continue;
        b.vy += gravity;
        b.vx *= friction;
        b.vy *= friction;
        b.x += b.vx;
        b.y += b.vy;
        b.angle += b.va;
        b.va *= 0.985;

        // 벽/바닥 충돌
        if (b.x < 0) {
          b.x = 0;
          b.vx = Math.abs(b.vx) * bounce;
        } else if (b.x > W - CARD) {
          b.x = W - CARD;
          b.vx = -Math.abs(b.vx) * bounce;
        }
        if (b.y > H - CARD) {
          b.y = H - CARD;
          if (Math.abs(b.vy) > 1) b.vy = -Math.abs(b.vy) * bounce;
          else b.vy = 0;
          b.vx *= 0.94;
          b.va *= 0.9;
        }
      }

      // 카드끼리 원형 충돌 (동일 질량 탄성 근사)
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const b = bodies[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.01;
          const minDist = R * 2 * 0.92;
          if (dist < minDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (minDist - dist) / 2;
            if (!a.dragging) {
              a.x -= nx * overlap;
              a.y -= ny * overlap;
            }
            if (!b.dragging) {
              b.x += nx * overlap;
              b.y += ny * overlap;
            }
            // 법선 방향 상대 속도 교환
            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const rel = rvx * nx + rvy * ny;
            if (rel < 0) {
              const imp = (-rel * (1 + bounce)) / 2;
              if (!a.dragging) {
                a.vx -= imp * nx;
                a.vy -= imp * ny;
                a.va += (Math.random() - 0.5) * 2;
              }
              if (!b.dragging) {
                b.vx += imp * nx;
                b.vy += imp * ny;
                b.va += (Math.random() - 0.5) * 2;
              }
            }
          }
        }
      }

      // DOM 반영 (setState 없이 transform 직접 갱신)
      bodies.forEach((b, i) => {
        const el = cardRefs.current[i];
        if (el) el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
      });

      rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, gravity, bounce, friction]);

  function handlePointerDown(i: number, e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const b = bodiesRef.current[i];
    if (!b) return;
    b.dragging = true;
    b.pointerId = e.pointerId;
    b.lastPointerX = e.clientX;
    b.lastPointerY = e.clientY;
    b.vx = 0;
    b.vy = 0;
  }

  function handlePointerMove(i: number, e: React.PointerEvent<HTMLDivElement>) {
    const b = bodiesRef.current[i];
    if (!b?.dragging || e.pointerId !== b.pointerId) return;
    const dx = e.clientX - b.lastPointerX;
    const dy = e.clientY - b.lastPointerY;
    b.x += dx;
    b.y += dy;
    // 던지기 관성용 속도 기록
    b.vx = dx;
    b.vy = dy;
    b.lastPointerX = e.clientX;
    b.lastPointerY = e.clientY;
    const el = cardRefs.current[i];
    if (el) el.style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.angle}deg)`;
  }

  function handlePointerUp(i: number, e: React.PointerEvent<HTMLDivElement>) {
    const b = bodiesRef.current[i];
    if (!b?.dragging || e.pointerId !== b.pointerId) return;
    b.dragging = false;
    b.pointerId = null;
    b.va = b.vx * 0.4;
  }

  // reduced-motion: 물리 없이 정렬된 정적 그리드
  if (reducedMotion) {
    return (
      <div className="flex h-72 w-full max-w-lg flex-wrap content-end items-end justify-center gap-2 rounded-xl border border-border bg-muted/40 p-4">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            style={{ width: CARD, height: CARD, backgroundColor: `hsl(${item.hue} 70% 55%)` }}
            className="flex items-center justify-center rounded-xl text-2xl shadow-md"
          >
            {item.label}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-72 w-full max-w-lg touch-none overflow-hidden rounded-xl border border-border bg-muted/40"
    >
      {ITEMS.map((item, i) => (
        <div
          key={item.label}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          onPointerDown={(e) => handlePointerDown(i, e)}
          onPointerMove={(e) => handlePointerMove(i, e)}
          onPointerUp={(e) => handlePointerUp(i, e)}
          onPointerCancel={(e) => handlePointerUp(i, e)}
          style={{
            width: CARD,
            height: CARD,
            backgroundColor: `hsl(${item.hue} 70% 55%)`,
            transform: `translate(-999px, -999px)`,
            willChange: "transform",
          }}
          className="absolute left-0 top-0 flex cursor-grab items-center justify-center rounded-xl text-2xl shadow-lg active:cursor-grabbing"
        >
          {item.label}
        </div>
      ))}
      <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[11px] text-muted-foreground">
        drag &amp; throw
      </p>
    </div>
  );
}
