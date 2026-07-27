"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface FluidGlassButtonProps {
  label?: string;
  /** 링크로 렌더할 주소. 없으면 <button>으로 렌더된다. */
  href?: string;
  onClick?: () => void;
  /** 버튼 본체(유리 안쪽) 색 */
  baseColor?: string;
  /** 유리 테두리 글로우 색 */
  glassColor?: string;
  /** 테두리 두께(px) */
  rimWidth?: number;
  /** 안쪽에 반짝이는 별 알갱이 개수 */
  particles?: number;
  /** 모서리 반경(px) */
  radius?: number;
}

// 시드 고정 의사난수 — 별 위치가 서버/클라이언트에서 동일해야 hydration이 어긋나지 않는다.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(count: number) {
  const rand = mulberry32(count * 7919 + 17);
  return Array.from({ length: count }, () => ({
    x: 8 + rand() * 84,
    y: 18 + rand() * 64,
    size: 1 + rand() * 1.6,
    delay: rand() * 3,
    dur: 1.6 + rand() * 2.2,
  }));
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * 은은하게 빛나는 테두리 글로우와 안쪽에 반짝이는 별이 있는 글래스모피즘 버튼.
 * 호버하면 글로우가 밝아진다. 커서를 따라다니는 효과 없이 정적으로 은은하게 빛난다.
 */
export function FluidGlassButton({
  label = "Click me",
  href,
  onClick,
  baseColor = "#050505",
  glassColor = "#eaf2ff",
  rimWidth = 2,
  particles = 10,
  radius = 999,
}: FluidGlassButtonProps) {
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const stars = buildStars(particles);
  const lit = hovered;

  function handleClick(e: React.MouseEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== id)), 900);
    onClick?.();
  }

  const Tag = href ? motion.a : motion.button;

  // 빛은 안쪽으로만 스민다 — 딱딱한 테두리 선이 아니라 유리처럼 부드럽게 감쇠하는 림.
  const rim = [
    `inset 0 0 0 ${Math.max(1, rimWidth * 0.5)}px ${glassColor}${lit ? "e6" : "b8"}`,
    `inset 0 0 ${rimWidth * 5}px 0 ${glassColor}${lit ? "70" : "40"}`,
    `inset 0 0 ${rimWidth * 14}px ${rimWidth}px ${glassColor}${lit ? "38" : "1f"}`,
    `inset 0 0 ${rimWidth * 32}px ${rimWidth * 3}px ${glassColor}${lit ? "1c" : "0d"}`,
  ].join(", ");

  return (
    <Tag
      {...(href ? { href } : { type: "button" as const })}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={handleClick}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      style={{
        borderRadius: radius,
        background: baseColor,
        boxShadow: rim,
        transition: "box-shadow 0.4s ease",
      }}
      className="relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden px-11 py-[18px] text-[15px] font-medium tracking-[-0.01em] text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      {/* 흐린 링 두 겹 — overflow-hidden이 바깥쪽 절반을 잘라내므로
          번짐이 안으로만 스며들며 유리 특유의 은은한 광택을 만든다 */}
      <span
        aria-hidden="true"
        style={{
          borderRadius: radius,
          border: `${rimWidth}px solid ${glassColor}`,
          filter: `blur(${rimWidth * 2}px)`,
          opacity: lit ? 0.9 : 0.55,
        }}
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
      />
      <span
        aria-hidden="true"
        style={{
          borderRadius: radius,
          border: `${rimWidth * 1.6}px solid ${glassColor}`,
          filter: `blur(${rimWidth * 5.5}px)`,
          opacity: lit ? 0.5 : 0.24,
        }}
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
      />

      {/* 위쪽 유리 시트 반사 */}
      <span
        aria-hidden="true"
        style={{ borderRadius: radius }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.11),transparent_40%)]"
      />

      {/* 안쪽에서 제자리 반짝이는 별 알갱이 */}
      {!reducedMotion && particles > 0 && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          {stars.map((s, i) => (
            <motion.span
              key={i}
              style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, background: glassColor }}
              className="absolute rounded-full"
              animate={{ opacity: [0.1, lit ? 1 : 0.65, 0.1], scale: [0.7, 1.3, 0.7] }}
              transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </span>
      )}

      {/* 클릭 파문 */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden="true"
          initial={{ opacity: 0.4, scale: 0 }}
          animate={{ opacity: 0, scale: 5 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            left: r.x,
            top: r.y,
            background: `radial-gradient(circle, ${glassColor}b3 0%, ${glassColor}00 70%)`,
          }}
          className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      ))}

      <span className="relative z-10" style={{ textShadow: `0 0 14px ${glassColor}40` }}>
        {label}
      </span>
    </Tag>
  );
}
