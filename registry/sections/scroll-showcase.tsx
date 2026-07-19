"use client";

// deps: motion
import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

export interface ShowcaseItem {
  /** 스텝 라벨 (좌측 목록) */
  title: string;
  /** 스텝 설명 */
  description: string;
  /** 우측 비주얼 카드의 색상 hue (0–360). 이미지 대신 쓰는 데모용 */
  hue?: number;
  /** 비주얼 카드에 넣을 이미지 URL. 지정하면 hue 카드 대신 렌더 */
  image?: string;
}

export interface ScrollShowcaseProps {
  items?: ShowcaseItem[];
  /** 스텝당 스크롤 길이(vh). 클수록 천천히 전환 */
  stepHeight?: number;
  /** 좌측 진행 레일 표시 */
  showProgress?: boolean;
  /** 액센트 색 (활성 스텝·진행 레일) */
  accent?: string;
}

const DEFAULT_ITEMS: ShowcaseItem[] = [
  {
    title: "Design once",
    description: "컴포넌트 하나로 모든 브레이크포인트를 커버합니다. 반응형은 기본값입니다.",
    hue: 243,
  },
  {
    title: "Animate with intent",
    description: "스크롤 위치에 정확히 동기화된 전환. 우연에 기대지 않는 모션입니다.",
    hue: 283,
  },
  {
    title: "Ship instantly",
    description: "복사 한 번, CLI 한 줄. 프로덕션 코드가 그대로 프로젝트에 들어갑니다.",
    hue: 199,
  },
];

/**
 * Apple 제품 페이지 스타일의 스티키 스크롤 쇼케이스. 섹션을 지나는 동안
 * 화면이 고정되고, 스크롤 진행도에 맞춰 스텝 텍스트와 비주얼이 크로스페이드된다.
 */
export function ScrollShowcase({
  items = DEFAULT_ITEMS,
  stepHeight = 100,
  showProgress = true,
  accent = "#6366f1",
}: ScrollShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  if (reducedMotion) {
    // 스크럽 없이 전체 스텝을 정적으로 나열
    return (
      <div className="flex w-full flex-col gap-16 py-8">
        {items.map((item, i) => (
          <div key={i} className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest" style={{ color: accent }}>
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed opacity-70">{item.description}</p>
            </div>
            <VisualCard item={item} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: `${items.length * stepHeight}vh` }}>
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 px-6 md:grid-cols-[1fr_1.2fr]">
          {/* 좌측: 스텝 목록 + 진행 레일 */}
          <div className="relative flex flex-col gap-10">
            {showProgress && (
              <div className="absolute -left-5 top-0 h-full w-px bg-current opacity-10" aria-hidden="true">
                <motion.div
                  className="w-px origin-top"
                  style={{ height: "100%", scaleY: scrollYProgress, backgroundColor: accent }}
                />
              </div>
            )}
            {items.map((item, i) => (
              <StepText
                key={i}
                item={item}
                index={i}
                total={items.length}
                progress={scrollYProgress}
                accent={accent}
              />
            ))}
          </div>

          {/* 우측: 비주얼 스택 (크로스페이드) */}
          <div className="relative aspect-[4/3] w-full">
            {items.map((item, i) => (
              <StepVisual key={i} item={item} index={i} total={items.length} progress={scrollYProgress} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** 스텝 i가 활성인 진행도 구간: [i/n, (i+1)/n] */
function stepRange(index: number, total: number): [number, number, number, number] {
  const start = index / total;
  const end = (index + 1) / total;
  const fade = Math.min(0.4 / total, 0.12);
  // 입력 구간이 겹치지 않도록 clamp 없이 반환 (음수/1 초과 입력은 useTransform이 알아서 처리)
  return [start - fade, start, end - fade, end];
}

function StepText({
  item,
  index,
  total,
  progress,
  accent,
}: {
  item: ShowcaseItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  accent: string;
}) {
  const [a, b, c, d] = stepRange(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const opacity = useTransform(
    progress,
    [a, b, c, d],
    [isFirst ? 1 : 0.25, 1, 1, isLast ? 1 : 0.25]
  );
  const x = useTransform(progress, [a, b], isFirst ? [0, 0] : [-8, 0]);

  return (
    <motion.div style={{ opacity, x }}>
      <p className="text-xs font-medium uppercase tracking-widest" style={{ color: accent }}>
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-1.5 text-xl font-semibold tracking-tight md:text-2xl">{item.title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed opacity-70">{item.description}</p>
    </motion.div>
  );
}

function StepVisual({
  item,
  index,
  total,
  progress,
}: {
  item: ShowcaseItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const [a, b, c, d] = stepRange(index, total);
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const opacity = useTransform(progress, [a, b, c, d], [isFirst ? 1 : 0, 1, 1, isLast ? 1 : 0]);
  const scale = useTransform(progress, [a, b, c, d], [isFirst ? 1 : 0.94, 1, 1, isLast ? 1 : 0.96]);
  const y = useTransform(progress, [a, b], isFirst ? [0, 0] : [24, 0]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity, scale, y }}>
      <VisualCard item={item} />
    </motion.div>
  );
}

/** 이미지가 없을 때 쓰는 목업 UI 카드 — 데모가 그대로 포트폴리오처럼 보이게 */
function VisualCard({ item }: { item: ShowcaseItem }) {
  if (item.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image}
        alt={item.title}
        className="h-full w-full rounded-2xl object-cover shadow-2xl"
      />
    );
  }
  const hue = item.hue ?? 243;
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 45% 12%), hsl(${(hue + 40) % 360} 55% 18%))`,
      }}
    >
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 p-6">
        <div
          className="h-24 w-full rounded-lg"
          style={{
            background: `linear-gradient(120deg, hsl(${hue} 85% 62% / 0.9), hsl(${(hue + 60) % 360} 85% 55% / 0.9))`,
          }}
        />
        <div className="h-3 w-3/4 rounded-full bg-white/15" />
        <div className="h-3 w-1/2 rounded-full bg-white/10" />
        <div className="mt-2 flex gap-2">
          <div className="h-8 w-24 rounded-md bg-white/90" />
          <div className="h-8 w-24 rounded-md border border-white/25" />
        </div>
      </div>
    </div>
  );
}
