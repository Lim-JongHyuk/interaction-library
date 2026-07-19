"use client";

// deps: motion
import { motion, useReducedMotion } from "motion/react";

export interface FadeUpTextProps {
  text: string;
  duration?: number;
  delay?: number;
  distance?: number;
}

export function FadeUpText({ text, duration = 0.6, delay = 0, distance = 24 }: FadeUpTextProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  return (
    <motion.span
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}
