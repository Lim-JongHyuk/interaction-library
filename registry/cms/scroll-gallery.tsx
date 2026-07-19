"use client";

// deps: motion
import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

export interface GalleryItem {
  title: string;
  subtitle?: string;
  /** 이미지 URL. 없으면 hue 기반 그라디언트 카드 렌더 */
  image?: string;
  hue?: number;
}

export interface ScrollGalleryProps {
  items?: GalleryItem[];
  /** 섹션의 스크롤 길이(vh). 클수록 천천히 이동 */
  scrollLength?: number;
  /** 카드 간격(px) */
  gap?: number;
}

const DEFAULT_ITEMS: GalleryItem[] = [
  { title: "Terra", subtitle: "Editorial, 2026", hue: 25 },
  { title: "Pulse", subtitle: "Campaign", hue: 340 },
  { title: "Litho", subtitle: "Print series", hue: 210 },
  { title: "Field", subtitle: "Photography", hue: 145 },
  { title: "Neon", subtitle: "Identity", hue: 285 },
  { title: "Strata", subtitle: "Exhibition", hue: 190 },
];

/**
 * 세로 스크롤을 가로 이동으로 바꾸는 스티키 스크롤 갤러리.
 * 섹션을 지나는 동안 화면이 고정되고 카드 트랙이 수평으로 흐른다.
 */
export function ScrollGallery({
  items = DEFAULT_ITEMS,
  scrollLength = 250,
  gap = 24,
}: ScrollGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [travel, setTravel] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  // 트랙 초과 폭 측정 (리사이즈 대응)
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () =>
      setTravel(Math.max(0, track.scrollWidth - (track.parentElement?.clientWidth ?? 0)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [items]);

  const cards = items.map((item, i) => (
    <figure
      key={i}
      className="relative h-72 w-56 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-xl"
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.title} draggable={false} className="h-full w-full object-cover" />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(160deg, hsl(${item.hue ?? 240} 50% 46%), hsl(${((item.hue ?? 240) + 45) % 360} 55% 22%))`,
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "15px 15px",
            }}
          />
        </div>
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
        <p className="text-sm font-semibold text-white">{item.title}</p>
        {item.subtitle && <p className="mt-0.5 text-xs text-white/60">{item.subtitle}</p>}
      </figcaption>
    </figure>
  ));

  if (reducedMotion) {
    // 스크럽 없이 일반 가로 스크롤 목록
    return (
      <div className="w-full overflow-x-auto">
        <div className="flex w-max py-2" style={{ gap }}>
          {cards}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: `${scrollLength}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={trackRef} className="flex px-6" style={{ x, gap }}>
          {cards}
        </motion.div>
      </div>
    </div>
  );
}
