"use client";

// deps: motion
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { splitGraphemes } from "./_lib/split";

const EASES = {
  easeOut: "easeOut",
  easeIn: "easeIn",
  easeInOut: "easeInOut",
  backOut: "backOut",
} as const;

export interface CharStaggerHeroProps {
  text: string;
  duration?: number;
  stagger?: number;
  ease?: keyof typeof EASES;
}

export function CharStaggerHero({ text, duration = 0.6, stagger = 0.02, ease = "easeOut" }: CharStaggerHeroProps) {
  const reducedMotion = useReducedMotion();
  const chars = splitGraphemes(text);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  return (
    <motion.span
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: stagger } } }}
      style={{ display: "inline-block" }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block" }}
          variants={{
            hidden: { opacity: 0, y: 24 },
            visible: { opacity: 1, y: 0, transition: { duration, ease: EASES[ease] } },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
