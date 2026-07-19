"use client";

// deps: motion
import { motion, useReducedMotion } from "motion/react";

export interface BlurInTextProps {
  text: string;
  duration?: number;
  blurAmount?: number;
}

export function BlurInText({ text, duration = 0.6, blurAmount = 8 }: BlurInTextProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  return (
    <motion.span
      initial={{ opacity: 0, filter: `blur(${blurAmount}px)` }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}
