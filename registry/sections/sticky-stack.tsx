"use client";

// deps: motion
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export interface StackSection {
  title: string;
  body: string;
  /** 카드 배경 hue (0–360) */
  hue?: number;
  /** 이미지 URL. 지정하면 우측 비주얼로 렌더 */
  image?: string;
}

export interface StickyStackProps {
  items?: StackSection[];
  /** 카드가 뒤로 밀릴 때 최종 스케일 */
  shrinkTo?: number;
  /** 카드 상단 고정 위치(vh) */
  stickyTop?: number;
}

const DEFAULT_ITEMS: StackSection[] = [
  { title: "Research", body: "인터뷰와 데이터로 문제를 정의합니다. 감이 아니라 근거로 시작하는 디자인.", hue: 243 },
  { title: "Design", body: "시스템으로 사고하고 디테일로 증명합니다. 컴포넌트 하나까지 의도가 있습니다.", hue: 283 },
  { title: "Build", body: "디자인과 코드 사이의 손실 없이, 마이크로 인터랙션까지 그대로 구현합니다.", hue: 199 },
  { title: "Launch", body: "출시가 끝이 아니라 시작. 데이터를 보며 다음 반복을 준비합니다.", hue: 152 },
];

/**
 * 스크롤하면 다음 카드가 이전 카드를 덮으며 쌓이는 스티키 스택 섹션.
 * 덮이는 카드는 스케일·밝기가 줄어 실제 종이가 겹치는 깊이감을 낸다.
 */
export function StickyStack({
  items = DEFAULT_ITEMS,
  shrinkTo = 0.92,
  stickyTop = 12,
}: StickyStackProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="flex w-full flex-col gap-6">
        {items.map((item, i) => (
          <Card key={i} item={item} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      {items.map((item, i) => (
        <StackCard
          key={i}
          item={item}
          index={i}
          isLast={i === items.length - 1}
          shrinkTo={shrinkTo}
          stickyTop={stickyTop}
        />
      ))}
    </div>
  );
}

function StackCard({
  item,
  index,
  isLast,
  shrinkTo,
  stickyTop,
}: {
  item: StackSection;
  index: number;
  isLast: boolean;
  shrinkTo: number;
  stickyTop: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // 다음 카드가 이 카드를 덮는 동안(0→1) 뒤로 물러난다
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["end end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, shrinkTo]);
  const filter = useTransform(scrollYProgress, [0, 1], ["brightness(1)", "brightness(0.75)"]);

  return (
    <div ref={wrapperRef} className={isLast ? "" : "pb-[35vh]"}>
      <motion.div
        style={{
          position: "sticky",
          top: `${stickyTop}vh`,
          scale: isLast ? 1 : scale,
          filter: isLast ? undefined : filter,
          transformOrigin: "center top",
        }}
      >
        <Card item={item} index={index} />
      </motion.div>
    </div>
  );
}

function Card({ item, index }: { item: StackSection; index: number }) {
  const hue = item.hue ?? 240;
  return (
    <div
      className="grid min-h-[52vh] w-full grid-cols-1 gap-8 overflow-hidden rounded-3xl p-8 shadow-2xl ring-1 ring-white/10 md:grid-cols-2 md:p-12"
      style={{
        background: `linear-gradient(150deg, hsl(${hue} 38% 14%), hsl(${(hue + 30) % 360} 45% 9%))`,
      }}
    >
      <div className="flex flex-col justify-center gap-4">
        <span className="text-xs font-mono tracking-widest" style={{ color: `hsl(${hue} 85% 72%)` }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{item.title}</h3>
        <p className="max-w-sm text-sm leading-relaxed text-white/60">{item.body}</p>
      </div>
      <div className="flex items-center justify-center">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt="" className="max-h-64 w-full rounded-xl object-cover" />
        ) : (
          <div
            className="aspect-[4/3] w-full max-w-sm rounded-xl"
            style={{
              background: `linear-gradient(135deg, hsl(${hue} 80% 62% / 0.85), hsl(${(hue + 60) % 360} 80% 52% / 0.85))`,
            }}
          />
        )}
      </div>
    </div>
  );
}
