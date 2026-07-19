"use client";

// deps: motion
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "motion/react";

export interface ScrollRevealProps {
  text: string;
  /** 아직 도달하지 않은 단어의 오파시티 */
  baseOpacity?: number;
  /** 단어가 밝아질 때 블러 → 선명 전환 추가 */
  blur?: boolean;
  /** 리빌이 시작되는 뷰포트 위치 (0~1, 1=하단). 낮을수록 늦게 시작 */
  startAt?: number;
}

/**
 * 스크롤 진행도에 맞춰 문단이 단어 단위로 밝아지는 리빌 타이포그래피.
 * 프리미엄 에이전시 사이트의 매니페스토 섹션에서 흔히 쓰이는 패턴.
 */
export function ScrollReveal({
  text,
  baseOpacity = 0.12,
  blur = true,
  startAt = 0.85,
}: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [`start ${startAt}`, "end 0.45"],
  });

  const words = text.split(/\s+/).filter(Boolean);

  if (reducedMotion) {
    return <p className="max-w-2xl text-2xl font-medium leading-snug tracking-tight md:text-3xl">{text}</p>;
  }

  return (
    <p ref={ref} className="max-w-2xl flex-wrap text-2xl font-medium leading-snug tracking-tight md:text-3xl">
      {words.map((word, i) => (
        <Word
          key={i}
          progress={scrollYProgress}
          // 단어별 구간이 살짝 겹치도록 1.5칸 폭으로 리빌
          start={i / words.length}
          end={Math.min((i + 1.5) / words.length, 1)}
          baseOpacity={baseOpacity}
          blur={blur}
        >
          {word}
        </Word>
      ))}
    </p>
  );
}

function Word({
  progress,
  start,
  end,
  baseOpacity,
  blur,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  baseOpacity: number;
  blur: boolean;
  children: string;
}) {
  const opacity = useTransform(progress, [start, end], [baseOpacity, 1]);
  const filter = useTransform(progress, [start, end], ["blur(5px)", "blur(0px)"]);

  return (
    <motion.span
      style={{ opacity, filter: blur ? filter : undefined }}
      className="mr-[0.3em] inline-block will-change-[opacity,filter]"
    >
      {children}
    </motion.span>
  );
}
