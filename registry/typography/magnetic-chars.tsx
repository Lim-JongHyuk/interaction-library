"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { splitGraphemes } from "./_lib/split";

export interface MagneticCharactersProps {
  text: string;
  strength?: number;
  radius?: number;
}

export function MagneticCharacters({ text, strength = 0.4, radius = 60 }: MagneticCharactersProps) {
  const reducedMotion = useReducedMotion();
  const chars = splitGraphemes(text);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [offsets, setOffsets] = useState<{ x: number; y: number }[]>(chars.map(() => ({ x: 0, y: 0 })));

  function handlePointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (reducedMotion || e.pointerType !== "mouse") return;
    const spans = containerRef.current?.querySelectorAll<HTMLSpanElement>("[data-char]");
    if (!spans) return;

    const next = Array.from(spans).map((span) => {
      const rect = span.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > radius) return { x: 0, y: 0 };
      const pull = (1 - dist / radius) * strength * radius;
      return { x: (dx / (dist || 1)) * pull, y: (dy / (dist || 1)) * pull };
    });
    setOffsets(next);
  }

  function handlePointerLeave() {
    setOffsets(chars.map(() => ({ x: 0, y: 0 })));
  }

  return (
    <span
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ display: "inline-block" }}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          data-char
          animate={{ x: offsets[i]?.x ?? 0, y: offsets[i]?.y ?? 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          style={{ display: "inline-block" }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}
