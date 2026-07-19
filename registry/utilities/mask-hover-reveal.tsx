"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useMotionValue, useMotionTemplate, useSpring, useReducedMotion } from "motion/react";

export interface MaskHoverRevealProps {
  radius?: number;
  feather?: number;
  topLabel?: string;
  hiddenLabel?: string;
}

/**
 * 커서를 따라다니는 원형 마스크가 위 레이어를 뚫어
 * 숨겨진 아래 레이어를 드러내는 투-레이어 리빌.
 */
export function MaskHoverReveal({
  radius = 110,
  feather = 40,
  topLabel = "Hover to see what's underneath",
  hiddenLabel = "THE HIDDEN LAYER",
}: MaskHoverRevealProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const mx = useSpring(useMotionValue(-9999), { stiffness: 320, damping: 28 });
  const my = useSpring(useMotionValue(-9999), { stiffness: 320, damping: 28 });
  // 위 레이어를 커서 위치에서 '뚫는' 마스크 — 중심은 투명, 바깥은 불투명
  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${mx}px ${my}px, transparent ${Math.max(
    0,
    radius - feather
  )}px, black ${radius}px)`;

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
      className="relative aspect-[16/8] w-full max-w-lg cursor-none overflow-hidden rounded-xl border border-border"
    >
      {/* 아래 레이어 (숨겨진 콘텐츠) */}
      <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#4f46e5,#a855f7,#22d3ee)]">
        <p className="text-lg font-bold tracking-[0.25em] text-white">{hiddenLabel}</p>
      </div>

      {/* 위 레이어 — 마스크로 구멍이 뚫린다 */}
      <motion.div
        style={
          reducedMotion || !active
            ? undefined
            : { WebkitMaskImage: maskImage, maskImage }
        }
        className="absolute inset-0 flex items-center justify-center bg-card"
      >
        <p className="max-w-[240px] text-center text-sm text-muted-foreground">{topLabel}</p>
      </motion.div>
    </div>
  );
}
