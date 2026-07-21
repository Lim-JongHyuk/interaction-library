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

export interface DeviceScrollProps {
  /** 열린 뒤 최종 확대 배율 */
  zoom?: number;
  /** 화면 UI 액센트 색 */
  accent?: string;
  /** 화면 뒤 글로우 표시 */
  glow?: boolean;
}

type Num = MotionValue<number> | number;

/**
 * 스크롤을 내리면 3D 노트북 뚜껑이 열리며 화면 UI가 켜지는 제품 쇼케이스.
 * CSS 3D(preserve-3d)로 커버·스크린·키보드 면을 힌지 기준으로 조립하고,
 * 스크롤 진행도로 시점·개폐 각도·스케일을 스크럽한다.
 */
export function DeviceScroll({ zoom = 1, accent = "#6366f1", glow = true }: DeviceScrollProps) {
  const reducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // 시점: 위에서 내려다보다(-64°) 정면 가까이(-16°)로
  const view = useTransform(scrollYProgress, [0, 0.55], [-64, -16]);
  // 뚜껑: 닫힘(-89°) → 살짝 젖혀 열림(+8°)
  const lid = useTransform(scrollYProgress, [0.08, 0.62], [-89, 8]);
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.78, zoom]);
  const ui = useTransform(scrollYProgress, [0.42, 0.72], [0, 1]);
  const uiY = useTransform(scrollYProgress, [0.42, 0.72], [14, 0]);
  const glowO = useTransform(scrollYProgress, [0.5, 0.85], [0, glow ? 0.6 : 0]);
  const hintO = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  if (reducedMotion) {
    return (
      <section
        aria-label="노트북 제품 쇼케이스"
        className="flex min-h-[520px] w-full items-center justify-center"
      >
        <Laptop view={-16} lid={8} scale={zoom} ui={1} uiY={0} glowO={glow ? 0.6 : 0} accent={accent} />
      </section>
    );
  }

  return (
    <section ref={wrapperRef} aria-label="노트북 제품 쇼케이스" className="relative h-[260vh] w-full">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <Laptop view={view} lid={lid} scale={scale} ui={ui} uiY={uiY} glowO={glowO} accent={accent} />
        <motion.p
          style={{ opacity: hintO }}
          className="pointer-events-none absolute bottom-10 text-xs uppercase tracking-[0.3em] text-zinc-500"
        >
          Scroll to open
        </motion.p>
      </div>
    </section>
  );
}

function Laptop({
  view,
  lid,
  scale,
  ui,
  uiY,
  glowO,
  accent,
}: {
  view: Num;
  lid: Num;
  scale: Num;
  ui: Num;
  uiY: Num;
  glowO: Num;
  accent: string;
}) {
  return (
    <div style={{ perspective: 1100 }} className="relative" aria-hidden="true">
      {/* 글로우 */}
      <motion.div
        style={{
          opacity: glowO,
          background: `radial-gradient(closest-side, ${accent}, transparent 70%)`,
        }}
        className="absolute -inset-16 blur-3xl"
      />

      <motion.div
        style={{ rotateX: view, scale }}
        className="relative h-[220px] w-[340px] [transform-style:preserve-3d]"
      >
        {/* 뚜껑: 힌지(아래 변) 기준 회전. 커버 면과 스크린 면을 앞뒤로 겹친다 */}
        <motion.div
          style={{ rotateX: lid }}
          className="absolute inset-0 origin-bottom [transform-style:preserve-3d]"
        >
          {/* 커버(등판): 닫혀 있을 때 위에서 보이는 면 */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-800 ring-1 ring-zinc-500/50 [transform:rotateX(180deg)] [backface-visibility:hidden]">
            <span
              className="h-8 w-8 rounded-full opacity-80"
              style={{ background: `radial-gradient(circle at 35% 35%, ${accent}, #18181b)` }}
            />
          </div>

          {/* 스크린 면 */}
          <div className="absolute inset-0 rounded-xl bg-zinc-900 p-2 ring-1 ring-zinc-600 [backface-visibility:hidden]">
            <span className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-zinc-950" />
            <div
              className="relative h-full w-full overflow-hidden rounded-lg"
              style={{ background: `linear-gradient(135deg, ${accent}22, #09090b 60%)` }}
            >
              <motion.div style={{ opacity: ui, y: uiY }} className="flex h-full flex-col gap-2 p-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-400/80" />
                  <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 h-2 flex-1 rounded bg-white/10" />
                </div>
                <div className="grid flex-1 grid-cols-3 gap-2">
                  <div className="flex flex-col gap-1.5 rounded-md bg-white/5 p-2">
                    <span className="h-1.5 w-3/4 rounded bg-white/20" />
                    <span className="h-1.5 w-1/2 rounded bg-white/10" />
                    <span className="h-1.5 w-2/3 rounded bg-white/10" />
                  </div>
                  <div className="col-span-2 flex flex-col gap-2">
                    <div
                      className="h-1/2 rounded-md"
                      style={{ background: `linear-gradient(120deg, ${accent}cc, ${accent}44)` }}
                    />
                    <div className="grid flex-1 grid-cols-2 gap-2">
                      <div className="rounded-md bg-white/5" />
                      <div className="rounded-md bg-white/10" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* 베이스(키보드): 힌지에서 수평으로 눕힌 면 */}
        <div className="absolute left-0 top-full h-[190px] w-full origin-top rounded-b-2xl bg-gradient-to-b from-zinc-600 to-zinc-800 p-4 ring-1 ring-zinc-500/50 [transform:rotateX(90deg)]">
          <div className="flex h-full flex-col gap-1.5">
            {[14, 14, 13, 12].map((n, r) => (
              <div key={r} className="flex justify-center gap-1.5">
                {Array.from({ length: n }).map((_, i) => (
                  <span key={i} className="h-4 flex-1 rounded-[3px] bg-zinc-900/80" />
                ))}
              </div>
            ))}
            <div className="mx-auto mt-2 h-14 w-36 rounded-lg bg-zinc-900/60" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
