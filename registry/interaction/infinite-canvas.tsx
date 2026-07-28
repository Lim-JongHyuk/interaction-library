"use client";

// deps: motion
import { useEffect, useRef, useState } from "react";
import { useAnimationFrame, useReducedMotion } from "motion/react";

export interface InfiniteCanvasItem {
  /** 타일 이미지 URL. 없으면 hue 기반 그라디언트 카드 */
  image?: string;
  title: string;
  year: string;
}

export interface InfiniteCanvasProps {
  /** 타일 한 변 크기(px) */
  cellSize?: number;
  /** 타일 간격(px) */
  gap?: number;
  /** 관성: 놓은 뒤 미끄러짐 유지율 (0.8=짧게, 0.98=길게) */
  momentum?: number;
  /** 곡면 벽 각도(deg). 중심에서 멀어질수록 타일이 이 각도까지 안쪽으로 꺾인다 */
  curvature?: number;
  /** 곡면 벽의 원통 반지름(px). 작을수록 더 급격하게 휜다 */
  curveRadius?: number;
  /** 드래그 속도에 비례해 타일이 진행 방향으로 기우는 최대 각도(deg) */
  tiltStrength?: number;
  /** 타일 콘텐츠(이미지 + 제목/연도). 없으면 데모용 기본 목록 사용 */
  items?: InfiniteCanvasItem[];
}

const HUES = [252, 24, 190, 322, 152, 62, 210, 288, 8, 172];
const TILT_REF_SPEED = 1200;

const DEFAULT_ITEMS: InfiniteCanvasItem[] = [
  { title: "Carbon Field", year: "2024" },
  { title: "Mono Cascade", year: "2024" },
  { title: "Silver Orbit", year: "2024" },
  { title: "Quartz Studio", year: "2025" },
  { title: "Neon Workshop", year: "2024" },
  { title: "Polar Orbit", year: "2023" },
  { title: "Nova Loom", year: "2025" },
  { title: "Phantom Grid", year: "2025" },
  { title: "Ionic Harbor", year: "2024" },
  { title: "Nimbus Frame", year: "2025" },
  { title: "Vector Haven", year: "2024" },
  { title: "Zenith Orbit", year: "2023" },
  { title: "Pixel Drift", year: "2025" },
  { title: "Ashen Coast", year: "2024" },
];

/**
 * 원통 벽 안에 서 있는 듯한 3D 곡면 무한 갤러리. 드래그로 자유롭게 팬하고
 * 관성으로 미끄러지며 특정 위치로 스냅되지 않는다. 클릭·홀드로 타일이
 * 모이거나 줄어드는 효과는 전혀 없다 — 순수하게 드래그 팬만 존재한다.
 * 각 타일은 화면 중심에서 멀어질수록 곡면을 따라 회전·후퇴하고, 드래그
 * 속도에 비례해 진행 방향으로 살짝 기운다. 비네트·그림자 같은 별도의
 * 장식 오버레이는 넣지 않는다. 모든 갱신은 rAF에서 DOM transform으로
 * 직접 이뤄진다(리렌더 없음).
 */
