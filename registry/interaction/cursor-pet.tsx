"use client";

// deps: motion
import { useEffect, useId, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

export type CursorPetCharacter = "pip" | "puff" | "botty" | "spook";

export interface CursorPetProps {
  /** 캐릭터 종류 */
  character?: CursorPetCharacter;
  size?: number;
  /** false면 bodyColor로 몸 색을 덮어쓴다. true면 캐릭터 고유 팔레트를 쓴다. */
  autoColor?: boolean;
  /** autoColor가 false일 때 적용할 몸통 색 */
  bodyColor?: string;
  /** 눈 색 (pill 눈인 Botty는 항상 흰색 고정) */
  eyeColor?: string;
  /** 커서를 따라가는 반응 속도 (1~10) */
  followSpeed?: number;
  /** 몸이 커서 쪽으로 끌려가는 최대 거리(px) */
  followDistance?: number;
  /** 커서 방향으로 몸이 기우는 3D 회전 최대 각도(deg) */
  tilt3d?: number;
  /** 기울임에 따른 통통 튀는(wobble) 정도 */
  wobbleIntensity?: number;
  /** 일정 시간 커서가 안 움직이면 잠드는 유휴 모드 */
  idleMode?: boolean;
  /** 잠들기까지 대기 시간(ms) */
  idleTimeout?: number;
  /** 활성 상태 말풍선 텍스트. 비우면 캐릭터별 기본 문구 사용 */
  activeMessage?: string;
  /** 유휴(잠든) 상태 말풍선 텍스트. 비우면 캐릭터별 기본 문구 사용 */
  idleMessage?: string;
  /** 주기적 깜빡임 on/off */
  blink?: boolean;
  bubbleOffsetX?: number;
  bubbleOffsetY?: number;
}

const DEFAULT_MESSAGES: Record<CursorPetCharacter, { active: string; idle: string }> = {
  pip: { active: "I talk too \u{1F34A}", idle: "Zzz… still burning \u{1F525}" },
  puff: { active: "Hi \u{1F919}, I am Puff. Please hire me.", idle: "Snoozing… \u{1F634}" },
  botty: { active: "BTW I am Botty, I don't care \u{1F643}", idle: "brb, charging \u{1F50B}" },
  spook: { active: "Spook here ✋, I am innocent \u{1F648}", idle: "Boo… zzz \u{1F47B}" },
};

// 시드 고정 의사난수 — 서버/클라이언트가 항상 같은 Puff 실루엣을 그리도록 한다.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 바깥/안쪽 반지름을 번갈아 찍어 별 모양 정점을 만들고, 각 정점을 살짝만
// 둥글려 퍼프 특유의 몽글몽글하면서도 뾰족한 실루엣을 만든다.
function puffPath(seed: number, spikes: number, outerR: number, innerR: number, cx: number, cy: number, roundness: number) {
  const rand = mulberry32(seed);
  const n = spikes * 2;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const base = i % 2 === 0 ? outerR : innerR;
    const r = base + (rand() - 0.5) * 2 * (base * 0.1);
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  let d = "";
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const before: [number, number] = [curr[0] + (prev[0] - curr[0]) * roundness, curr[1] + (prev[1] - curr[1]) * roundness];
    const after: [number, number] = [curr[0] + (next[0] - curr[0]) * roundness, curr[1] + (next[1] - curr[1]) * roundness];
    d += i === 0 ? `M ${before[0].toFixed(1)} ${before[1].toFixed(1)} ` : `L ${before[0].toFixed(1)} ${before[1].toFixed(1)} `;
    d += `Q ${curr[0].toFixed(1)} ${curr[1].toFixed(1)} ${after[0].toFixed(1)} ${after[1].toFixed(1)} `;
  }
  return d + "Z";
}

const PUFF_PATH = puffPath(11, 8, 44, 27, 50, 50, 0.3);

