"use client";

// deps: 없음 (CSS conic-gradient + mask)
import { useId, type ReactNode } from "react";

export interface BorderBeamButtonProps {
  children?: ReactNode;
  /** 빔이 한 바퀴 도는 시간(초) */
  duration?: number;
  /** 빔 그라디언트 시작 색 */
  colorFrom?: string;
  /** 빔 그라디언트 끝 색 */
  colorTo?: string;
  /** 빔의 호 길이(도). 클수록 빔이 길다 */
  beamArc?: number;
  /** 테두리 두께(px) */
  borderWidth?: number;
  /** 지정하면 <a> 링크로 렌더 */
  href?: string;
  onClick?: () => void;
}

/**
 * 다크 글래스 필 버튼의 테두리를 따라 그라디언트 빔이 흐르는 CTA.
 * mask-composite로 뚫은 링 안에서 코닉 그라디언트가 회전한다.
 */
export function BorderBeamButton({
  children = "Subscribe",
  duration = 4,
  colorFrom = "#f97316",
  colorTo = "#e11d48",
  beamArc = 70,
  borderWidth = 1.5,
  href,
  onClick,
}: BorderBeamButtonProps) {
  const id = useId().replace(/[:]/g, "");
  const spin = `motionkit-beam-${id}`;
  const Tag = (href ? "a" : "button") as "button";

  return (
    <Tag
      {...(href ? { href } : { type: "button" })}
      onClick={onClick}
      className="relative isolate inline-flex items-center justify-center overflow-hidden rounded-full bg-zinc-900/90 px-6 py-3 text-sm font-semibold text-white shadow-lg outline-none backdrop-blur transition-transform duration-200 hover:scale-[1.03] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <style>{`
        @keyframes ${spin} { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .${spin} { animation: none !important; }
        }
      `}</style>

      {/* 은은한 상시 테두리 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09)" }}
      />

      {/* 빔 링 — mask-composite로 테두리만 남긴 뒤 코닉 그라디언트를 회전 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
        style={{
          padding: borderWidth,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      >
        <span
          className={spin}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "300%",
            aspectRatio: "1",
            translate: "-50% -50%",
            background: `conic-gradient(from 0deg, transparent 0deg ${360 - beamArc}deg, ${colorFrom} ${360 - beamArc * 0.45}deg, ${colorTo} ${360 - beamArc * 0.12}deg, transparent 360deg)`,
            animation: `${spin} ${duration}s linear infinite`,
          }}
        />
      </span>

      {/* 빔을 따라오는 내부 글로우 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-50"
      >
        <span
          className={spin}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "300%",
            aspectRatio: "1",
            translate: "-50% -50%",
            background: `conic-gradient(from 0deg, transparent 0deg ${360 - beamArc}deg, ${colorFrom}33 ${360 - beamArc * 0.4}deg, ${colorTo}55 ${360 - beamArc * 0.1}deg, transparent 360deg)`,
            filter: "blur(10px)",
            animation: `${spin} ${duration}s linear infinite`,
          }}
        />
      </span>

      <span className="relative z-10">{children}</span>
    </Tag>
  );
}
