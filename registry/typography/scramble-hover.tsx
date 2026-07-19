"use client";

// deps: motion
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { splitGraphemes } from "./_lib/split";

const CHARSETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  alnum: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  binary: "01",
} as const;

export interface ScrambleOnHoverProps {
  text: string;
  speed?: number;
  charset?: keyof typeof CHARSETS;
}

function randomChar(pool: string) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function ScrambleOnHover({ text, speed = 30, charset = "upper" }: ScrambleOnHoverProps) {
  const chars = splitGraphemes(text);
  const [display, setDisplay] = useState<string[]>(chars);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotion = useReducedMotion();

  function start() {
    if (reducedMotion || interval.current) return;
    const pool = CHARSETS[charset];
    let ticks = 0;
    const maxTicks = 8;
    interval.current = setInterval(() => {
      ticks += 1;
      setDisplay(chars.map((c, i) => (c === " " || ticks + i / 2 > maxTicks ? c : randomChar(pool))));
      if (ticks >= maxTicks + chars.length) {
        setDisplay(chars);
        if (interval.current) clearInterval(interval.current);
        interval.current = null;
      }
    }, speed);
  }

  return (
    <span
      onMouseEnter={start}
      onFocus={start}
      tabIndex={0}
    >
      {display.join("")}
    </span>
  );
}
