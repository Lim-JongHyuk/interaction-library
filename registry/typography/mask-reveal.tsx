"use client";

// deps: motion
import { motion, useReducedMotion } from "motion/react";

export interface MaskRevealProps {
  text: string;
  duration?: number;
  angle?: number;
  delay?: number;
}

export function MaskReveal({ text, duration = 0.7, angle = 10, delay = 0 }: MaskRevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  const maskImage = `linear-gradient(${angle}deg, black 50%, transparent 50%)`;

  return (
    <motion.span
      initial={{ maskPosition: "200% 0%" }}
      whileInView={{ maskPosition: "0% 0%" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration, delay, ease: "easeInOut" }}
      style={{
        display: "inline-block",
        WebkitMaskImage: maskImage,
        maskImage,
        WebkitMaskSize: "300% 100%",
        maskSize: "300% 100%",
      }}
    >
      {text}
    </motion.span>
  );
}
