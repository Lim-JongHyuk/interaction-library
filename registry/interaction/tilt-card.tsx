"use client";

// deps: motion
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

export interface ParallaxTiltCardProps {
  /** 최대 기울기 각도(deg) */
  maxTilt?: number;
  /** 커서를 따라가는 광택(glare) 표시 */
  glare?: boolean;
  /** 호버 시 확대 배율 */
  hoverScale?: number;
}

/**
 * 포인터 위치로 3D 기울기를 만드는 패럴럭스 틸트 카드.
 * 레이어마다 다른 translateZ를 줘 깊이감을 만들고, 광택(glare)은
 * 커서 반대 방향으로 흐른다. 스프링으로 놓았을 때 자연스럽게 복원된다.
 */
export function ParallaxTiltCard({ maxTilt = 14, glare = true, hoverScale = 1.05 }: ParallaxTiltCardProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // -0.5 ~ 0.5 정규화된 포인터 위치
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 220, damping: 18, mass: 0.4 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);

  const rotateX = useTransform(sy, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const glareX = useTransform(sx, [-0.5, 0.5], ["80%", "20%"]);
  const glareY = useTransform(sy, [-0.5, 0.5], ["80%", "20%"]);
  // 레이어 패럴럭스: 앞 레이어일수록 크게 이동
  const shiftBg = useTransform([sx, sy], ([x, y]: number[]) => `translate3d(${x * -14}px, ${y * -14}px, 0)`);
  const shiftFg = useTransform([sx, sy], ([x, y]: number[]) => `translate3d(${x * 26}px, ${y * 26}px, 40px)`);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  if (reducedMotion) {
    return (
      <div className="flex items-center justify-center p-8">
        <TiltFace glare={false} glareX="50%" glareY="50%" shiftBg="none" shiftFg="none" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8" style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        whileHover={{ scale: hoverScale }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="cursor-pointer"
      >
        <TiltFace glare={glare} glareX={glareX} glareY={glareY} shiftBg={shiftBg} shiftFg={shiftFg} />
      </motion.div>
    </div>
  );
}

type MV = string | import("motion/react").MotionValue<string>;

function TiltFace({
  glare,
  glareX,
  glareY,
  shiftBg,
  shiftFg,
}: {
  glare: boolean;
  glareX: MV;
  glareY: MV;
  shiftBg: MV;
  shiftFg: MV;
}) {
  return (
    <div className="relative h-80 w-64 overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ring-1 ring-white/15 [transform-style:preserve-3d]">
      {/* 배경 레이어 (뒤로 밀림) */}
      <motion.div
        style={{ transform: shiftBg, background: "radial-gradient(120% 80% at 30% 20%, #4338ca 0%, #0f172a 60%, #020617 100%)" }}
        className="absolute -inset-8"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light [background:repeating-linear-gradient(115deg,transparent_0_11px,rgba(255,255,255,0.06)_11px_12px)]" aria-hidden="true" />

      {/* 전경 콘텐츠 (앞으로 튀어나옴) */}
      <motion.div style={{ transform: shiftFg }} className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur">
            MEMBERSHIP
          </span>
          <span className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 to-amber-500 shadow-inner" aria-hidden="true" />
        </div>
        <div>
          <p className="font-mono text-lg tracking-[0.18em] text-white/90">4921 ·· ·· 7788</p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">Holder</p>
              <p className="text-sm font-medium text-white/90">A. NOVAK</p>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-white">VELA</p>
          </div>
        </div>
      </motion.div>

      {glare && (
        <motion.div
          // 커서 좌표를 CSS 변수로 주입해 광택 위치를 스크럽한다
          style={{ "--gx": glareX, "--gy": glareY } as React.CSSProperties}
          className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_var(--gx)_var(--gy),rgba(255,255,255,0.4),transparent_45%)]"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
