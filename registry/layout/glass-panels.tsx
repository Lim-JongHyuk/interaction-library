"use client";

// deps: motion
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

export interface GlassPanel {
  title: string;
  value: string;
  caption: string;
}

export interface GlassPanelsProps {
  panels?: GlassPanel[];
  blur?: number;
  tiltStrength?: number;
}

const DEFAULT_PANELS: GlassPanel[] = [
  { title: "Revenue", value: "$128k", caption: "+18% this month" },
  { title: "Sessions", value: "42.5k", caption: "+7% this week" },
  { title: "NPS", value: "72", caption: "all-time high" },
];

/**
 * 컬러 배경 위에 떠 있는 글래스모피즘 패널 레이아웃.
 * 컨테이너 안에서 커서를 움직이면 패널 전체가 3D로 살짝 기운다.
 */
export function GlassPanels({ panels = DEFAULT_PANELS, blur = 16, tiltStrength = 8 }: GlassPanelsProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-tiltStrength, tiltStrength]), { stiffness: 160, damping: 20 });
  const rotateX = useSpring(useTransform(py, [0, 1], [tiltStrength, -tiltStrength]), { stiffness: 160, damping: 20 });

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function handlePointerLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ perspective: 1000 }}
      className="relative w-full max-w-lg overflow-hidden rounded-2xl p-8"
    >
      {/* 배경 컬러 필드 */}
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(130deg,#4f46e5_0%,#a855f7_45%,#0ea5e9_100%)]" />
      <div
        aria-hidden="true"
        className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-white/25 blur-3xl"
      />

      <motion.div
        style={reducedMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative grid grid-cols-1 gap-3 sm:grid-cols-3"
      >
        {panels.map((panel, i) => (
          <div
            key={panel.title}
            style={{
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              transform: reducedMotion ? undefined : `translateZ(${20 + i * 14}px)`,
            }}
            className="rounded-xl border border-white/25 bg-white/15 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_32px_rgba(0,0,0,0.2)]"
          >
            <p className="text-[11px] font-medium uppercase tracking-wider text-white/70">{panel.title}</p>
            <p className="mt-1.5 text-2xl font-semibold tabular-nums">{panel.value}</p>
            <p className="mt-1 text-[11px] text-white/60">{panel.caption}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
