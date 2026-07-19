"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate, useReducedMotion } from "motion/react";

export interface CursorSpotlightProps {
  radius?: number;
  color?: string;
  text?: string;
}

export function CursorSpotlight({ radius = 220, color = "#818cf8", text = "Hover to reveal the spotlight." }: CursorSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mx}px ${my}px, ${color}33, transparent 70%)`;
  const [active, setActive] = useState(false);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-[#0a0a0b] px-8 py-16 text-center"
    >
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background,
            opacity: active ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      )}
      <p className="relative z-10 max-w-xs text-sm text-zinc-400">{text}</p>
    </div>
  );
}
