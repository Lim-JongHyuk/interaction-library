"use client";

// deps: motion
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

export interface GlitchTextProps {
  text: string;
  intensity?: number;
  interval?: number;
  rgbSplit?: boolean;
}

export function GlitchText({ text, intensity = 3, interval = 2000, rgbSplit = true }: GlitchTextProps) {
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setOffset(1);
      setTimeout(() => setOffset(0), 120);
    }, interval);
    return () => clearInterval(id);
  }, [reducedMotion, interval]);

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span>{text}</span>
      {rgbSplit && offset === 1 && (
        <>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              color: "#ef4444",
              transform: `translateX(-${intensity}px)`,
              mixBlendMode: "screen",
            }}
          >
            {text}
          </span>
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              color: "#3b82f6",
              transform: `translateX(${intensity}px)`,
              mixBlendMode: "screen",
            }}
          >
            {text}
          </span>
        </>
      )}
    </span>
  );
}
