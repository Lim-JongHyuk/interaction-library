"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

export interface EyeFollowButtonProps {
  label?: string;
  /** 눈동자가 움직이는 최대 반경(px) */
  range?: number;
  /** 무작위 깜빡임 */
  blink?: boolean;
  /** 버튼 배경색 */
  color?: string;
  onClick?: () => void;
}

/**
 * 페이지 어디에 커서가 있든 두 눈이 따라오는 캐릭터 버튼.
 * 호버하면 눈동자가 커지고, 이따금 깜빡인다. CTA에 개성을 더하는 장치.
 */
export function EyeFollowButton({
  label = "Watch me",
  range = 4,
  blink = true,
  color = "#6366f1",
  onClick,
}: EyeFollowButtonProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [blinking, setBlinking] = useState(false);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 300, damping: 24 });
  const sy = useSpring(py, { stiffness: 300, damping: 24 });

  // 전역 커서 추적 — 버튼 중심 기준 각도로 눈동자 위치 계산
  useEffect(() => {
    if (reducedMotion) return;
    function onMove(e: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      // 가까울수록 눈동자가 크게 움직인다 (최대 range)
      const reach = Math.min(dist / 40, 1) * range;
      px.set(dist > 0 ? (dx / dist) * reach : 0);
      py.set(dist > 0 ? (dy / dist) * reach : 0);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion, range, px, py]);

  // 무작위 깜빡임 (2.5~6초 간격)
  useEffect(() => {
    if (!blink || reducedMotion) return;
    let timeout: ReturnType<typeof setTimeout>;
    let closeTimer: ReturnType<typeof setTimeout>;
    function schedule() {
      timeout = setTimeout(() => {
        setBlinking(true);
        closeTimer = setTimeout(() => {
          setBlinking(false);
          schedule();
        }, 130);
      }, 2500 + Math.random() * 3500);
    }
    schedule();
    return () => {
      clearTimeout(timeout);
      clearTimeout(closeTimer);
    };
  }, [blink, reducedMotion]);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reducedMotion ? undefined : { scale: 1.04 }}
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      className="flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: color }}
    >
      <span className="flex gap-1.5" aria-hidden="true">
        {[0, 1].map((eye) => (
          <span
            key={eye}
            className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white"
          >
            <motion.span
              className="block rounded-full bg-zinc-900"
              animate={{
                width: hovered ? 13 : 10,
                height: blinking ? 2 : hovered ? 13 : 10,
              }}
              transition={{ duration: 0.12 }}
              style={reducedMotion ? undefined : { x: sx, y: sy }}
            />
          </span>
        ))}
      </span>
      {label}
    </motion.button>
  );
}
