"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface FlipBookPage {
  title: string;
  body: string;
}

export interface FlipBookProps {
  pages?: FlipBookPage[];
  perspective?: number;
  flipDuration?: number;
}

const DEFAULT_PAGES: FlipBookPage[] = [
  { title: "Chapter 01", body: "Every interface tells a story. This one turns its own pages." },
  { title: "Chapter 02", body: "Each spread flips in real 3D, hinged on the spine." },
  { title: "Chapter 03", body: "Click the right page to go forward, the left to go back." },
  { title: "Chapter 04", body: "Perspective and duration are fully tunable." },
  { title: "Fin.", body: "The end — or flip back to the start." },
];

/**
 * 책등(spine)을 축으로 낱장이 실제 3D로 넘어가는 플립북.
 * 오른쪽 페이지 클릭 = 앞으로, 왼쪽 페이지 클릭 = 뒤로.
 */
export function FlipBook({ pages = DEFAULT_PAGES, perspective = 1200, flipDuration = 0.8 }: FlipBookProps) {
  const reducedMotion = useReducedMotion();
  // turned = 이미 왼쪽으로 넘어간 낱장 수
  const [turned, setTurned] = useState(0);

  const forward = () => setTurned((t) => Math.min(t + 1, pages.length - 1));
  const backward = () => setTurned((t) => Math.max(t - 1, 0));

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative h-52 w-80 select-none"
        style={{ perspective: reducedMotion ? undefined : perspective }}
      >
        {/* 표지 밑면(책 바닥) */}
        <div className="absolute inset-y-0 right-0 w-1/2 rounded-r-lg border border-border bg-muted" />
        <div className="absolute inset-y-0 left-0 w-1/2 rounded-l-lg border border-border bg-muted" />

        {pages.map((page, i) => {
          const isTurned = i < turned;
          return (
            <motion.div
              key={page.title}
              onClick={isTurned ? backward : forward}
              animate={{ rotateY: isTurned && !reducedMotion ? -180 : 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: flipDuration, ease: [0.4, 0.1, 0.2, 1] }
              }
              style={{
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                zIndex: isTurned ? i : pages.length - i,
              }}
              className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
            >
              {/* 앞면 */}
              <div
                className="absolute inset-0 flex flex-col justify-between rounded-r-lg border border-border bg-card p-4"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div>
                  <p className="text-sm font-semibold">{page.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{page.body}</p>
                </div>
                <p className="text-right text-[10px] text-muted-foreground">{i * 2 + 1}</p>
              </div>
              {/* 뒷면 */}
              <div
                className="absolute inset-0 flex items-end rounded-l-lg border border-border bg-muted p-4"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <p className="text-[10px] text-muted-foreground">{i * 2 + 2}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <button type="button" onClick={backward} className="rounded-md border border-border px-2.5 py-1 hover:bg-muted" aria-label="Previous page">
          ← Prev
        </button>
        <span className="tabular-nums">
          {turned + 1} / {pages.length}
        </span>
        <button type="button" onClick={forward} className="rounded-md border border-border px-2.5 py-1 hover:bg-muted" aria-label="Next page">
          Next →
        </button>
      </div>
    </div>
  );
}
