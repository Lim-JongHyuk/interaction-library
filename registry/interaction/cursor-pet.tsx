"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

export interface CursorPetProps {
  size?: number;
  bodyColor?: string;
  followStrength?: number;
  blink?: boolean;
}

/**
 * 화면 어디서든 커서를 눈으로 좇는 블롭 펫.
 * 몸통은 커서 방향으로 살짝 기울고, 주기적으로 눈을 깜빡인다.
 */
export function CursorPet({
  size = 120,
  bodyColor = "#818cf8",
  followStrength = 0.35,
  blink = true,
}: CursorPetProps) {
  const reducedMotion = useReducedMotion();
  const bodyRef = useRef<HTMLDivElement>(null);
  const [blinking, setBlinking] = useState(false);

  // 동공 오프셋 (눈 중심 기준)
  const pupilX = useSpring(useMotionValue(0), { stiffness: 300, damping: 22 });
  const pupilY = useSpring(useMotionValue(0), { stiffness: 300, damping: 22 });
  const tiltX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 });

  useEffect(() => {
    if (reducedMotion) return;

    function handlePointerMove(e: PointerEvent) {
      const el = bodyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const maxPupil = size * 0.055;
      pupilX.set((dx / dist) * Math.min(maxPupil, dist * 0.08));
      pupilY.set((dy / dist) * Math.min(maxPupil, dist * 0.08));
      tiltX.set(Math.max(-10, Math.min(10, dx * 0.02 * followStrength * 10)));
    }

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [reducedMotion, size, followStrength, pupilX, pupilY, tiltX]);

  useEffect(() => {
    if (!blink || reducedMotion) return;
    let closeTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setBlinking(true);
      closeTimer = setTimeout(() => setBlinking(false), 140);
    }, 2800 + Math.random() * 1500);
    return () => {
      clearInterval(interval);
      clearTimeout(closeTimer);
    };
  }, [blink, reducedMotion]);

  const eyeSize = size * 0.22;
  const pupilSize = eyeSize * 0.45;

  return (
    <motion.div
      ref={bodyRef}
      style={{ width: size, height: size * 0.92, backgroundColor: bodyColor, rotate: reducedMotion ? 0 : tiltX }}
      animate={reducedMotion ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className="relative rounded-[45%_55%_52%_48%/55%_48%_52%_45%] shadow-lg"
      role="img"
      aria-label="커서를 눈으로 따라오는 블롭 캐릭터"
    >
      {/* 하이라이트 */}
      <div
        aria-hidden="true"
        className="absolute left-[18%] top-[12%] h-[22%] w-[30%] rounded-full bg-white/30 blur-[2px]"
      />
      {/* 눈 2개 */}
      {[0.28, 0.72].map((cx) => (
        <div
          key={cx}
          aria-hidden="true"
          style={{
            width: eyeSize,
            height: blinking ? 2 : eyeSize,
            left: `calc(${cx * 100}% - ${eyeSize / 2}px)`,
            top: "38%",
          }}
          className="absolute overflow-hidden rounded-full bg-white transition-[height] duration-100"
        >
          {!blinking && (
            <motion.span
              style={{
                width: pupilSize,
                height: pupilSize,
                marginLeft: -pupilSize / 2,
                marginTop: -pupilSize / 2,
                x: pupilX,
                y: pupilY,
              }}
              className="absolute left-1/2 top-1/2 rounded-full bg-zinc-900"
            />
          )}
        </div>
      ))}
      {/* 입 */}
      <div
        aria-hidden="true"
        style={{ width: size * 0.16 }}
        className="absolute left-1/2 top-[64%] h-[6px] -translate-x-1/2 rounded-b-full border-b-2 border-zinc-900/70"
      />
    </motion.div>
  );
}
