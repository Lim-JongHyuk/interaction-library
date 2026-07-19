"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface CoverflowCarouselProps {
  items?: string[];
  perspective?: number;
}

const DEFAULT_ITEMS = ["Aurora", "Prism", "Nebula", "Vertex", "Halo"];

export function CoverflowCarousel({ items = DEFAULT_ITEMS, perspective = 900 }: CoverflowCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  function go(delta: number) {
    setIndex((i) => (i + delta + items.length) % items.length);
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      <div
        className="relative flex h-40 w-full items-center justify-center"
        style={{ perspective }}
      >
        {items.map((item, i) => {
          const offset = i - index;
          const wrapped =
            offset > items.length / 2 ? offset - items.length : offset < -items.length / 2 ? offset + items.length : offset;
          if (Math.abs(wrapped) > 2) return null;

          return (
            <motion.div
              key={item}
              animate={{
                x: wrapped * 90,
                rotateY: reducedMotion ? 0 : wrapped * -35,
                scale: 1 - Math.abs(wrapped) * 0.15,
                opacity: 1 - Math.abs(wrapped) * 0.35,
                zIndex: 10 - Math.abs(wrapped),
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute flex h-32 w-24 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold shadow-lg"
            >
              {item}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
        >
          ←
        </button>
        <div className="flex gap-1.5">
          {items.map((item, i) => (
            <button
              key={item}
              type="button"
              aria-label={`Go to ${item}`}
              onClick={() => setIndex(i)}
              className={"h-1.5 rounded-full transition-all " + (i === index ? "w-4 bg-accent" : "w-1.5 bg-border")}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
        >
          →
        </button>
      </div>
    </div>
  );
}