export function InfiniteCanvas({
  cellSize = 130,
  gap = 8,
  momentum = 0.92,
  curvature = 18,
  curveRadius = 900,
  tiltStrength = 6,
  items = DEFAULT_ITEMS,
}: InfiniteCanvasProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });
  const dimsRef = useRef({ width: 0, height: 0 });
  const state = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    dragging: false,
    pointerId: null as number | null,
    px: 0,
    py: 0,
  });

  const step = cellSize + gap;

  // 컨테이너 크기에 맞춰 필요한 타일 수 계산 (양방향 여유 포함).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      dimsRef.current = { width, height };
      setGrid({
        cols: Math.ceil(width / step) + 3,
        rows: Math.ceil(height / step) + 3,
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [step]);

  useAnimationFrame((_, delta) => {
    const s = state.current;
    const dt = Math.min(delta / 1000, 0.05);
    const { width, height } = dimsRef.current;
    if (!width || !height) return;

    if (!s.dragging) {
      if (reducedMotion) {
        s.vx = 0;
        s.vy = 0;
      } else if (Math.hypot(s.vx, s.vy) > 0.5) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const decay = Math.pow(momentum, dt * 60);
        s.vx *= decay;
        s.vy *= decay;
      }
    }

    const totalW = grid.cols * step;
    const totalH = grid.rows * step;
    if (!totalW || !totalH) return;
    const half = cellSize / 2;
    const cx = width / 2;
    const cy = height / 2;

    const velTiltY = clamp((s.vx / TILT_REF_SPEED) * tiltStrength, -tiltStrength, tiltStrength);
    const velTiltX = clamp((-s.vy / TILT_REF_SPEED) * tiltStrength, -tiltStrength, tiltStrength);

    tileRefs.current.forEach((tile, i) => {
      if (!tile) return;
      const c = i % grid.cols;
      const r = Math.floor(i / grid.cols);
      const screenX = mod(c * step + s.x, totalW) - step;
      const screenY = mod(r * step + s.y, totalH) - step;

      let rotY = velTiltY;
      let rotX = velTiltX;
      let posX = screenX;
      let posY = screenY;
      if (curvature > 0) {
        const relX = clamp((screenX + half - cx) / cx, -1, 1);
        const relY = clamp((screenY + half - cy) / cy, -1, 1);
        const curveAngleY = relX * curvature;
        const curveAngleX = -relY * curvature * 0.5;
        rotY += curveAngleY;
        rotX += curveAngleX;
        if (curveRadius > 0) {
          // rotateY/X를 transform-origin 뒤로 밀린 피벗 기준으로 적용하면 그 자체로
          // radius*sin(theta)만큼의 위치 이동이 "덤"으로 생긴다(공유 원통 축 회전과 동치).
          // screenX/Y는 이미 평평한 격자 간격을 반영하고 있으므로 그 덤을 그대로 더하면
          // 이중으로 밀려나 타일 사이에 큰 공백이 생긴다. 그래서 회전이 만들어낼 이동량의
          // 선형 근사(radius*theta)를 미리 상쇄한다 — 남는 것은 sin(theta)-theta 수준의
          // 고차항, 즉 진짜 곡률에 해당하는 미세한 압축뿐이다. rotateY와 rotateX는 축이
          // 달라 부호가 반대다(rotateY의 유도 X-오프셋은 +radius·sinθ, rotateX의
          // 유도 Y-오프셋은 -radius·sinθ).
          posX = screenX - curveRadius * ((curveAngleY * Math.PI) / 180);
          posY = screenY + curveRadius * ((curveAngleX * Math.PI) / 180);
        }
      }

      // transform-origin이 tile 뒤쪽 radius만큼에 있으므로 rotateY/X만으로
      // 원통 접선 위치가 자연히 계산된다 — translateZ를 따로 더하지 않는다.
      // (원점을 자기 중심에 두고 회전 후 translateZ로 밀면 인접 타일과 겹친다.)
      tile.style.transform = `translate3d(${posX.toFixed(1)}px, ${posY.toFixed(1)}px, 0) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
    });
  });

  function onPointerDown(e: React.PointerEvent) {
    const s = state.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    s.dragging = true;
    s.pointerId = e.pointerId;
    s.px = e.clientX;
    s.py = e.clientY;
    s.vx = 0;
    s.vy = 0;
  }
  function onPointerMove(e: React.PointerEvent) {
    const s = state.current;
    if (!s.dragging || e.pointerId !== s.pointerId) return;
    const dx = e.clientX - s.px;
    const dy = e.clientY - s.py;
    s.px = e.clientX;
    s.py = e.clientY;
    s.x += dx;
    s.y += dy;
    // 속도는 즉시 최근 프레임 델타로 갱신 — 관성 시작점이자 기울임 효과의 입력.
    s.vx = dx * 60;
    s.vy = dy * 60;
  }
  function endDrag(e: React.PointerEvent) {
    const s = state.current;
    if (e.pointerId !== s.pointerId) return;
    s.dragging = false;
    s.pointerId = null;
  }
  function onKeyDown(e: React.KeyboardEvent) {
    const s = state.current;
    const d = 60;
    if (e.key === "ArrowLeft") s.x += d;
    else if (e.key === "ArrowRight") s.x -= d;
    else if (e.key === "ArrowUp") s.y += d;
    else if (e.key === "ArrowDown") s.y -= d;
    else return;
    e.preventDefault();
  }

  const total = grid.cols * grid.rows;

  // transform-origin을 curveRadius만큼 타일 뒤로 밀어 "자기 중심 회전"이 아니라
  // "공유 원통 축 기준 회전"이 되게 한다 — panorama-carousel과 같은 원리
  // (rotateY 후 translateZ(-radius) 대신, origin 자체를 뒤로 밀어 같은 효과를 낸다).
  // 그래야 인접 타일이 겹치지 않고 부채꼴로 자연스럽게 펼쳐진다.
  // perspective는 radius보다 작아야 "원통 안에 서 있는" 느낌이 나며 (panorama-carousel과
  // 동일한 0.62 비율), radius가 perspective보다 훨씬 크면 원근 투영이 깨져 타일이
  // 화면 밖으로 튕겨 나간다 — 반드시 이 비율을 유지해야 한다.
  const tileTransformOrigin = curveRadius > 0 ? `50% 50% ${-curveRadius}px` : "50% 50%";

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="드래그로 탐색하는 3D 커브드 갤러리. 방향키로도 이동할 수 있습니다"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      style={{ perspective: Math.max(400, Math.round(curveRadius * 0.62)), perspectiveOrigin: "50% 50%" }}
      className="relative h-96 w-full cursor-grab touch-none select-none overflow-hidden rounded-2xl bg-zinc-950 outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
    >
      {Array.from({ length: total }).map((_, i) => {
        const c = i % grid.cols;
        const r = Math.floor(i / grid.cols);
        const item = items[(r * 7 + c * 3) % items.length];
        const visual = (r * 7 + c * 3) % HUES.length;
        const bg = item.image
          ? `url(${item.image})`
          : `linear-gradient(145deg, hsl(${HUES[visual]} 45% 18%), hsl(${(HUES[visual] + 40) % 360} 55% 10%))`;
        return (
          <div
            key={i}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            className="absolute left-0 top-0 overflow-hidden rounded-xl ring-1 ring-white/10 will-change-transform"
            style={{
              width: cellSize,
              height: cellSize,
              transform: `translate3d(${c * step}px, ${r * step}px, 0)`,
              transformOrigin: tileTransformOrigin,
              backgroundImage: bg,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden="true"
          >
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/65 to-transparent px-2.5 py-2 text-[9px] uppercase tracking-[0.12em] text-white/85">
              <span className="truncate">{item.title}</span>
              <span className="shrink-0 text-white/55">{item.year}</span>
            </div>
          </div>
        );
      })}

      <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/50 backdrop-blur">
        Drag to explore
      </p>
    </div>
  );
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