// 아래는 둥근 불덩이, 위로 큰 화염 끝 하나와 왼쪽에 작은 불꽃 하나가 솟은 실루엣.
const FLAME_PATH =
  "M50 97 C27 97 14 81 14 63 C14 49 23 41 27 28 L31 19 L38 37 " +
  "C42 23 47 11 51 2 C58 20 66 32 74 40 C82 48 86 54 86 63 C86 81 73 97 50 97 Z";

const BUBBLE_PATH =
  "M28 6 L72 6 Q92 6 92 26 L92 52 Q92 72 72 72 L44 72 L31 94 L35 72 L28 72 " +
  "Q8 72 8 52 L8 26 Q8 6 28 6 Z";

const GHOST_PATH =
  "M10 52 A40 40 0 0 1 90 52 L90 78 Q82 92 74 78 Q66 92 58 78 Q50 92 42 78 Q34 92 26 78 Q18 92 10 78 Z";

/** 캐릭터 고유 팔레트 — "다 같은 색"이 되지 않도록 캐릭터마다 배색을 따로 갖는다. */
interface Palette {
  /** 그라디언트 밝은 쪽 / 중간 / 어두운 쪽 */
  light: string;
  mid: string;
  dark: string;
  /** 외곽선 (없으면 undefined) */
  stroke?: string;
  /** 바닥 접지 그림자 색 */
  shadow: string;
  /** 광원 위치·범위. Pip처럼 아래에서 타오르는 캐릭터는 아래쪽에 둔다. */
  gx: string;
  gy: string;
  gr: string;
}

interface CharConfig {
  path: string;
  eyes: { x1: number; y1: number; x2: number; y2: number };
  eyeStyle: "dot" | "pill";
  eyeR: number;
  palette: Palette;
  /** 무지개 파스텔처럼 다색 그라디언트를 쓰는 캐릭터 */
  rainbow?: boolean;
}

const CHAR_CONFIG: Record<CursorPetCharacter, CharConfig> = {
  pip: {
    path: FLAME_PATH,
    eyes: { x1: 41, y1: 74, x2: 58, y2: 74 },
    eyeStyle: "dot",
    eyeR: 3.2,
    // 불꽃은 아래가 가장 뜨겁다 — 광원을 아래로 내려 붉은 몸통 + 노란 코어를 만든다
    palette: { light: "#ffe066", mid: "#ff6a00", dark: "#e01000", shadow: "rgba(240,26,0,0.35)", gx: "50%", gy: "84%", gr: "68%" },
  },
  puff: {
    path: PUFF_PATH,
    eyes: { x1: 39, y1: 48, x2: 60, y2: 46 },
    eyeStyle: "dot",
    eyeR: 3.6,
    palette: { light: "#ffffff", mid: "#f4f6ff", dark: "#c7d2fe", stroke: "#4f46e5", shadow: "rgba(79,70,229,0.3)", gx: "34%", gy: "28%", gr: "80%" },
  },
  botty: {
    path: BUBBLE_PATH,
    eyes: { x1: 34, y1: 36, x2: 56, y2: 36 },
    eyeStyle: "pill",
    eyeR: 0,
    palette: { light: "#8fb0ff", mid: "#2f6bff", dark: "#0b35c9", shadow: "rgba(31,92,255,0.35)", gx: "32%", gy: "24%", gr: "84%" },
  },
  spook: {
    path: GHOST_PATH,
    eyes: { x1: 37, y1: 55, x2: 59, y2: 53 },
    eyeStyle: "dot",
    eyeR: 3.4,
    palette: { light: "#ffffff", mid: "#f1f5f9", dark: "#e9d5ff", shadow: "rgba(148,163,184,0.3)", gx: "36%", gy: "28%", gr: "80%" },
    rainbow: true,
  },
};

