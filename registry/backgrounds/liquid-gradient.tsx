"use client";

// deps: none
import { useId } from "react";

const PALETTES = {
  iris: ["#4f46e5", "#a855f7", "#ec4899", "#22d3ee"],
  ember: ["#f97316", "#ef4444", "#eab308", "#f43f5e"],
  lagoon: ["#06b6d4", "#3b82f6", "#14b8a6", "#8b5cf6"],
  mono: ["#3f3f46", "#a1a1aa", "#52525b", "#e4e4e7"],
} as const;

export interface LiquidGradientProps {
  speed?: number;
  palette?: keyof typeof PALETTES;
  blur?: number;
  grain?: boolean;
}

/**
 * 유체처럼 형태가 뭉개지며 도는 블롭 그라디언트 배경.
 * border-radius 모핑 + 회전을 조합해 WebGL 없이 리퀴드 느낌을 낸다.
 */
export function LiquidGradient({ speed = 14, palette = "iris", blur = 36, grain = true }: LiquidGradientProps) {
  const id = useId().replace(/[:]/g, "");
  const morphA = `motionkit-liquid-a-${id}`;
  const morphB = `motionkit-liquid-b-${id}`;
  const [c1, c2, c3, c4] = PALETTES[palette];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-[#0a0a0f]">
      <style>{`
        @keyframes ${morphA} {
          0%,100% { border-radius: 46% 54% 58% 42% / 52% 44% 56% 48%; transform: translate(-8%,-6%) rotate(0deg) scale(1.15); }
          33% { border-radius: 58% 42% 44% 56% / 46% 58% 42% 54%; transform: translate(6%,4%) rotate(120deg) scale(1.25); }
          66% { border-radius: 42% 58% 52% 48% / 58% 42% 54% 46%; transform: translate(-4%,8%) rotate(240deg) scale(1.1); }
        }
        @keyframes ${morphB} {
          0%,100% { border-radius: 54% 46% 42% 58% / 48% 56% 44% 52%; transform: translate(10%,8%) rotate(0deg) scale(1.2); }
          50% { border-radius: 44% 56% 58% 42% / 56% 44% 52% 48%; transform: translate(-8%,-10%) rotate(-180deg) scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .${morphA}, .${morphB} { animation: none !important; }
        }
      `}</style>

      <div
        className={morphA}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "-15%",
          background: `conic-gradient(from 40deg, ${c1}, ${c2}, ${c3}, ${c1})`,
          filter: `blur(${blur}px)`,
          opacity: 0.8,
          animation: `${morphA} ${speed}s ease-in-out infinite`,
        }}
      />
      <div
        className={morphB}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "5%",
          background: `radial-gradient(closest-side, ${c4}, transparent 72%)`,
          filter: `blur(${blur * 1.2}px)`,
          opacity: 0.65,
          mixBlendMode: "screen",
          animation: `${morphB} ${speed * 1.4}s ease-in-out infinite`,
        }}
      />

      {grain && (
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.14] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
          }}
        />
      )}
    </div>
  );
}
