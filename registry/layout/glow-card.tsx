"use client";

// deps: 없음 (CSS radial-gradient + mask)
import { useRef, type ReactNode } from "react";

export interface GlowCardProps {
  children?: ReactNode;
  /** 글로우 색 */
  glowColor?: string;
  /** 글로우 반경(px) */
  glowRadius?: number;
  /** 테두리 두께(px) */
  borderWidth?: number;
  /** 카드 내부에도 은은한 글로우 표시 */
  innerGlow?: boolean;
}

/**
 * 커서를 따라 테두리가 빛나는 다크 글래스 카드. radial-gradient를
 * mask-composite 링에 가둬 커서 근처 테두리만 발광한다.
 * AI 프롬프트 바, 대시보드 카드 등 프리미엄 다크 UI의 표준 패턴.
 */
export function GlowCard({
  children,
  glowColor = "#818cf8",
  glowRadius = 180,
  borderWidth = 1,
  innerGlow = true,
}: GlowCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mk-glow-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mk-glow-y", `${e.clientY - rect.top}px`);
    el.style.setProperty("--mk-glow-o", "1");
  }
  function onPointerLeave() {
    ref.current?.style.setProperty("--mk-glow-o", "0");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="group relative w-full max-w-sm rounded-2xl bg-zinc-900/80 shadow-xl backdrop-blur"
      style={
        {
          "--mk-glow-x": "50%",
          "--mk-glow-y": "50%",
          "--mk-glow-o": "0",
        } as React.CSSProperties
      }
    >
      {/* 상시 미세 테두리 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}
      />

      {/* 커서 추적 글로우 — 테두리 링에만 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: "var(--mk-glow-o)" as unknown as number,
          padding: borderWidth,
          background: `radial-gradient(${glowRadius}px circle at var(--mk-glow-x) var(--mk-glow-y), ${glowColor}, transparent 70%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />

      {/* 내부 은은한 글로우 */}
      {innerGlow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: "calc(var(--mk-glow-o) * 0.12)" as unknown as number,
            background: `radial-gradient(${glowRadius * 1.4}px circle at var(--mk-glow-x) var(--mk-glow-y), ${glowColor}, transparent 70%)`,
          }}
        />
      )}

      <div className="relative z-10 p-5">{children ?? <DemoContent />}</div>
    </div>
  );
}

/** AI 프롬프트 바 스타일의 데모 콘텐츠 */
function DemoContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-sm text-white/60">
        @
      </div>
      <p className="text-sm text-white/35">Build anything...</p>
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-2">
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/70">
            Agent ▾
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/70">
            Auto ▾
          </span>
        </div>
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/8 text-xs text-white/70">
          ↑
        </span>
      </div>
    </div>
  );
}
