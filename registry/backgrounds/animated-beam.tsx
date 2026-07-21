"use client";

// deps: motion
import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface AnimatedBeamProps {
  /** 각 빔이 흐르는 데 걸리는 시간(초) */
  speed?: number;
  /** 곡률 — 값이 클수록 빔이 더 휘어진다 */
  curvature?: number;
  /** 빔·노드 액센트 색 */
  accent?: string;
  /** 바깥 노드에 붙일 라벨(글리프) */
  nodes?: string[];
}

const DEFAULT_NODES = ["◎", "✦", "▲", "❖", "◆", "✚"];
const W = 520;
const H = 320;
const CX = W / 2;
const CY = H / 2;

/**
 * 바깥 노드에서 중앙 허브로 흐르는 애니메이티드 빔.
 * SVG 곡선 경로 위를 진행하는 그라디언트 대시로 데이터 흐름을 표현한다.
 * "여러 도구를 하나로 연결" 류 인테그레이션 섹션의 단골 비주얼.
 */
export function AnimatedBeam({
  speed = 3,
  curvature = 60,
  accent = "#6366f1",
  nodes = DEFAULT_NODES,
}: AnimatedBeamProps) {
  const reducedMotion = useReducedMotion();
  const uid = useId().replace(/[:]/g, "");

  const count = nodes.length;
  const points = nodes.map((_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const rx = W * 0.4;
    const ry = H * 0.36;
    return { x: CX + Math.cos(angle) * rx, y: CY + Math.sin(angle) * ry, angle };
  });

  // 각 노드→허브 곡선. 제어점을 법선 방향으로 밀어 곡률을 만든다.
  const paths = points.map((p) => {
    const mx = (p.x + CX) / 2;
    const my = (p.y + CY) / 2;
    const nx = -(CY - p.y);
    const ny = CX - p.x;
    const len = Math.hypot(nx, ny) || 1;
    const cxp = mx + (nx / len) * curvature;
    const cyp = my + (ny / len) * curvature;
    return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)} Q ${cxp.toFixed(1)} ${cyp.toFixed(1)} ${CX} ${CY}`;
  });

  return (
    <div className="flex w-full items-center justify-center p-6">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-[min(92vw,560px)]" role="img" aria-label="연결 다이어그램">
          <defs>
            <linearGradient id={`beam-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={accent} stopOpacity="0" />
              <stop offset="50%" stopColor={accent} stopOpacity="1" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`hub-${uid}`}>
              <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 정적 베이스 경로 */}
          {paths.map((d, i) => (
            <path key={`base-${i}`} d={d} fill="none" stroke="currentColor" strokeWidth={1.5} className="text-white/10" />
          ))}

          {/* 흐르는 빔 (reduced-motion이면 은은한 정적 하이라이트) */}
          {paths.map((d, i) =>
            reducedMotion ? (
              <path key={`beam-${i}`} d={d} fill="none" stroke={`url(#beam-${uid})`} strokeWidth={2} strokeOpacity={0.5} />
            ) : (
              <motion.path
                key={`beam-${i}`}
                d={d}
                fill="none"
                stroke={`url(#beam-${uid})`}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeDasharray="42 240"
                initial={{ strokeDashoffset: 282 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{
                  duration: speed,
                  repeat: Infinity,
                  ease: "linear",
                  delay: (i / count) * speed,
                }}
              />
            )
          )}

          <circle cx={CX} cy={CY} r={54} fill={`url(#hub-${uid})`} />
        </svg>

        {/* HTML 노드 오버레이 — 크리스프한 칩 */}
        {points.map((p, i) => (
          <span
            key={i}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/12 bg-zinc-900/90 text-lg shadow-lg"
            style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, color: accent }}
            aria-hidden="true"
          >
            {nodes[i]}
          </span>
        ))}
        {/* 중앙 허브 */}
        <span
          className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border text-white shadow-xl"
          style={{ left: "50%", top: "50%", borderColor: `${accent}66`, background: `linear-gradient(160deg, ${accent}, ${accent}99)` }}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
