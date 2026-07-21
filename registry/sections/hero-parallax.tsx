"use client";

// deps: motion
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, useReducedMotion, type MotionValue } from "motion/react";

export interface ParallaxProduct {
  title: string;
  /** 타일 배경 hue (0–360) */
  hue?: number;
  /** 이미지 URL. 지정하면 타일 배경으로 렌더 */
  image?: string;
}

export interface HeroParallaxProps {
  products?: ParallaxProduct[];
  /** 행이 가로로 이동하는 거리(px) */
  travel?: number;
  /** 타일 라벨·헤드라인 액센트 색 */
  accent?: string;
  /** 상단 헤드라인 */
  heading?: string;
}

const DEFAULT_PRODUCTS: ParallaxProduct[] = [
  { title: "Nebula OS", hue: 250 },
  { title: "Halcyon", hue: 200 },
  { title: "Kanso", hue: 160 },
  { title: "Monarch", hue: 30 },
  { title: "Vela", hue: 320 },
  { title: "Drift", hue: 190 },
  { title: "Ember", hue: 12 },
  { title: "Slate", hue: 220 },
  { title: "Prism", hue: 280 },
  { title: "Cove", hue: 175 },
  { title: "Aster", hue: 340 },
  { title: "Loom", hue: 145 },
  { title: "Onyx", hue: 240 },
  { title: "Flux", hue: 265 },
  { title: "Reef", hue: 185 },
];

/**
 * 스크롤에 따라 여러 행이 서로 반대 방향으로 미끄러지고, 상단 헤드라인이
 * 3D로 펴지며 등장하는 히어로 패럴럭스. 제품 라인업·포트폴리오 랜딩 단골.
 */
export function HeroParallax({
  products = DEFAULT_PRODUCTS,
  travel = 320,
  accent = "#6366f1",
  heading = "The studio behind\nyour next launch.",
}: HeroParallaxProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const spring = { stiffness: 220, damping: 40, mass: 1 };
  const p = useSpring(scrollYProgress, spring);

  const xForward = useTransform(p, [0, 1], [0, travel]);
  const xBackward = useTransform(p, [0, 1], [0, -travel]);
  const rotateX = useTransform(p, [0, 0.2], [12, 0]);
  const opacity = useTransform(p, [0, 0.2], [0.4, 1]);
  const translateY = useTransform(p, [0, 0.25], [-40, 120]);

  const rows = [products.slice(0, 5), products.slice(5, 10), products.slice(10, 15)];
  const rowX = [xForward, xBackward, xForward];

  if (reducedMotion) {
    return (
      <section aria-label="제품 패럴럭스 히어로" className="w-full px-6 py-16">
        <Heading heading={heading} accent={accent} />
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product, i) => (
            <Tile key={i} product={product} accent={accent} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} aria-label="제품 패럴럭스 히어로" className="relative h-[240vh] w-full overflow-hidden">
      <div className="sticky top-0 flex h-screen flex-col justify-center [perspective:1000px]">
        <motion.div style={{ rotateX, opacity, y: translateY }} className="[transform-style:preserve-3d]">
          <div className="relative z-10 mx-auto max-w-5xl px-6">
            <Heading heading={heading} accent={accent} />
          </div>

          <div className="mt-10 flex flex-col gap-4">
            {rows.map((row, r) => (
              <Row key={r} x={rowX[r]} reverse={r === 1}>
                {row.map((product, i) => (
                  <Tile key={i} product={product} accent={accent} />
                ))}
              </Row>
            ))}
          </div>
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />
      </div>
    </section>
  );
}

function Heading({ heading, accent }: { heading: string; accent: string }) {
  return (
    <h2 className="whitespace-pre-line text-center text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
      {heading.split("\n").map((line, i) => (
        <span key={i} className="block" style={i === 1 ? { color: accent } : undefined}>
          {line}
        </span>
      ))}
    </h2>
  );
}

function Row({ x, reverse, children }: { x: MotionValue<number>; reverse: boolean; children: React.ReactNode }) {
  return (
    <motion.div
      style={{ x }}
      className={`flex w-max gap-4 px-4 ${reverse ? "self-end" : "self-start"}`}
      aria-hidden="true"
    >
      {children}
    </motion.div>
  );
}

function Tile({ product, accent }: { product: ParallaxProduct; accent: string }) {
  const hue = product.hue ?? 250;
  return (
    <div
      className="relative flex h-40 w-60 shrink-0 flex-col justify-end overflow-hidden rounded-2xl p-4 shadow-xl ring-1 ring-white/12 transition-transform duration-300 hover:-translate-y-1.5 sm:h-52 sm:w-72"
      style={{
        background: product.image
          ? undefined
          : `linear-gradient(150deg, hsl(${hue} 68% 52%), hsl(${(hue + 45) % 360} 70% 24%))`,
      }}
    >
      {product.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" aria-hidden="true" />
      <span className="relative h-1.5 w-8 rounded-full" style={{ backgroundColor: accent }} />
      <p className="relative mt-2 text-sm font-medium text-white">{product.title}</p>
    </div>
  );
}
