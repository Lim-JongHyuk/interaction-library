"use client";

// deps: motion
import { useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useAnimationFrame, useReducedMotion } from "motion/react";

export interface LogoMarqueeProps {
  /** 렌더할 로고들. 없으면 데모용 워드마크 목록 */
  children?: ReactNode;
  /** 자동 스크롤 속도 (px/s) */
  speed?: number;
  /** 진행 방향 */
  direction?: "left" | "right";
  /** 호버 시 감속 배율 (0 = 정지, 1 = 그대로) */
  hoverSlow?: number;
  /** 항목 간격 (px) */
  gap?: number;
  /** 양끝 페이드 마스크 */
  edgeFade?: boolean;
}

const DEMO_MARKS = ["NORTHWIND", "ATLAS", "LUMEN", "KOSMOS", "VERTEX", "ODYSSEY", "MONOLITH", "AERIAL"];

/**
 * 드래그로 스크럽하고 관성으로 되돌아오는 무한 로고 마퀴.
 * 호버 감속·엣지 페이드·프레임 기반 래핑까지 갖춘 프로덕션 패턴.
 */
export function LogoMarquee({
  children,
  speed = 60,
  direction = "left",
  hoverSlow = 0.25,
  gap = 48,
  edgeFade = true,
}: LogoMarqueeProps) {
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  // 드래그 상태 (관성 포함)
  const drag = useRef({ active: false, lastX: 0, velocity: 0 });
  const slowFactor = useRef(1);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;

    const dt = Math.min(delta, 64) / 1000;
    const dir = direction === "left" ? -1 : 1;

    // 호버 감속을 부드럽게 보간
    const targetSlow = drag.current.active ? 0 : hovered ? hoverSlow : 1;
    slowFactor.current += (targetSlow - slowFactor.current) * Math.min(dt * 8, 1);

    let next = x.get();
    if (drag.current.active) {
      // 드래그 중에는 포인터가 직접 제어 (아래 핸들러에서 x 갱신)
    } else {
      // 관성 감쇠 후 기본 속도로 복귀
      drag.current.velocity *= Math.pow(0.0006, dt); // 빠른 지수 감쇠
      if (Math.abs(drag.current.velocity) < 1) drag.current.velocity = 0;
      next += (dir * speed * slowFactor.current + drag.current.velocity) * dt;
    }

    // [-half, 0) 구간으로 래핑해 이음새 없는 무한 루프
    next = ((next % half) + half) % half;
    x.set(next - half);
  });

  const items = children ?? (
    <>
      {DEMO_MARKS.map((mark) => (
        <span
          key={mark}
          className="text-lg font-semibold uppercase tracking-[0.25em] opacity-40 transition-opacity duration-300 hover:opacity-90"
        >
          {mark}
        </span>
      ))}
    </>
  );

  if (reducedMotion) {
    // 자동 스크롤 없이 정적 한 줄 (넘치면 잘림)
    return (
      <div className="w-full overflow-hidden">
        <div className="flex items-center" style={{ gap }}>
          {items}
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
      style={
        edgeFade
          ? {
              maskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }
          : undefined
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={(e) => {
        drag.current.active = true;
        drag.current.lastX = e.clientX;
        drag.current.velocity = 0;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return;
        const dx = e.clientX - drag.current.lastX;
        drag.current.lastX = e.clientX;
        x.set(x.get() + dx);
        // 최근 이동량으로 릴리즈 관성 추정 (60fps 가정)
        drag.current.velocity = dx * 60;
      }}
      onPointerUp={() => {
        drag.current.active = false;
      }}
      onPointerCancel={() => {
        drag.current.active = false;
      }}
    >
      {/* 복사본 2개. 간격을 paddingRight로 흡수해 루프 주기가 정확히 scrollWidth/2가 되게 한다 */}
      <motion.div ref={trackRef} className="flex w-max items-center" style={{ x }}>
        <div className="flex shrink-0 items-center" style={{ gap, paddingRight: gap }}>
          {items}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap, paddingRight: gap }} aria-hidden="true">
          {items}
        </div>
      </motion.div>
    </div>
  );
}
