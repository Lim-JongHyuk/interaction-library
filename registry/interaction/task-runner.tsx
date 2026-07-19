"use client";

// deps: motion
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface TaskRunnerCardProps {
  /** `|` 로 구분한 태스크 목록 */
  tasks?: string;
  /** 태스크당 진행 시간(초) */
  stepDuration?: number;
  /** 전체 완료 후 처음부터 반복 */
  loop?: boolean;
  /** 체크·스피너 액센트 색 */
  accent?: string;
}

const DEFAULT_TASKS =
  "Generate color palettes|Recommend font pairings|Create layout templates|Build section engine|Generate hero variants";

/**
 * AI 에이전트가 태스크를 하나씩 처리해 나가는 상태 카드.
 * 스피너 → 체크 전환이 순차 진행되고, path-draw 체크 애니메이션으로 마무리된다.
 */
export function TaskRunnerCard({
  tasks = DEFAULT_TASKS,
  stepDuration = 1.4,
  loop = true,
  accent = "#818cf8",
}: TaskRunnerCardProps) {
  const reducedMotion = useReducedMotion();
  const list = tasks.split("|").map((t) => t.trim()).filter(Boolean);
  // phase: 진행 중인 태스크 인덱스. list.length면 전체 완료
  const [phase, setPhase] = useState(reducedMotion ? list.length : 0);

  useEffect(() => {
    if (reducedMotion) return;
    if (phase >= list.length) {
      if (!loop) return;
      const t = setTimeout(() => setPhase(0), 2200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase((p) => p + 1), stepDuration * 1000);
    return () => clearTimeout(t);
  }, [phase, list.length, stepDuration, loop, reducedMotion]);

  const allDone = phase >= list.length;

  return (
    <div
      className="w-full max-w-sm rounded-2xl bg-zinc-900/85 p-5 shadow-2xl backdrop-blur"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 24px 48px -16px rgba(0,0,0,0.5)" }}
      role="status"
      aria-label={allDone ? "모든 태스크 완료" : `진행 중: ${list[phase]}`}
    >
      <p className="mb-4 text-sm text-white/40">{allDone ? "Done" : "Working..."}</p>
      <ul className="flex flex-col gap-3.5">
        {list.map((task, i) => {
          const done = i < phase;
          const running = i === phase;
          return (
            <motion.li
              key={i}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : i * 0.07, duration: 0.35 }}
              className="flex items-center gap-3"
            >
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                {done ? (
                  <motion.svg
                    viewBox="0 0 20 20"
                    className="h-5 w-5"
                    initial={false}
                    aria-hidden="true"
                  >
                    <circle cx="10" cy="10" r="8.5" fill={`${accent}22`} stroke={accent} strokeWidth="1.4" />
                    <motion.path
                      d="M6 10.4 8.8 13 14 7.4"
                      fill="none"
                      stroke={accent}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
                    />
                  </motion.svg>
                ) : (
                  <motion.span
                    className="block h-[18px] w-[18px] rounded-full border-[1.6px] border-dashed"
                    style={{ borderColor: running ? accent : "rgba(255,255,255,0.22)" }}
                    animate={running && !reducedMotion ? { rotate: 360 } : { rotate: 0 }}
                    transition={
                      running && !reducedMotion
                        ? { duration: 1.6, repeat: Infinity, ease: "linear" }
                        : { duration: 0 }
                    }
                    aria-hidden="true"
                  />
                )}
              </span>
              <span
                className="text-sm transition-colors duration-300"
                style={{ color: done ? "rgba(255,255,255,0.85)" : running ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)" }}
              >
                {task}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
