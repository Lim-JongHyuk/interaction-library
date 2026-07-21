"use client";

// deps: motion
import { motion, useReducedMotion } from "motion/react";

export interface LampGlowProps {
  /** 램프·글로우 액센트 색 */
  accent?: string;
  /** 램프가 퍼지는 폭(rem) */
  spread?: number;
  /** 중앙 헤드라인 */
  heading?: string;
}

/**
 * 원뿔 그라디언트 두 장이 뷰포트 진입 시 좌우로 펼쳐지며 밝은 선을 만들고,
 * 그 빛 아래로 헤드라인이 떠오르는 램프 히어로. 프리미엄 랜딩 헤더 단골.
 */
export function LampGlow({ accent = "#6366f1", spread = 30, heading = "Built in the light." }: LampGlowProps) {
  const reducedMotion = useReducedMotion();
  const grow = reducedMotion
    ? { initial: false as const, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0.5, width: "8rem" },
        whileInView: { opacity: 1, width: `${spread}rem` },
        viewport: { once: true },
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <section
      aria-label="램프 글로우 헤더"
      className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* 램프 리그 */}
      <div className="absolute top-1/2 flex -translate-y-[7rem] scale-y-125 items-center justify-center" aria-hidden="true">
        {/* 왼쪽 원뿔 */}
        <motion.div
          {...grow}
          style={{
            backgroundImage: `conic-gradient(from 70deg at center top, ${accent}, transparent, transparent)`,
          }}
          className="h-56 [mask-image:linear-gradient(to_top,transparent,white)]"
        >
          <div className="absolute bottom-0 left-0 h-40 w-full bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 h-full w-40 bg-slate-950 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        {/* 오른쪽 원뿔 */}
        <motion.div
          {...grow}
          style={{
            backgroundImage: `conic-gradient(from 290deg at center top, transparent, transparent, ${accent})`,
          }}
          className="h-56 [mask-image:linear-gradient(to_top,transparent,white)]"
        >
          <div className="absolute bottom-0 right-0 h-40 w-full bg-slate-950 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 right-0 h-full w-40 bg-slate-950 [mask-image:linear-gradient(to_left,white,transparent)]" />
        </motion.div>
      </div>

      {/* 코어 글로우 + 밝은 선 */}
      <div className="absolute top-1/2 -translate-y-[8.5rem]" aria-hidden="true">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0.4, width: "6rem" }}
          whileInView={reducedMotion ? undefined : { opacity: 1, width: `${spread * 0.55}rem` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-9 rounded-full blur-2xl"
          style={{ backgroundColor: accent }}
        />
        <motion.div
          initial={reducedMotion ? false : { width: "8rem" }}
          whileInView={reducedMotion ? undefined : { width: `${spread * 0.85}rem` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto -mt-2 h-0.5 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 20px 2px ${accent}` }}
        />
      </div>

      {/* 헤드라인 */}
      <motion.h2
        initial={reducedMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mt-24 bg-gradient-to-b from-white to-slate-400 bg-clip-text px-6 text-center text-4xl font-semibold tracking-tight text-transparent sm:text-6xl"
      >
        {heading}
      </motion.h2>
    </section>
  );
}
