"use client";

// deps: motion
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

export interface TextPressureProps {
  text?: string;
  /** 커서 영향 반경(px) */
  radius?: number;
  /** 반응 강도 (0=고정, 2=과장) */
  strength?: number;
  /** 커서에 가장 가까운 글자의 색 */
  accent?: string;
}

const MIN_W = 200;
const MAX_W = 900;
const MIN_S = 1;
const MAX_S = 1.6;

/**
 * 커서에 가까울수록 글자가 굵고 크게, 액센트 색으로 부풀어 오르는 가변 압력 텍스트.
 * 각 글자 중심과 포인터의 거리를 rAF 루프에서 계산해 font-weight·scale·색을
 * 명령형으로 갱신한다(리렌더 없음). 히어로 타이포의 인터랙티브 포인트.
 */
export function TextPressure({
  text = "PRESSURE",
  radius = 180,
  strength = 1,
  accent = "#6366f1",
}: TextPressureProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLSpanElement[]>([]);
  const pointer = useRef({ x: -9999, y: -9999, active: false });

  const letters = Array.from(text);

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    const tick = () => {
      const { x, y, active } = pointer.current;
      for (const el of charsRef.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dist = Math.hypot(x - cx, y - cy);
        // 반경 안일수록 1, 밖이면 0
        const t = active ? Math.max(0, 1 - dist / radius) : 0;
        const eased = t * t * strength;
        const weight = Math.round(MIN_W + (MAX_W - MIN_W) * Math.min(eased, 1));
        const scale = MIN_S + (MAX_S - MIN_S) * Math.min(eased, 1);
        el.style.fontWeight = String(weight);
        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.color = eased > 0.04 ? accent : "";
        el.style.opacity = String(0.55 + 0.45 * Math.min(eased, 1));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion, radius, strength, accent]);

  return (
    <div ref={containerRef} className="flex w-full items-center justify-center px-6 py-14">
      <p
        aria-label={text}
        className="flex flex-wrap justify-center text-6xl tracking-tight text-zinc-200 sm:text-7xl md:text-8xl"
        style={{ fontWeight: reducedMotion ? 700 : MIN_W }}
      >
        {letters.map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            ref={(el) => {
              if (el) charsRef.current[i] = el;
            }}
            className="inline-block origin-center transition-[color] duration-150 will-change-transform"
            style={{ opacity: reducedMotion ? 1 : 0.55 }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </p>
    </div>
  );
}
