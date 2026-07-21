"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export interface MagneticDotGridProps {
  /** 점 사이 간격(px) */
  gap?: number;
  /** 커서 영향 반경(px) */
  radius?: number;
  /** 활성 점 색 */
  accent?: string;
}

interface Dot {
  x: number;
  y: number;
}

/**
 * 커서 주변의 점이 밀려나며 커지고 액센트 색으로 밝아지는 자기장 점 격자.
 * 컨테이너 크기에 맞춰 점을 배치하고, 포인터 이동마다 각 점 위치를 기준으로
 * 변위·스케일·밝기를 명령형으로 갱신한다(리렌더 없음). 인터랙티브 히어로 배경.
 */
export function MagneticDotGrid({ gap = 34, radius = 130, accent = "#6366f1" }: MagneticDotGridProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [dots, setDots] = useState<Dot[]>([]);

  // 컨테이너 크기에 맞춰 점 격자를 계산 (리사이즈 대응)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const build = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const cols = Math.max(1, Math.floor((w - gap) / gap));
      const rows = Math.max(1, Math.floor((h - gap) / gap));
      const offsetX = (w - (cols - 1) * gap) / 2;
      const offsetY = (h - (rows - 1) * gap) / 2;
      const next: Dot[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          next.push({ x: offsetX + c * gap, y: offsetY + r * gap });
        }
      }
      setDots(next);
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gap]);

  function reset() {
    for (const node of dotRefs.current) {
      if (!node) continue;
      node.style.transform = "scale(1)";
      node.style.opacity = "0.25";
      node.style.backgroundColor = "";
    }
  }

  function onMove(e: React.PointerEvent) {
    if (reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    dots.forEach((d, i) => {
      const node = dotRefs.current[i];
      if (!node) return;
      const dx = px - d.x;
      const dy = py - d.y;
      const dist = Math.hypot(dx, dy);
      const t = Math.max(0, 1 - dist / radius);
      if (t <= 0) {
        node.style.transform = "scale(1)";
        node.style.opacity = "0.25";
        node.style.backgroundColor = "";
        return;
      }
      // 커서 반대 방향으로 밀어내며 커지고 밝아진다
      const push = t * 14;
      const nx = (-dx / (dist || 1)) * push;
      const ny = (-dy / (dist || 1)) * push;
      node.style.transform = `translate(${nx.toFixed(2)}px, ${ny.toFixed(2)}px) scale(${(1 + t * 1.8).toFixed(2)})`;
      node.style.opacity = (0.25 + t * 0.75).toFixed(2);
      node.style.backgroundColor = accent;
    });
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative h-[380px] w-full overflow-hidden rounded-2xl bg-slate-950"
      aria-hidden="true"
    >
      {dots.map((d, i) => (
        <span
          key={i}
          ref={(el) => {
            dotRefs.current[i] = el;
          }}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/25 transition-[transform,opacity,background-color] duration-200 ease-out will-change-transform"
          style={{ left: d.x - 3, top: d.y - 3, opacity: 0.25 }}
        />
      ))}
    </div>
  );
}
