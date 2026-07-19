"use client";

// deps: none
import { useId } from "react";

const PRESETS = {
  indigo: "#6366f1, #a855f7, #ec4899",
  sunset: "#f97316, #ef4444, #eab308",
  ocean: "#06b6d4, #3b82f6, #14b8a6",
  mono: "#71717a, #d4d4d8, #71717a",
} as const;

export interface AnimatedGradientProps {
  text: string;
  speed?: number;
  preset?: keyof typeof PRESETS;
}

export function AnimatedGradient({ text, speed = 4, preset = "indigo" }: AnimatedGradientProps) {
  const id = useId().replace(/[:]/g, "");
  const animationName = `motionkit-gradient-flow-${id}`;

  return (
    <>
      <style>{`
        @keyframes ${animationName} {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .${animationName} { animation: none !important; background-position: 50% 50%; }
        }
      `}</style>
      <span
        className={animationName}
        style={{
          backgroundImage: `linear-gradient(90deg, ${PRESETS[preset]})`,
          backgroundSize: "200% auto",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          animation: `${animationName} ${speed}s linear infinite`,
        }}
      >
        {text}
      </span>
    </>
  );
}
