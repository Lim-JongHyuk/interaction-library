"use client";

// deps: motion
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { splitGraphemes } from "./_lib/split";

export interface BlurOutUpProps {
  text: string;
  duration?: number;
  stagger?: number;
}

export function BlurOutUp({ text, duration = 0.5, stagger = 0.03 }: BlurOutUpProps) {
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
            hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration } },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
