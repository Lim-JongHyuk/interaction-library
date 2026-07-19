"use client";

// deps: 없음 (CSS backdrop-filter 스태킹)
import type { CSSProperties, ReactNode } from "react";

export interface ProgressiveBlurProps {
  /** 블러가 적용될 콘텐츠. 없으면 데모 콜라주 렌더 */
  children?: ReactNode;
  /** 블러가 짙어지는 방향 */
  direction?: "bottom" | "top" | "left" | "right";
  /** 최대 블러 강도(px) */
  strength?: number;
  /** 블러 영역이 컨테이너에서 차지하는 비율(%) */
  coverage?: number;
  /** 블러 위에 얹는 은은한 틴트 (rgba/hex). 빈 값이면 없음 */
  tint?: string;
}

/**
 * iOS 스타일 프로그레시브 블러. backdrop-filter 레이어 6장을 마스크 밴드로
 * 겹쳐 블러가 점진적으로 짙어지는 그라디언트 블러를 만든다.
 * 하드 엣지 하나 없이 콘텐츠가 자연스럽게 흐려진다.
 */
export function ProgressiveBlur({
  children,
  direction = "bottom",
  strength = 16,
  coverage = 45,
  tint = "",
}: ProgressiveBlurProps) {
  const LAYERS = 6;
  const horizontal = direction === "left" || direction === "right";
  // 마스크 0%가 안쪽 경계, 100%가 바깥 가장자리가 되도록 방향과 일치시킨다
  const gradientDir = `to ${direction}`;

  // 오버레이 배치: 방향 쪽 가장자리에 coverage% 만큼
  const overlayPos: CSSProperties = horizontal
    ? {
        top: 0,
        bottom: 0,
        width: `${coverage}%`,
        ...(direction === "left" ? { left: 0 } : { right: 0 }),
      }
    : {
        left: 0,
        right: 0,
        height: `${coverage}%`,
        ...(direction === "top" ? { top: 0 } : { bottom: 0 }),
      };

  return (
    <div className="relative h-full min-h-64 w-full overflow-hidden rounded-2xl">
      {children ?? <DemoCollage />}

      <div className="pointer-events-none absolute" style={overlayPos} aria-hidden="true">
        {Array.from({ length: LAYERS }, (_, i) => {
          // 레이어 i: 블러는 지수적으로 증가, 마스크는 [i/n, (i+2)/n] 밴드
          const blur = (strength * Math.pow(2, i)) / Math.pow(2, LAYERS - 1);
          const start = (i / LAYERS) * 100;
          const mid = ((i + 1) / LAYERS) * 100;
          const end = Math.min(((i + 2) / LAYERS) * 100, 100);
          const mask = `linear-gradient(${gradientDir}, transparent ${start}%, black ${mid}%, ${
            i === LAYERS - 1 ? "black 100%" : `transparent ${end}%`
          })`;
          return (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                maskImage: mask,
                WebkitMaskImage: mask,
              }}
            />
          );
        })}
        {tint && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${gradientDir}, transparent, ${tint})`,
            }}
          />
        )}
      </div>
    </div>
  );
}

/** 블러 효과가 잘 보이도록 만든 데모 콜라주 */
function DemoCollage() {
  const tiles = [
    { hue: 250, label: "Aa" },
    { hue: 180, label: "01" },
    { hue: 20, label: "◆" },
    { hue: 320, label: "Bb" },
    { hue: 130, label: "02" },
    { hue: 45, label: "●" },
    { hue: 210, label: "Cc" },
    { hue: 0, label: "03" },
    { hue: 280, label: "▲" },
  ];
  return (
    <div className="grid h-full w-full grid-cols-3 gap-2 bg-zinc-950 p-2">
      {tiles.map((t, i) => (
        <div
          key={i}
          className="flex items-center justify-center rounded-lg text-xl font-bold text-white/80"
          style={{
            background: `linear-gradient(140deg, hsl(${t.hue} 60% 45%), hsl(${(t.hue + 50) % 360} 60% 28%))`,
          }}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}
