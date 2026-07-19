"use client";

// deps: motion
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export interface BrowserFrameProps {
  url?: string;
  title?: string;
  duration?: number;
}

export function BrowserFrame({ url = "motionkit.dev", title = "MotionKit", duration = 0.6 }: BrowserFrameProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={reducedMotion ? undefined : { opacity: 0, y: 24, scale: 0.97 }}
      animate={reducedMotion ? undefined : inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration, ease: "easeOut" }}
      className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-xl"
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <div className="ml-2 flex-1 truncate rounded-md bg-background px-2.5 py-0.5 text-center text-xs text-muted-foreground">
          {url}
        </div>
      </div>
      <div className="flex h-40 flex-col items-center justify-center gap-1 bg-gradient-to-br from-accent/10 to-transparent">
        <div className="h-6 w-6 rounded-full bg-accent" />
        <p className="text-sm font-medium">{title}</p>
      </div>
    </motion.div>
  );
}
