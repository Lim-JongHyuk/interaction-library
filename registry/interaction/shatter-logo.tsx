"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface ShatterLogoProps {
  label?: string;
  shardCount?: number;
  force?: number;
  duration?: number;
}

interface Shard {
  clipPath: string;
  cx: number; // 파편 중심 (0~1)
  cy: number;
  rotate: number;
}

/**
 * 지터가 섞인 그리드 정점으로 유리 균열 느낌의 파편 폴리곤을 생성한다.
 * 각 파편은 같은 배경을 공유하고 clip-path로 잘려 있어,
 * 흩어질 때 실제로 하나의 면이 깨진 것처럼 보인다.
 */
function makeShards(shardCount: number): Shard[] {
  // shardCount≈cols*rows 근사 그리드
  const cols = Math.max(2, Math.round(Math.sqrt(shardCount)));
  const rows = Math.max(2, Math.round(shardCount / cols));

  // 지터가 섞인 (cols+1)x(rows+1) 정점 격자 — 인접 파편이 정점을 공유해 빈틈이 없다
  const px: number[][] = [];
  const py: number[][] = [];
  for (let r = 0; r <= rows; r++) {
    px[r] = [];
    py[r] = [];
    for (let c = 0; c <= cols; c++) {
      const edgeX = c === 0 || c === cols;
      const edgeY = r === 0 || r === rows;
      px[r][c] = (c / cols) * 100 + (edgeX ? 0 : (Math.random() - 0.5) * (60 / cols));
      py[r][c] = (r / rows) * 100 + (edgeY ? 0 : (Math.random() - 0.5) * (60 / rows));
    }
  }

  const shards: Shard[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pts = [
        [px[r][c], py[r][c]],
        [px[r][c + 1], py[r][c + 1]],
        [px[r + 1][c + 1], py[r + 1][c + 1]],
        [px[r + 1][c], py[r + 1][c]],
      ];
      const cx = pts.reduce((s, p) => s + p[0], 0) / 4 / 100;
      const cy = pts.reduce((s, p) => s + p[1], 0) / 4 / 100;
      shards.push({
        clipPath: `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(", ")})`,
        cx,
        cy,
        rotate: (Math.random() - 0.5) * 120,
      });
    }
  }
  return shards;
}

export function ShatterLogo({ label = "MK", shardCount = 12, force = 120, duration = 0.7 }: ShatterLogoProps) {
  const reducedMotion = useReducedMotion();
  const [shattered, setShattered] = useState(false);

  // 랜덤 파편 지오메트리는 state로 보관 (렌더 순수성), 파라미터 변경 시 렌더 중 조정으로 재생성
  const [shards, setShards] = useState<Shard[]>(() => makeShards(shardCount));
  const [prevCount, setPrevCount] = useState(shardCount);
  if (prevCount !== shardCount) {
    setPrevCount(shardCount);
    setShards(makeShards(shardCount));
  }

  const face = (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#4f46e5,#a855f7,#22d3ee)]">
      <span className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">{label}</span>
    </div>
  );

  if (reducedMotion) {
    return (
      <div className="h-44 w-44 overflow-hidden rounded-2xl border border-white/20 shadow-xl">{face}</div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShattered((s) => !s)}
      aria-pressed={shattered}
      aria-label={shattered ? "로고 재조립" : "로고 산산조각 내기"}
      className="relative h-44 w-44 cursor-pointer"
    >
      {shards.map((shard, i) => {
        // 파편 중심 → 면 중심 기준 바깥 방향 벡터
        const dirX = shard.cx - 0.5;
        const dirY = shard.cy - 0.5;
        const mag = Math.hypot(dirX, dirY) || 0.3;
        return (
          <motion.div
            key={i}
            animate={
              shattered
                ? {
                    x: (dirX / mag) * force,
                    y: (dirY / mag) * force * 0.8 + force * 0.35,
                    rotate: shard.rotate,
                    opacity: 0,
                    scale: 0.85,
                  }
                : { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }
            }
            transition={{
              duration,
              delay: shattered ? mag * 0.15 : (1 - mag) * 0.1,
              ease: shattered ? [0.3, 0.6, 0.4, 1] : [0.2, 0.8, 0.2, 1],
            }}
            style={{ clipPath: shard.clipPath }}
            className="absolute inset-0 overflow-hidden rounded-2xl"
          >
            {face}
            {/* 유리 반사 하이라이트 */}
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.35)_0%,transparent_35%)]" />
          </motion.div>
        );
      })}
      <span className="pointer-events-none absolute -bottom-7 left-0 right-0 text-center text-[11px] text-muted-foreground">
        {shattered ? "click to reassemble" : "click to shatter"}
      </span>
    </button>
  );
}
