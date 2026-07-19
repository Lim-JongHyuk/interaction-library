"use client";

// deps: motion
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { splitGraphemes } from "./_lib/split";

const OFFSETS: Record<string, { x?: number; y?: number }> = {
  up: { y: 20 },
  down: { y: -20 },
  left: { x: 20 },
  right: { x: -20 },
};

export interface SplitRevealProps {
  text: string;
  duration?: number;
  stagger?: number;
  direction?: keyof typeof OFFSETS;
}

export function SplitReveal({ text, duration = 0.5, stagger = 0.03, direction = "up" }: SplitRevealProps) {
  const reducedMotion = useReducedMotion();
  const chars = splitGraphemes(text);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  const offset = OFFSETS[direction];

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      style={{ display: "inline-block" }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          variants={{
            hidden: { opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0 },
            visible: { opacity: 1, x: 0, y: 0, transition: { duration } },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
