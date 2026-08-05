"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

export interface CompareSliderProps {
  /** Before 이미지 URL. 없으면 데모용 듀오톤 카드 렌더 */
  before?: string;
  /** After 이미지 URL. 없으면 데모용 듀오톤 카드 렌더 */
  after?: string;
  /** 초기 핸들 위치 (0–100) */
  initial?: number;
  /** 분할 방향 */
  orientation?: "horizontal" | "vertical";
  /** Before/After 라벨 표시 */
  showLabels?: boolean;
  /** 핸들 액센트 색 */
  handleColor?: string;
}

/**
 * Before/After 이미지 비교 슬라이더. 드래그·클릭·키보드(←→, Home/End)로
 * 분할선을 옮기고, 스프링 감쇠로 핸들이 부드럽게 따라온다.
 */
export function CompareSlider({
  before,
  after,
  initial = 50,
  orientation = "horizontal",
  showLabels = true,
  handleColor = "#ffffff",
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const horizontal = orientation === "horizontal";

  const target = useMotionValue(initial);
  const pos = useSpring(target, { stiffness: 400, damping: 40 });
  const [ariaNow, setAriaNow] = useState(Math.round(initial));
  const [appliedInitial, setAppliedInitial] = useState(initial);
  const dragging = useRef(false);

  // initial은 모션 값의 시작점일 뿐이라 값이 바뀌어도 재마운트 없이는 반영되지 않는다
  if (initial !== appliedInitial) {
    setAppliedInitial(initial);
    setAriaNow(Math.round(initial));
    target.set(initial);
  }

  const clip = useTransform(pos, (v) =>
    horizontal ? `inset(0 0 0 ${v}%)` : `inset(${v}% 0 0 0)`
  );
  const handlePos = useTransform(pos, (v) => `${v}%`);
  const beforeLabelOpacity = useTransform(pos, [0, 12], [0, 1]);
  const afterLabelOpacity = useTransform(pos, [88, 100], [1, 0]);

  function setFromPointer(e: React.PointerEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    const ratio = horizontal
      ? (e.clientX - rect.left) / rect.width
      : (e.clientY - rect.top) / rect.height;
    const next = Math.min(100, Math.max(0, ratio * 100));
    target.set(next);
    setAriaNow(Math.round(next));
  }

  function nudge(delta: number) {
    const next = Math.min(100, Math.max(0, target.get() + delta));
    target.set(next);
    setAriaNow(Math.round(next));
  }

  return (
    <div
      ref={containerRef}
      className="group relative aspect-[16/10] w-full touch-none select-none overflow-hidden rounded-2xl shadow-xl"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setFromPointer(e);
      }}
      onPointerMove={(e) => {
        if (dragging.current) setFromPointer(e);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      {/* Before 레이어 (바닥) */}
      <Layer src={before} variant="before" />

      {/* After 레이어 (clip-path로 분할) */}
      <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
        <Layer src={after} variant="after" />
      </motion.div>

      {/* 라벨 */}
      {showLabels && (
        <>
          <motion.span
            style={{ opacity: beforeLabelOpacity }}
            className={
              "pointer-events-none absolute rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-white backdrop-blur-sm " +
              (horizontal ? "left-3 top-3" : "left-3 top-3")
            }
          >
            Before
          </motion.span>
          <motion.span
            style={{ opacity: afterLabelOpacity }}
            className={
              "pointer-events-none absolute rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-white backdrop-blur-sm " +
              (horizontal ? "right-3 top-3" : "bottom-3 left-3")
            }
          >
            After
          </motion.span>
        </>
      )}

      {/* 분할선 + 핸들 */}
      <motion.div
        role="slider"
        aria-label="Before / After 비교"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ariaNow}
        aria-orientation={horizontal ? "horizontal" : "vertical"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (horizontal ? e.key === "ArrowLeft" : e.key === "ArrowUp") nudge(-4);
          else if (horizontal ? e.key === "ArrowRight" : e.key === "ArrowDown") nudge(4);
          else if (e.key === "Home") nudge(-100);
          else if (e.key === "End") nudge(100);
          else return;
          e.preventDefault();
        }}
        className={
          "absolute z-10 flex items-center justify-center outline-none " +
          (horizontal
            ? "top-0 h-full w-0 -translate-x-1/2 cursor-ew-resize"
            : "left-0 h-0 w-full -translate-y-1/2 cursor-ns-resize")
        }
        style={horizontal ? { left: handlePos } : { top: handlePos }}
      >
        <div
          className={horizontal ? "h-full w-0.5" : "h-0.5 w-full"}
          style={{ backgroundColor: handleColor, boxShadow: "0 0 12px rgba(0,0,0,0.35)" }}
        />
        <div
          className="absolute flex h-9 w-9 items-center justify-center rounded-full shadow-lg ring-1 ring-black/10 transition-transform duration-150 group-active:scale-95"
          style={{ backgroundColor: handleColor }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={horizontal ? "" : "rotate-90"}
            aria-hidden="true"
          >
            <path d="M4.5 2.5 1 7l3.5 4.5M9.5 2.5 13 7l-3.5 4.5" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

/** 이미지가 없을 때도 데모가 성립하도록 듀오톤 목업 렌더 */
function Layer({ src, variant }: { src?: string; variant: "before" | "after" }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
    );
  }
  const isBefore = variant === "before";
  return (
    <div
      className="absolute inset-0"
      style={{
        background: isBefore
          ? "linear-gradient(135deg, #27272a, #52525b)"
          : "linear-gradient(135deg, #4338ca, #7c3aed 55%, #06b6d4)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-5xl font-bold tracking-tight md:text-6xl"
          style={{ color: isBefore ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.85)" }}
        >
          {isBefore ? "Draft" : "Final"}
        </span>
      </div>
      {/* 필름 그레인 느낌의 도트 패턴 */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
    </div>
  );
}
