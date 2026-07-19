"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

export interface TypewriterTextProps {
  text: string;
  speed?: number;
  cursor?: boolean;
  loop?: boolean;
}

export function TypewriterText({ text, speed = 40, cursor = true, loop = false }: TypewriterTextProps) {
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: !loop, amount: 0.4 });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !inView) return;

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        clearInterval(interval);
        if (loop) {
          setTimeout(() => setCycle((c) => c + 1), speed * 10);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [inView, reducedMotion, text, speed, loop, cycle]);

  // reduced-motion에서는 타이핑 상태와 무관하게 전체 텍스트를 즉시 렌더
  const shown = reducedMotion ? text : text.slice(0, count);

  return (
    <span ref={ref}>
      {shown}
      {cursor && !reducedMotion && (
        <span aria-hidden="true" className="animate-pulse">
          |
        </span>
      )}
    </span>
  );
}
