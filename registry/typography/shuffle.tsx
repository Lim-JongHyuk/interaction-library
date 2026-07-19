"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { splitGraphemes } from "./_lib/split";

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  binary: "01",
} as const;

export interface ShuffleTextProps {
  text: string;
  duration?: number;
  stagger?: number;
  shuffleTimes?: number;
  charset?: keyof typeof CHARSETS;
  hoverReplay?: boolean;
}

function randomChar(pool: string) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function ShuffleText({
  text,
  duration = 0.6,
  stagger = 0.03,
  shuffleTimes = 4,
  charset = "upper",
  hoverReplay = false,
}: ShuffleTextProps) {
  const chars = splitGraphemes(text);
  const [display, setDisplay] = useState<string[]>(chars);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reducedMotion = useReducedMotion();
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  function play() {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    const pool = CHARSETS[charset];
    const stepMs = (duration * 1000) / shuffleTimes;

    chars.forEach((finalChar, i) => {
      const startDelay = i * stagger * 1000;
      for (let step = 0; step < shuffleTimes; step++) {
        const t = setTimeout(
          () => {
            setDisplay((prev) => {
              const next = [...prev];
              next[i] = step === shuffleTimes - 1 ? finalChar : randomChar(pool);
              return next;
            });
          },
          startDelay + step * stepMs
        );
        timeouts.current.push(t);
      }
    });
  }

  useEffect(() => {
    if (reducedMotion) return;
    if (inView) play();
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reducedMotion, text, duration, stagger, shuffleTimes, charset]);

  // reduced-motion에서는 셔플 상태 대신 항상 최종 텍스트를 파생값으로 렌더
  const shown = reducedMotion ? chars : display;

  return (
    <span
      ref={ref}
      onMouseEnter={() => {
        if (hoverReplay && !reducedMotion) play();
      }}
    >
      <span aria-hidden="true">
        {shown.map((char, i) => (
          <span key={i}>{char}</span>
        ))}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
