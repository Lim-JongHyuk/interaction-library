"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export interface HScrollPanel {
  title: string;
  subtitle: string;
  /** 패널 배경 hue (0–360) */
  hue?: number;
  /** 이미지 URL. 지정하면 패널 배경으로 렌더 */
  image?: string;
}

export interface HorizontalScrollGalleryProps {
  panels?: HScrollPanel[];
  /** 패널 사이 간격(px) */
  gap?: number;
  /** 진행 표시 액센트 색 */
  accent?: string;
  /** 하단 진행 바 표시 */
  showProgress?: boolean;
}

const DEFAULT_PANELS: HScrollPanel[] = [
  { title: "Studio Voss", subtitle: "Brand identity · 2026", hue: 250 },
  { title: "Halcyon", subtitle: "Editorial direction", hue: 190 },
  { title: "Field Notes", subtitle: "Motion & interaction", hue: 24 },
  { title: "Monolith", subtitle: "Spatial installation", hue: 320 },
  { title: "Afterglow", subtitle: "Film & color grade", hue: 150 },
];

/**
 * 세로 스크롤을 가로 이동으로 변환하는 스크롤-스크럽 갤러리.
 * sticky 뷰포트를 잡고 트랙 폭을 측정해 스크롤 진행도로 정확히
 * `0 → -(트랙폭 − 뷰포트폭)`만큼 translateX 한다 (에이전시 쇼케이스 단골 패턴).
 */
export function HorizontalScrollGallery({
  panels = DEFAULT_PANELS,
  gap = 20,
  accent = "#6366f1",
  showProgress = true,
}: HorizontalScrollGalleryProps) {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // 트랙이 뷰포트를 넘어가는 만큼을 측정해 스크롤로 소비할 거리를 결정
  useEffect(() => {
    if (reducedMotion) return;
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - track.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [reducedMotion, panels.length]);

  if (reducedMotion) {
    return (
      <section aria-label="가로 스크롤 갤러리" className="w-full">
        <div className="flex snap-x gap-5 overflow-x-auto px-6 py-10" style={{ gap }}>
          {panels.map((p, i) => (
            <div key={i} className="snap-start shrink-0">
              <Panel panel={p} index={i} total={panels.length} accent={accent} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 스크롤로 소비할 세로 길이 = 가로 이동 거리에 비례. 최소 1화면 확보.
  const sectionHeight = `calc(100vh + ${distance}px)`;

  return (
    <section ref={sectionRef} aria-label="가로 스크롤 갤러리" className="relative w-full" style={{ height: sectionHeight }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x, gap }} className="flex px-[8vw] will-change-transform">
          {panels.map((p, i) => (
            <div key={i} className="shrink-0">
              <Panel panel={p} index={i} total={panels.length} accent={accent} />
            </div>
          ))}
        </motion.div>

        {showProgress && (
          <div className="mx-auto mt-8 h-[3px] w-40 overflow-hidden rounded-full bg-white/10">
            <motion.div style={{ width: progress, background: accent }} className="h-full rounded-full" />
          </div>
        )}
      </div>
    </section>
  );
}

function Panel({
  panel,
  index,
  total,
  accent,
}: {
  panel: HScrollPanel;
  index: number;
  total: number;
  accent: string;
}) {
  const hue = panel.hue ?? 250;
  return (
    <article
      className="relative flex h-[62vh] w-[74vw] max-w-[420px] flex-col justify-end overflow-hidden rounded-3xl p-6 shadow-2xl ring-1 ring-white/15"
      style={{
        background: panel.image
          ? undefined
          : `linear-gradient(155deg, hsl(${hue} 68% 52%), hsl(${(hue + 45) % 360} 72% 22%))`,
      }}
    >
      {panel.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={panel.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
      <span
        className="relative mb-3 w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold tabular-nums tracking-wider text-white"
        style={{ backgroundColor: accent }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      <h3 className="relative text-2xl font-semibold text-white">{panel.title}</h3>
      <p className="relative text-sm text-white/75">{panel.subtitle}</p>
    </article>
  );
}
