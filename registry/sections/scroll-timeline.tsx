"use client";

// deps: motion
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export interface TimelineEntry {
  label: string;
  title: string;
  body: string;
}

export interface ScrollTimelineProps {
  entries?: TimelineEntry[];
  /** 진행 라인·노드 액센트 색 */
  accent?: string;
  /** 노드 지름(px) */
  nodeSize?: number;
  /** 진행선 머리의 글로우 표시 */
  beam?: boolean;
}

const DEFAULT_ENTRIES: TimelineEntry[] = [
  { label: "2021", title: "First commit", body: "두 명이 차고에서 시작한 사이드 프로젝트가 첫 배포를 올렸다." },
  { label: "2022", title: "Seed round", body: "초기 사용자 1만 명을 넘기며 시드 투자를 유치했다." },
  { label: "2023", title: "Team of 20", body: "디자인·엔지니어링 팀을 꾸리고 엔터프라이즈 플랜을 출시했다." },
  { label: "2024", title: "Global launch", body: "12개 리전에 엣지 인프라를 배포하고 SOC2 인증을 획득했다." },
  { label: "2025", title: "Series B", body: "연 매출 3배 성장과 함께 시리즈 B 라운드를 마감했다." },
];

/**
 * 스크롤 진행도에 맞춰 세로 진행선이 위에서 아래로 차오르고, 각 항목이
 * 뷰포트 진입 시 페이드-슬라이드로 드러나는 타임라인. 연혁·체인지로그 단골.
 */
export function ScrollTimeline({
  entries = DEFAULT_ENTRIES,
  accent = "#6366f1",
  nodeSize = 16,
  beam = true,
}: ScrollTimelineProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 55%"] });
  const fillScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const beamY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section aria-label="연혁 타임라인" ref={ref} className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="relative pl-10">
        {/* 트랙 */}
        <div className="absolute left-[11px] top-2 h-[calc(100%-1rem)] w-0.5 rounded-full bg-white/10" aria-hidden="true">
          {/* 진행 채움 */}
          <motion.div
            className="absolute inset-x-0 top-0 h-full origin-top rounded-full"
            style={{
              scaleY: reducedMotion ? 1 : fillScale,
              background: `linear-gradient(to bottom, ${accent}, ${accent}00)`,
            }}
          />
          {/* 진행 머리 글로우 */}
          {beam && !reducedMotion && (
            <motion.span
              className="absolute -left-[7px] h-4 w-4 -translate-y-1/2 rounded-full"
              style={{ top: beamY, background: accent, boxShadow: `0 0 16px 4px ${accent}` }}
              aria-hidden="true"
            />
          )}
        </div>

        <ol className="flex flex-col gap-12">
          {entries.map((entry, i) => (
            <motion.li
              key={i}
              className="relative"
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* 노드 */}
              <span
                className="absolute -left-[38px] top-1 flex items-center justify-center rounded-full bg-background ring-2"
                style={{ width: nodeSize + 8, height: nodeSize + 8, color: accent }}
                aria-hidden="true"
              >
                <span className="rounded-full" style={{ width: nodeSize / 2, height: nodeSize / 2, backgroundColor: accent }} />
              </span>

              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
                {entry.label}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">{entry.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{entry.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
