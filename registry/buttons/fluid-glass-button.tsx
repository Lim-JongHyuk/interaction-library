"use client";

// deps: motion
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

export interface FluidGlassButtonProps {
  label?: string;
  /** 링크로 렌더할 주소. 없으면 <button>으로 렌더된다. */
  href?: string;
  onClick?: () => void;
  /** 버튼 본체(유리 안쪽) 색 */
  baseColor?: string;
  /** 유리 테두리·굴절광 색 */
  glassColor?: string;
  /** 하이라이트가 커서를 따라오는 속도 (1~10) */
  hoverSpeed?: number;
  /** 유리 테두리 두께(px) */
  rimWidth?: number;
  /** 호버 시 내리는 알갱이 개수 */
  particles?: number;
  /** 모서리 반경(px) */
  radius?: number;
}

// 시드 고정 의사난수 — 알갱이 배치가 서버/클라이언트에서 동일해야 hydration이 어긋나지 않는다.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSnow(count: number) {
  const rand = mulberry32(count * 7919 + 17);
  return Array.from({ length: count }, () => ({
    left: 4 + rand() * 92,
    size: 1.4 + rand() * 2.4,
    delay: rand() * 2.2,
    dur: 2.4 + rand() * 2.6,
    drift: (rand() - 0.5) * 18,
  }));
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * 안쪽에서만 빛나는 글래스모피즘 버튼. 버튼 바깥으로는 빛이 새지 않고,
 * 테두리와 유리면의 굴절 하이라이트가 커서를 따라 유체처럼 흐른다.
 * 호버하면 표면에 눈처럼 알갱이가 내린다.
 */
export function FluidGlassButton({
  label = "Click me",
  href,
  onClick,
  baseColor = "#050505",
  glassColor = "#ffffff",
  hoverSpeed = 6,
  rimWidth = 2,
  particles = 14,
  radius = 999,
}: FluidGlassButtonProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const snow = buildSnow(particles);

  // 커서 위치(0~1 정규화) — 굴절 하이라이트가 커서를 따라간다
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 70 + hoverSpeed * 40, damping: 18, mass: 0.35 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);

  function handleMove(e: React.PointerEvent) {
    if (reducedMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }

  function handleLeave() {
    setHovered(false);
    px.set(0.5);
    py.set(0.5);
  }

  function handleClick(e: React.MouseEvent) {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((prev) => prev.filter((p) => p.id !== id)), 900);
    onClick?.();
  }

  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      // motion.a / motion.button 유니온이라 ref 타입이 갈려 캐스팅이 필요하다
      ref={ref as React.Ref<HTMLAnchorElement & HTMLButtonElement>}
      {...(href ? { href } : { type: "button" as const })}
      onPointerMove={handleMove}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={handleLeave}
      onClick={handleClick}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      style={{
        borderRadius: radius,
        background: baseColor,
        // 빛은 전부 안쪽으로만 — 바깥으로 번지는 그림자는 두지 않는다.
        // 테두리에 가까울수록 밝은 렌즈 플레어형 굴절이 안쪽으로 스며든다.
        boxShadow: [
          `inset 0 0 0 ${rimWidth}px ${glassColor}d9`,
          `inset 0 0 ${rimWidth * 5}px ${rimWidth}px ${glassColor}59`,
          `inset 0 0 ${rimWidth * 14}px ${rimWidth * 2}px ${glassColor}26`,
        ].join(", "),
      }}
      className="relative inline-flex cursor-pointer select-none items-center justify-center overflow-hidden px-10 py-5 text-base font-semibold tracking-tight text-white no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
    >
      {/* 커서를 따라오는 유체 굴절 하이라이트 — 테두리와 유리면 모두에서 빛이 모인다 */}
      <motion.span
        aria-hidden="true"
        style={{
          // 커서 좌표를 CSS 변수로 주입해 하이라이트 위치를 스크럽한다
          ["--gx" as string]: gx,
          ["--gy" as string]: gy,
          // 커서 주변에만 모이도록 좁게 — 넓게 깔면 버튼 전체가 뿌옇게 뜬다
          background:
            `radial-gradient(44px circle at var(--gx) var(--gy), ${glassColor}5e, transparent 70%),` +
            `radial-gradient(110px circle at var(--gx) var(--gy), ${glassColor}14, transparent 74%)`,
          opacity: hovered && !reducedMotion ? 1 : 0,
        }}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
      />

      {/* 커서 쪽 테두리에 집중되는 굴절광. 안쪽을 baseColor로 덮어 링만 남긴다. */}
      <motion.span
        aria-hidden="true"
        style={{
          ["--gx" as string]: gx,
          ["--gy" as string]: gy,
          borderRadius: radius,
          padding: rimWidth,
          background: `radial-gradient(90px circle at var(--gx) var(--gy), ${glassColor}, transparent 70%)`,
          // 링 모양으로만 보이도록 가운데를 도려낸다
          WebkitMask: `linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)`,
          WebkitMaskComposite: "xor",
          mask: `linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)`,
          maskComposite: "exclude",
          opacity: hovered && !reducedMotion ? 1 : 0,
        }}
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
      />

      {/* 위쪽 유리 시트 반사 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.13),transparent_46%)]"
      />

      {/* 호버 시 내리는 알갱이 */}
      {hovered && !reducedMotion && particles > 0 && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0">
          {snow.map((s, i) => (
            <motion.span
              key={i}
              initial={{ top: "-12%", opacity: 0, x: 0 }}
              animate={{ top: "112%", opacity: [0, 1, 1, 0], x: s.drift }}
              transition={{
                duration: s.dur,
                delay: s.delay,
                repeat: Infinity,
                ease: "linear",
                opacity: { duration: s.dur, delay: s.delay, repeat: Infinity, times: [0, 0.15, 0.75, 1], ease: "linear" },
              }}
              style={{ left: `${s.left}%`, width: s.size, height: s.size, background: glassColor }}
              className="absolute rounded-full"
            />
          ))}
        </span>
      )}

      {/* 클릭 파문 */}
      {ripples.map((r) => (
        <motion.span
          key={r.id}
          aria-hidden="true"
          initial={{ opacity: 0.45, scale: 0 }}
          animate={{ opacity: 0, scale: 5 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{
            left: r.x,
            top: r.y,
            background: `radial-gradient(circle, ${glassColor}cc 0%, ${glassColor}00 70%)`,
          }}
          className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      ))}

      <span className="relative z-10">{label}</span>
    </Tag>
  );
}
