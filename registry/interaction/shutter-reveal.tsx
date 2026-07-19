"use client";

// deps: motion
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export interface ShutterRevealProps {
  bladeCount?: number;
  duration?: number;
  delay?: number;
  bladeColor?: string;
  label?: string;
}

/**
 * 카메라 조리개(iris) 블레이드가 회전하며 열려 콘텐츠를 드러내는 리빌.
 * 각 블레이드는 중심 기준 회전 + 바깥으로 슬라이드되어 실제 셔터처럼 열린다.
 */
export function ShutterReveal({
  bladeCount = 8,
  duration = 1.1,
  delay = 0.2,
  bladeColor = "#111113",
  label = "SHUTTER",
}: ShutterRevealProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const open = reducedMotion || inView;

  const blades = Array.from({ length: bladeCount }, (_, i) => (360 / bladeCount) * i);

  return (
    <div
      ref={ref}
      className="relative flex aspect-square w-64 items-center justify-center overflow-hidden rounded-full border border-border bg-gradient-to-br from-accent/30 via-transparent to-accent/10"
    >
      <div className="text-center">
        <p className="text-xl font-semibold tracking-[0.3em]">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">f/1.8 · 1/250s</p>
      </div>

      {!reducedMotion &&
        blades.map((angle, i) => (
          <motion.div
            key={i}
            aria-hidden="true"
            initial={{ rotate: angle, x: 0, y: 0 }}
            animate={
              open
                ? {
                    rotate: angle + 60,
                    x: Math.cos(((angle + 60) * Math.PI) / 180) * 260,
                    y: Math.sin(((angle + 60) * Math.PI) / 180) * 260,
                  }
                : {}
            }
            transition={{ duration, delay: delay + i * 0.02, ease: [0.7, 0, 0.2, 1] }}
            style={{
              backgroundColor: bladeColor,
              clipPath: "polygon(50% 50%, 0% 0%, 100% 0%)",
              transformOrigin: "50% 50%",
            }}
            className="absolute h-[150%] w-[150%]"
          />
        ))}

      {/* 조리개 링 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full border-[6px] border-border" />
    </div>
  );
}
