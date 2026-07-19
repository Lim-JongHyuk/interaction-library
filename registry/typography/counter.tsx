"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

export interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
}

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function CountUp({ from = 0, to, duration = 1.2, decimals = 0 }: CountUpProps) {
  const [value, setValue] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !inView) return;

    let raf: number;
    const start = performance.now();
    const durationMs = duration * 1000;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(from + (to - from) * easeOutExpo(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [inView, reducedMotion, from, to, duration]);

  // reduced-motion에서는 애니메이션 상태와 무관하게 최종 값을 즉시 렌더
  const shown = reducedMotion ? to : value;
  return <span ref={ref}>{shown.toFixed(decimals)}</span>;
}
