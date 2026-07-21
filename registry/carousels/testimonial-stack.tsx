"use client";

// deps: motion
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  /** 아바타 배경 hue (0–360) */
  hue?: number;
  /** 아바타 이미지 URL */
  image?: string;
}

export interface TestimonialStackProps {
  testimonials?: Testimonial[];
  /** 자동 넘김 사용 */
  autoplay?: boolean;
  /** 자동 넘김 간격(초) */
  interval?: number;
  /** 컨트롤·강조 액센트 색 */
  accent?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote: "도입 첫 주에 배포 시간이 40분에서 4분으로 줄었다. 팀 전체가 체감할 정도의 변화였다.",
    name: "Mara Lindqvist",
    role: "VP Engineering, Northwind",
    hue: 250,
  },
  {
    quote: "디자이너가 코드를 몰라도 프로덕션 수준의 인터랙션을 붙일 수 있게 됐다. 이게 핵심이다.",
    name: "Theo Alvarez",
    role: "Design Lead, Studio Kestrel",
    hue: 20,
  },
  {
    quote: "문서화와 접근성이 기본으로 딸려 온다. 우리가 따로 챙기던 일이 사라졌다.",
    name: "Priya Nair",
    role: "Head of Product, Loom Labs",
    hue: 170,
  },
  {
    quote: "레퍼런스로 쓰려고 열었다가 그대로 프로덕션에 넣었다. 그만큼 완성도가 높다.",
    name: "Julian Weiss",
    role: "Founder, Vela",
    hue: 320,
  },
];

/**
 * 아바타가 3D로 겹쳐 회전하고 인용문이 단어 단위로 크로스페이드되는 후기 슬라이더.
 * 자동 넘김 + 이전/다음 컨트롤을 갖춘다. 랜딩의 소셜 프루프 섹션 단골.
 */
export function TestimonialStack({
  testimonials = DEFAULT_TESTIMONIALS,
  autoplay = true,
  interval = 5,
  accent = "#6366f1",
}: TestimonialStackProps) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const count = testimonials.length;

  const go = useCallback((dir: 1 | -1) => setActive((a) => (a + dir + count) % count), [count]);

  useEffect(() => {
    if (!autoplay || reducedMotion || count <= 1) return;
    const id = setInterval(() => setActive((a) => (a + 1) % count), interval * 1000);
    return () => clearInterval(id);
  }, [autoplay, reducedMotion, interval, count]);

  const current = testimonials[active];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 px-6 py-10 sm:flex-row sm:gap-12">
      {/* 3D 아바타 스택 */}
      <div className="relative h-56 w-56 shrink-0 [perspective:1000px]">
        {testimonials.map((t, i) => {
          const offset = i - active;
          const isActive = i === active;
          return (
            <motion.div
              key={i}
              className="absolute inset-0 origin-center overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/15"
              initial={false}
              animate={
                reducedMotion
                  ? { opacity: isActive ? 1 : 0 }
                  : {
                      z: isActive ? 0 : -80,
                      rotateY: isActive ? 0 : offset > 0 ? -32 : 32,
                      x: isActive ? 0 : offset > 0 ? 44 : -44,
                      scale: isActive ? 1 : 0.9,
                      opacity: Math.abs(offset) > 1 ? 0 : isActive ? 1 : 0.4,
                    }
              }
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              style={{ zIndex: isActive ? count : count - Math.abs(offset) }}
              aria-hidden={!isActive}
            >
              <Avatar t={t} />
            </motion.div>
          );
        })}
      </div>

      {/* 인용문 */}
      <div className="flex min-h-[14rem] flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={active}
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: 0.35 }}
          >
            <svg viewBox="0 0 24 24" fill={accent} className="mb-3 h-7 w-7 opacity-80" aria-hidden="true">
              <path d="M9.5 5C6.5 6.5 5 9 5 12.5V19h6v-6H8.2c0-2.2 1-3.7 3-4.6L9.5 5Zm9 0c-3 1.5-4.5 4-4.5 7.5V19h6v-6h-2.8c0-2.2 1-3.7 3-4.6L18.5 5Z" />
            </svg>
            <p className="text-lg font-medium leading-relaxed text-foreground">{current.quote}</p>
            <footer className="mt-4">
              <p className="font-semibold text-foreground">{current.name}</p>
              <p className="text-sm text-muted-foreground">{current.role}</p>
            </footer>
          </motion.blockquote>
        </AnimatePresence>

        {/* 컨트롤 */}
        <div className="mt-6 flex items-center gap-3">
          <StackButton label="이전 후기" onClick={() => go(-1)} accent={accent}>
            <path d="M15 18l-6-6 6-6" />
          </StackButton>
          <StackButton label="다음 후기" onClick={() => go(1)} accent={accent}>
            <path d="M9 6l6 6-6 6" />
          </StackButton>
          <div className="ml-2 flex gap-1.5" role="tablist" aria-label="후기 선택">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === active}
                aria-label={`${i + 1}번 후기`}
                onClick={() => setActive(i)}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === active ? 22 : 8,
                  backgroundColor: i === active ? accent : "rgb(255 255 255 / 0.2)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ t }: { t: Testimonial }) {
  const hue = t.hue ?? 250;
  return (
    <div
      className="flex h-full w-full items-end justify-center"
      style={{ background: t.image ? undefined : `linear-gradient(155deg, hsl(${hue} 65% 55%), hsl(${(hue + 40) % 360} 70% 30%))` }}
    >
      {t.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.image} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="mb-8 text-6xl font-semibold text-white/90">{t.name.charAt(0)}</span>
      )}
    </div>
  );
}

function StackButton({
  label,
  onClick,
  accent,
  children,
}: {
  label: string;
  onClick: () => void;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-foreground outline-none transition-colors hover:border-white/30 focus-visible:ring-2"
      style={{ ["--tw-ring-color" as string]: accent } as React.CSSProperties}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        {children}
      </svg>
    </button>
  );
}