function hexToHsl(hex: string): [number, number, number] {
  const full = hex.replace("#", "");
  const n = full.length === 3 ? full.split("").map((c) => c + c).join("") : full;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hsl(h: number, s: number, l: number) {
  const hh = ((h % 360) + 360) % 360;
  return `hsl(${hh.toFixed(0)} ${Math.max(0, Math.min(100, s)).toFixed(0)}% ${Math.max(0, Math.min(100, l)).toFixed(0)}%)`;
}

function Bubble({
  text,
  offsetX,
  offsetY,
  reducedMotion,
}: {
  text: string;
  offsetX: number;
  offsetY: number;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      key={text}
      initial={reducedMotion ? false : { opacity: 0, y: 6, scale: 0.9 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ left: `${offsetX}%`, bottom: `calc(100% - ${offsetY}%)` }}
      className="pointer-events-none absolute z-10 w-max max-w-[220px] -translate-y-2 rounded-2xl bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-lg"
    >
      {text}
      <span className="absolute -bottom-[5px] left-5 h-2.5 w-2.5 rotate-45 rounded-[2px] bg-white" />
    </motion.div>
  );
}

/**
 * 화면 위 커서를 눈과 몸 전체로 좇는 프로시저럴 3D 마스코트.
 * 4가지 캐릭터(Pip/Puff/Botty/Spook)가 각자의 팔레트를 갖고,
 * 커서 방향으로 몸이 기울며(perspective 3D) 끌려간다.
 */
export function CursorPet({
  character = "puff",
  size = 120,
  autoColor = true,
  bodyColor = "#6366f1",
  eyeColor = "#18181b",
  followSpeed = 6,
  followDistance = 16,
  tilt3d = 22,
  wobbleIntensity = 0.4,
  idleMode = true,
  idleTimeout = 6000,
  activeMessage,
  idleMessage,
  blink = true,
  bubbleOffsetX = 55,
  bubbleOffsetY = 8,
}: CursorPetProps) {
  const reducedMotion = useReducedMotion();
  const uid = useId().replace(/[:]/g, "");
  const bodyRef = useRef<HTMLDivElement>(null);
  const [blinking, setBlinking] = useState(false);
  const [asleep, setAsleep] = useState(false);

  const cfg = CHAR_CONFIG[character];
  const messages = DEFAULT_MESSAGES[character];
  const activeText = activeMessage || messages.active;
  const idleText = idleMessage || messages.idle;

  // autoColor가 꺼져 있을 때만 bodyColor로 팔레트를 재구성한다.
  const pal = cfg.palette;
  const { gx, gy, gr } = pal;
  let lightC = pal.light;
  let midC = pal.mid;
  let darkC = pal.dark;
  let strokeC = pal.stroke;
  let shadowC = pal.shadow;
  if (!autoColor) {
    const [h, s, l] = hexToHsl(bodyColor);
    lightC = hsl(h, Math.min(s + 10, 95), Math.min(l + 22, 74));
    midC = hsl(h, Math.min(s + 12, 100), l);
    darkC = hsl(h, Math.min(s + 15, 100), Math.max(l - 16, 28));
    strokeC = pal.stroke ? hsl(h, Math.min(s + 15, 100), Math.max(l - 6, 38)) : undefined;
    shadowC = `hsl(${((h % 360) + 360) % 360} ${s.toFixed(0)}% ${Math.max(l - 10, 30).toFixed(0)}% / 0.35)`;
  }
  const useRainbow = cfg.rainbow && autoColor;

  const springCfg = { stiffness: 60 + followSpeed * 38, damping: 20, mass: 0.5 };
  const pupilX = useSpring(useMotionValue(0), springCfg);
  const pupilY = useSpring(useMotionValue(0), springCfg);
  // 몸 전체가 커서 쪽으로 끌려가는 오프셋 + 3D 기울기
  const bodyX = useSpring(useMotionValue(0), { stiffness: 40 + followSpeed * 22, damping: 18, mass: 0.8 });
  const bodyY = useSpring(useMotionValue(0), { stiffness: 40 + followSpeed * 22, damping: 18, mass: 0.8 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 70, damping: 15 });
  const rotX = useSpring(useMotionValue(0), { stiffness: 70, damping: 15 });
  // 기울임이 클수록 통통 튀듯 눌리고 늘어나는 스퀴시 — "physics-based" 느낌의 핵심
  const squashX = useTransform(rotY, (t) => 1 + Math.min(Math.abs(t) * 0.004 * wobbleIntensity, 0.12));
  const squashY = useTransform(rotY, (t) => 1 - Math.min(Math.abs(t) * 0.0035 * wobbleIntensity, 0.09));
  // 접지 그림자는 몸이 기운 반대쪽으로 밀리고, 떠오를수록 작아진다
  const shadowShift = useTransform(bodyX, (v) => -v * 0.35);
  const shadowScale = useTransform(bodyY, (v) => 1 - Math.min(Math.abs(v) * 0.008, 0.25));

  useEffect(() => {
    if (reducedMotion) return;
    let idleTimer: ReturnType<typeof setTimeout>;

    function scheduleSleep() {
      clearTimeout(idleTimer);
      if (idleMode) idleTimer = setTimeout(() => setAsleep(true), idleTimeout);
    }

    function handlePointerMove(e: PointerEvent) {
      const el = bodyRef.current;
      if (!el) return;
      setAsleep(false);
      scheduleSleep();
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;

      pupilX.set(nx * 3.4);
      pupilY.set(ny * 3.4);
      // 멀수록 최대치에 수렴 — 가까이 오면 과하게 붙지 않도록 감쇠
      const pull = Math.min(dist / 260, 1);
      bodyX.set(nx * followDistance * pull);
      bodyY.set(ny * followDistance * 0.6 * pull);
      rotY.set(nx * tilt3d * pull);
      rotX.set(-ny * tilt3d * 0.65 * pull);
    }

    scheduleSleep();
    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      clearTimeout(idleTimer);
    };
  }, [reducedMotion, idleMode, idleTimeout, followDistance, tilt3d, pupilX, pupilY, bodyX, bodyY, rotX, rotY]);

  useEffect(() => {
    if (!blink || reducedMotion || asleep) return;
    let closeTimer: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setBlinking(true);
      closeTimer = setTimeout(() => setBlinking(false), 140);
    }, 2800 + Math.random() * 1500);
    return () => {
      clearInterval(interval);
      clearTimeout(closeTimer);
    };
  }, [blink, reducedMotion, asleep]);

  const eyesClosed = blinking || asleep;
  const bubbleText = asleep ? idleText : activeText;
  const bodyGrad = `bodyGrad-${uid}`;
  const sheenGrad = `sheen-${uid}`;
  const coreGlow = `core-${uid}`;

  return (
    <div ref={bodyRef} className="relative" style={{ width: size, height: size, perspective: size * 6 }}>
      <Bubble text={bubbleText} reducedMotion={!!reducedMotion} offsetX={bubbleOffsetX} offsetY={bubbleOffsetY} />

      {/* 접지 그림자 — 몸과 분리해 두면 캐릭터가 공중에 떠 있는 입체감이 산다 */}
      <motion.div
        aria-hidden="true"
        style={{
          background: `radial-gradient(ellipse at center, ${shadowC} 0%, transparent 70%)`,
          x: reducedMotion ? 0 : shadowShift,
          scaleX: reducedMotion ? 1 : shadowScale,
        }}
        className="absolute bottom-[2%] left-1/2 h-[10%] w-[62%] -translate-x-1/2 rounded-[50%] blur-[3px]"
      />

      <motion.div
        style={
          reducedMotion
            ? undefined
            : { x: bodyX, y: bodyY, rotateX: rotX, rotateY: rotY, scaleX: squashX, scaleY: squashY, transformStyle: "preserve-3d" }
        }
        animate={reducedMotion ? undefined : { translateZ: asleep ? [0, 2, 0] : [0, 6, 0] }}
        transition={{ duration: asleep ? 4.5 : 3.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          role="img"
          aria-label={`커서를 따라 움직이는 ${character} 마스코트 캐릭터`}
          className="overflow-visible"
        >
          <defs>
            {useRainbow ? (
              <linearGradient id={bodyGrad} x1="0.1" y1="0" x2="0.9" y2="1">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="30%" stopColor="#bfdbfe" />
                <stop offset="60%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#fbcfe8" />
              </linearGradient>
            ) : (
              // 광원에서 멀어질수록 어두워지는 구형 셰이딩.
              // 스톱은 전부 불투명하게 둔다 — stopOpacity를 쓰면 배경이 비쳐 몸 색이 바랜다.
              <radialGradient id={bodyGrad} cx={gx} cy={gy} r={gr}>
                <stop offset="0%" stopColor={lightC} />
                <stop offset="48%" stopColor={midC} />
                <stop offset="100%" stopColor={darkC} />
              </radialGradient>
            )}
            {/* 위쪽 스펙큘러 시트 — 유광 입체감 */}
            <linearGradient id={sheenGrad} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#ffffff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={coreGlow} cx="50%" cy="72%" r="45%">
              <stop offset="0%" stopColor="#fff9c4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fff9c4" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`clip-${uid}`}>
              <path d={cfg.path} />
            </clipPath>
          </defs>

          <g className="drop-shadow-md">
            <path
              d={cfg.path}
              fill={`url(#${bodyGrad})`}
              stroke={strokeC ?? "none"}
              strokeWidth={strokeC ? 2.4 : 0}
              strokeLinejoin="round"
            />

            {/* 몸통 안쪽에만 얹히는 하이라이트/코어 — clip으로 실루엣을 벗어나지 않게 */}
            <g clipPath={`url(#clip-${uid})`}>
              {character === "pip" && <ellipse cx="50" cy="74" rx="34" ry="26" fill={`url(#${coreGlow})`} />}
              <path d={cfg.path} fill={`url(#${sheenGrad})`} />
              {/* 좌상단 반짝임 */}
              <ellipse cx="36" cy="26" rx="11" ry="7" fill="#ffffff" opacity="0.5" transform="rotate(-24 36 26)" />
            </g>
          </g>

          {cfg.eyeStyle === "dot" ? (
            [
              { cx: cfg.eyes.x1, cy: cfg.eyes.y1 },
              { cx: cfg.eyes.x2, cy: cfg.eyes.y2 },
            ].map((e, i) => (
              <g key={i}>
                <motion.ellipse
                  cx={e.cx}
                  cy={e.cy}
                  rx={cfg.eyeR}
                  ry={eyesClosed ? 0.6 : cfg.eyeR}
                  fill={eyeColor}
                  animate={{ ry: eyesClosed ? 0.6 : cfg.eyeR }}
                  transition={{ duration: 0.1 }}
                />
                {!eyesClosed && (
                  <motion.circle
                    cx={e.cx}
                    cy={e.cy - cfg.eyeR * 0.3}
                    r={cfg.eyeR * 0.34}
                    fill="white"
                    style={{ x: pupilX, y: pupilY }}
                    opacity={0.9}
                  />
                )}
              </g>
            ))
          ) : (
            [
              { cx: cfg.eyes.x1, cy: cfg.eyes.y1 },
              { cx: cfg.eyes.x2, cy: cfg.eyes.y2 },
            ].map((e, i) => (
              // attrY로 애니메이션해야 한다 — motion에서 SVG의 y는 transform(translateY)으로
              // 해석돼, y를 쓰면 y 속성값에 이동이 덧붙어 눈이 몸통 밖으로 밀려난다.
              <motion.rect
                key={i}
                x={e.cx - 2.6}
                width={5.2}
                rx={2.6}
                fill="#ffffff"
                initial={false}
                animate={{ height: eyesClosed ? 2 : 14, attrY: eyesClosed ? e.cy - 1 : e.cy - 7 }}
                transition={{ duration: 0.1 }}
              />
            ))
          )}
        </svg>
      </motion.div>
    </div>
  );
}
