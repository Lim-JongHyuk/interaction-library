"use client";

// deps: motion
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface RotatingWordsProps {
  words: string;
  interval?: number;
  direction?: "up" | "down";
}

export function RotatingWords({ words, interval = 2000, direction = "up" }: RotatingWordsProps) {
  const list = words.split(",").map((w) => w.trim()).filter(Boolean);
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || list.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % list.length), interval);
    return () => clearInterval(id);
  }, [reducedMotion, interval, list.length]);

  const offset = direction === "up" ? 16 : -16;

  if (reducedMotion) {
    return <span>{list[0]}</span>;
  }

  return (
    <span style={{ display: "inline-block", overflow: "hidden", position: "relative" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: offset }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -offset }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ display: "inline-block" }}
        >
          {list[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
