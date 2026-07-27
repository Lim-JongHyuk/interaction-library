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
  /** 유리 테두리·광채 색 */
  glassColor?: string;
  /** 테두리 빛이 한 바퀴 도는 속도 (1~10) */
  hoverSpeed?: number;
  /** 유리 테두리 두께(px) */
  rimWidth?: number;
  /** 표면을 떠다니는 입자 개수 */
  particles?: number;
  /** 모서리 반경(px) */
  radius?: number;
}

// 시드 고정 의사난수 — 입자 배치가 서버/클라이언트에서 동일해야 hydration이 어긋나지 않는다.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles(count: number) {
  const rand = mulberry32(count * 7919 + 17);
  return Array.from({ length: count }, () => ({
    x: 6 + rand() * 88,
    y: 15 + rand() * 70,
    r: 0.5 + rand() * 0.9,
    delay: rand() * 4,
    dur: 3.4 + rand() * 3.2,
    drift: (rand() - 0.5) * 12,
  }));
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

/**
 * 매끈한 크롬 유리 테두리를 빛이 한 바퀴 훑고 지나가는 글래스 버튼.
 * 테두리는 일렁이지 않고 또렷하게 유지되며, 안쪽 유리면에서만
 * 커서를 따라 굴절 하이라이트가 흐르고 클릭 시 파문이 퍼진다.
 */
export function FluidGlassButton({
  label = "Click me",
  href,
  onClick,
  baseColor = "#050505",
  glassColor = "#ffffff",
  hoverSpeed = 6,
  rimWidth = 2,
  particles = 6,
  radius = 999,
}: FluidGlassButtonProps) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const dots = buildParticles(particles);

  // 커서 위치(0~1 정규화) — 굴절 하이라이트가 커서를 따라간다
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 90 + hoverSpeed * 45, damping: 20, mass: 0.4 };
  const sx = useSpring(px, spring);
  const sy = useSpring(py, spring);
  const glareX = useTransform(sx, (v) => `${v * 100}%`);
  const glareY = useTransform(sy, (v) => `${v * 100}%`);
  // 유리판이 커서 쪽으로 미세하게 기운다
  const rotX = useTransform(sy, [0, 1], [7, -7]);
  const rotY = useTransform(sx, [0, 1], [-9, 9]);

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
  const sweepDur = Math.max(2.2, 12 - hoverSpeed) * (hovered ? 0.45 : 1);

  // 밝은 호 두 개가 마주보며 도는 크롬 스윕. 테두리 자체는 왜곡 없이 또렷하다.
  const sweep =
    `conic-gradient(from 0deg,` +
    ` transparent 0deg, ${glassColor} 38deg, ${glassColor}00 86deg,` +
    ` transparent 170deg, ${glassColor} 218deg, ${glassColor}00 266deg,` +
    ` transparent 360deg)`;

  const glow = hovered
    ? `0 0 ${rimWidth * 7}px ${glassColor}66, 0 0 ${rimWidth * 18}px ${glassColor}33`
    : `0 0 ${rimWidth * 5}px ${glassColor}40, 0 0 ${rimWidth * 12}px ${glassColor}1f`;

  return (
    <div style={{ perspective: 900 }} className="inline-block">
      <Tag
        // motion.a / motion.button 유니온이라 ref 타입이 갈려 캐스팅이 필요하다
        ref={ref as React.Ref<HTMLAnchorElement & HTMLButtonElement>}
        {...(href ? { href } : { type: "button" as const })}
        onPointerMove={handleMove}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={handleLeave}
        onClick={handleClick}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
        style={{
          borderRadius: radius,
          padding: rimWidth,
          boxShadow: glow,
          rotateX: reducedMotion ? 0 : rotX,
          rotateY: reducedMotion ? 0 : rotY,
          transformStyle: "preserve-3d",
          transition: "box-shadow 0.4s ease",
        }}
        className="relative inline-block cursor-pointer select-none overflow-hidden no-underline outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {/* 항상 보이는 은은한 베이스 링 — 스윕이 지나가지 않는 구간도 테두리가 끊기지 않게 */}
        <span
          aria-hidden="true"
          style={{ borderRadius: radius, background: `linear-gradient(150deg, ${glassColor}f2, ${glassColor}59 45%, ${glassColor}d9)` }}
          className="pointer-events-none absolute inset-0"
        />

        {/* 테두리를 한 바퀴 도는 빛.
            크기는 인라인 스타일로 준다 — 임의값 유틸리티(w-[200%])가 생성되지 않으면
            내용 없는 absolute 요소의 width:auto가 0으로 줄어 스윕이 통째로 사라진다. */}
        <motion.span
          aria-hidden="true"
          style={{ background: sweep, width: "200%", aspectRatio: "1 / 1", willChange: "transform" }}
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: sweepDur, repeat: Infinity, ease: "linear" }}
        />

        {/* 안쪽 유리면 — 링 위에 얹혀 가운데를 덮으면서 테두리만 남긴다 */}
        <span
          style={{ borderRadius: radius, background: baseColor }}
          className="relative flex items-center justify-center overflow-hidden px-10 py-5 text-base font-semibold tracking-tight text-white"
        >
          {/* 커서를 따라가는 굴절 하이라이트 */}
          <motion.span
            aria-hidden="true"
            style={{
              // 커서 좌표를 CSS 변수로 주입해 하이라이트 위치를 스크럽한다
              ["--gx" as string]: glareX,
              ["--gy" as string]: glareY,
              background: `radial-gradient(130px circle at var(--gx) var(--gy), ${glassColor}30, transparent 70%)`,
              opacity: hovered && !reducedMotion ? 1 : 0,
            }}
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          />

          {/* 위쪽 유리 시트 반사 + 안쪽 베벨 그림자 */}
          <span
            aria-hidden="true"
            style={{ boxShadow: `inset 0 1px 1px ${glassColor}40, inset 0 -10px 20px -12px ${glassColor}30` }}
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.14),transparent_42%)]"
          />

          {/* 표면을 떠다니는 입자 */}
          {!reducedMotion && particles > 0 && (
            <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
              {dots.map((d, i) => (
                <motion.circle
                  key={i}
                  cx={d.x}
                  cy={d.y}
                  r={d.r}
                  fill={glassColor}
                  animate={{ opacity: [0, 0.8, 0], cx: [d.x, d.x + d.drift], cy: [d.y, d.y - 9] }}
                  transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
            </svg>
          )}

          {/* 클릭 파문 */}
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              aria-hidden="true"
              initial={{ opacity: 0.5, scale: 0 }}
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
        </span>
      </Tag>
    </div>
  );
}
