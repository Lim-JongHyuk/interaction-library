"use client";

// deps: motion
import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";

export interface VelocityMarqueeProps {
  /** 첫 줄 텍스트 */
  textA?: string;
  /** 둘째 줄 텍스트 (빈 값이면 한 줄만) */
  textB?: string;
  /** 기본 이동 속도 (px/s) */
  baseSpeed?: number;
  /** 스크롤 속도가 이동에 얹히는 배율 */
  velocityBoost?: number;
  /** 스크롤 속도에 따른 기울임 최대치(deg) */
  skewMax?: number;
}

/**
 * 스크롤 속도에 반응하는 대형 디스플레이 마퀴. 빠르게 스크롤할수록
 * 글자가 빨라지고 기울어지며, 스크롤 방향에 따라 진행 방향도 뒤집힌다.
 * 프리미엄 에이전시 사이트의 시그니처 패턴.
 */
export function VelocityMarquee({
  textA = "MOTION DESIGN —",
  textB = "MADE TO SELL —",
  baseSpeed = 80,
  velocityBoost = 1.6,
  skewMax = 6,
}: VelocityMarqueeProps) {
  const reducedMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 380 });
  // -1~1 범위로 정규화된 속도 계수
  const velocityFactor = useTransform(smoothVelocity, [-2500, 0, 2500], [-1, 0, 1]);

  if (reducedMotion) {
    return (
      <div className="flex w-full flex-col gap-2 overflow-hidden py-4">
        <p className="whitespace-nowrap text-5xl font-bold uppercase tracking-tight opacity-90 md:text-7xl">
          {textA}
        </p>
        {textB && (
          <p className="whitespace-nowrap text-5xl font-bold uppercase tracking-tight opacity-40 md:text-7xl">
            {textB}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 overflow-hidden py-4">
      <MarqueeRow
        text={textA}
        baseSpeed={baseSpeed}
        velocityBoost={velocityBoost}
        skewMax={skewMax}
        velocityFactor={velocityFactor}
        className="opacity-90"
      />
      {textB && (
        <MarqueeRow
          text={textB}
          baseSpeed={-baseSpeed}
          velocityBoost={velocityBoost}
          skewMax={skewMax}
          velocityFactor={velocityFactor}
          className="opacity-40"
        />
      )}
    </div>
  );
}

function MarqueeRow({
  text,
  baseSpeed,
  velocityBoost,
  skewMax,
  velocityFactor,
  className,
}: {
  text: string;
  baseSpeed: number;
  velocityBoost: number;
  skewMax: number;
  velocityFactor: MotionValue<number>;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const skew = useTransform(velocityFactor, (v) => `skewX(${-v * skewMax}deg)`);
  const dirRef = useRef(1);

  useAnimationFrame((_, delta) => {
    const track = trackRef.current;
    if (!track) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    const dt = Math.min(delta, 64) / 1000;
    const vf = velocityFactor.get();

    // 스크롤 방향에 따라 진행 방향을 뒤집고, 속도를 얹는다
    if (vf < -0.05) dirRef.current = -1;
    else if (vf > 0.05) dirRef.current = 1;
    const speed = baseSpeed * dirRef.current * (1 + Math.abs(vf) * velocityBoost * 4);

    let next = x.get() - speed * dt;
    next = ((next % half) + half) % half;
    x.set(next - half);
  });

  // 이음새 없는 루프를 위해 텍스트를 4회 반복
  const copies = Array.from({ length: 4 }, (_, i) => (
    <span key={i} className="pr-6">
      {text}
    </span>
  ));

  return (
    <motion.div style={{ transform: skew }} className={className}>
      <motion.div
        ref={trackRef}
        style={{ x }}
        className="flex w-max whitespace-nowrap text-5xl font-bold uppercase tracking-tight md:text-7xl"
      >
        <div className="flex">{copies}</div>
        <div className="flex" aria-hidden="true">
          {copies}
        </div>
      </motion.div>
    </motion.div>
  );
}
