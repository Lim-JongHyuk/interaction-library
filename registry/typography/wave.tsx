"use client";

// deps: motion
import { motion, useReducedMotion } from "motion/react";
import { splitGraphemes } from "./_lib/split";

export interface WaveTextProps {
  text: string;
  amplitude?: number;
  speed?: number;
  stagger?: number;
}

export function WaveText({ text, amplitude = 8, speed = 1.2, stagger = 0.05 }: WaveTextProps) {
  const reducedMotion = useReducedMotion();
  const chars = splitGraphemes(text);

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  return (
    <span style={{ display: "inline-block" }}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          animate={{ y: [0, -amplitude, 0] }}
          transition={{ duration: speed, repeat: Infinity, ease: "easeInOut", delay: i * stagger }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
