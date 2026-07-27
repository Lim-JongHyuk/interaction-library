"use client";

// deps: motion
import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

export type CubeFaceName = "front" | "right" | "back" | "left" | "top" | "bottom";

export interface CubeGalleryImage {
  src?: string;
  hue?: number;
  alt?: string;
}

export interface CubeGalleryProps {
  /** 공유 모드 — 이미지 풀 하나를 6면에 자동 분배한다. 면마다 다른 순서로 섞여 변화를 준다. */
  images?: CubeGalleryImage[];
  /** 면별 모드 — 지정한 면은 이 배열을 그대로 쓰고, 나머지 면은 images로 채운다. */
  faces?: Partial<Record<CubeFaceName, CubeGalleryImage[]>>;
  /** 면당 그리드 한 변 칸 수 (1~3) */
  gridSize?: number;
  /** 큐브 한 변 길이(px) */
  size?: number;
  /** 타일 간격(px) */
  gap?: number;
  /** 카메라 원근감(px) — 값이 클수록 왜곡이 약해진다 */
  perspective?: number;
  /** 유휴 상태 자동 회전 속도(deg/s). 0이면 자동 회전 없음 */
  autoRotateSpeed?: number;
  /** 드래그 회전 민감도 */
  dragSensitivity?: number;
  /** 호버 시 나머지 타일이 어두워지는 정도 (0~1) */
  hoverDim?: number;
  /** 호버 시 큐브가 커지는 배율 */
  hoverScale?: number;
  /** 큐브 뒤 배경색 */
  background?: string;
}

const FACES: CubeFaceName[] = ["front", "right", "back", "left", "top", "bottom"];
const INITIAL_ROT_X = -18;
const INITIAL_ROT_Y = -35;
const ROT_X_LIMIT = 55;

const DEFAULT_IMAGES: CubeGalleryImage[] = [
  { hue: 262 }, { hue: 210 }, { hue: 280 }, { hue: 245 }, { hue: 300 }, { hue: 190 },
  { hue: 270 }, { hue: 255 }, { hue: 25 }, { hue: 320 }, { hue: 200 }, { hue: 15 },
];

// 시드 고정 의사난수 — 서버/클라이언트가 항상 같은 면별 이미지 배치를 그리도록 한다.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * 공유 모드는 이미지 풀을 면마다 다른 오프셋으로 잘라 시드 셔플하고,
 * 면별 모드는 지정된 면을 그대로 쓴다. 어느 쪽이든 칸이 모자라면
 * hue 그라디언트로 자동으로 채운다.
 */
function buildFaceImages(
  images: CubeGalleryImage[],
  facesOverride: Partial<Record<CubeFaceName, CubeGalleryImage[]>> | undefined,
  gridSize: number
): Record<CubeFaceName, CubeGalleryImage[]> {
  const cells = gridSize * gridSize;
  const result = {} as Record<CubeFaceName, CubeGalleryImage[]>;
  FACES.forEach((face, i) => {
    const override = facesOverride?.[face];
    let picked: CubeGalleryImage[];
    if (override && override.length > 0) {
      picked = override.slice(0, cells);
    } else if (images.length > 0) {
      const offset = (i * cells) % images.length;
      picked = seededShuffle(
        Array.from({ length: cells }, (_, k) => images[(offset + k) % images.length]),
        i * 97 + 13
      );
    } else {
      picked = [];
    }
    while (picked.length < cells) picked.push({ hue: (i * 53 + picked.length * 31) % 360 });
    result[face] = picked;
  });
  return result;
}

function Tile({ image, opacity, onEnter, onLeave }: { image: CubeGalleryImage; opacity: number; onEnter: () => void; onLeave: () => void }) {
  return (
    <div
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      className="overflow-hidden transition-opacity duration-300 ease-out"
      style={{ opacity }}
    >
      {image.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.src} alt={image.alt ?? ""} draggable={false} className="h-full w-full object-cover" />
      ) : (
        <div
          className="h-full w-full"
          style={{ background: `linear-gradient(150deg, hsl(${image.hue ?? 240} 55% 46%), hsl(${((image.hue ?? 240) + 40) % 360} 60% 24%))` }}
        />
      )}
    </div>
  );
}

function Face({
  faceKey,
  images,
  gridSize,
  gap,
  transform,
  hoveredKey,
  hoverDim,
  onTileEnter,
  onTileLeave,
}: {
  faceKey: CubeFaceName;
  images: CubeGalleryImage[];
  gridSize: number;
  gap: number;
  transform: string;
  hoveredKey: string | null;
  hoverDim: number;
  onTileEnter: (key: string) => void;
  onTileLeave: () => void;
}) {
  return (
    <div style={{ transform, backfaceVisibility: "hidden" }} className="absolute inset-0 overflow-hidden rounded-xl bg-black">
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, gridTemplateRows: `repeat(${gridSize}, 1fr)`, gap }}
      >
        {images.map((img, i) => {
          const key = `${faceKey}-${i}`;
          const opacity = hoveredKey === null || hoveredKey === key ? 1 : 1 - hoverDim;
          return <Tile key={key} image={img} opacity={opacity} onEnter={() => onTileEnter(key)} onLeave={onTileLeave} />;
        })}
      </div>
    </div>
  );
}

/**
 * 6면 전체가 이미지 그리드인 완전한 3D 큐브 갤러리.
 * 드래그로 자유롭게(관성 포함) 회전시킬 수 있고, 유휴 상태에서는
 * 부드럽게 자동 회전한다. 타일에 호버하면 나머지가 어두워지고
 * 큐브가 살짝 커지며 회전이 잠시 멈춘다.
 */
export function CubeGallery({
  images = DEFAULT_IMAGES,
  faces,
  gridSize = 3,
  size = 220,
  gap = 3,
  perspective = 1100,
  autoRotateSpeed = 9,
  dragSensitivity = 1,
  hoverDim = 0.35,
  hoverScale = 1.05,
  background = "#04060a",
}: CubeGalleryProps) {
  const reducedMotion = useReducedMotion();
  const clampedGrid = clamp(Math.round(gridSize), 1, 3);
  const cubeRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef<HTMLDivElement>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const faceImages = useMemo(() => buildFaceImages(images, faces, clampedGrid), [images, faces, clampedGrid]);
  const totalImages = FACES.reduce((sum, f) => sum + faceImages[f].length, 0);

  const simRef = useRef({
    rotX: INITIAL_ROT_X,
    rotY: INITIAL_ROT_Y,
    velX: 0,
    velY: 0,
    dragging: false,
    pointerId: null as number | null,
    lastX: 0,
    lastY: 0,
    lastMoveTime: 0,
    lastFrame: 0,
    elapsed: 0,
    hovering: false,
    samples: [] as { dx: number; dy: number; dt: number }[],
  });

  function applyTransform() {
    const el = cubeRef.current;
    if (!el) return;
    const sim = simRef.current;
    el.style.transform = `rotateX(${sim.rotX.toFixed(2)}deg) rotateY(${sim.rotY.toFixed(2)}deg)`;
  }

  useEffect(() => {
    applyTransform();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    simRef.current.lastFrame = performance.now();

    function loop(now: number) {
      const sim = simRef.current;
      const dt = clamp((now - sim.lastFrame) / 1000, 0, 0.05);
      sim.lastFrame = now;
      sim.elapsed += dt;

      if (!sim.dragging) {
        const speed = Math.hypot(sim.velX, sim.velY);
        if (speed > 0.4) {
          // 드래그 관성 — 놓은 속도로 계속 돌다가 감쇠한다 (지도 드래그와 유사)
          sim.rotY += sim.velX * dt;
          sim.rotX = clamp(sim.rotX + sim.velY * dt, -ROT_X_LIMIT, ROT_X_LIMIT);
          const decay = Math.pow(0.02, dt);
          sim.velX *= decay;
          sim.velY *= decay;
        } else if (!sim.hovering && autoRotateSpeed > 0) {
          // 관성이 멈추면 은은한 멀티축 자동 회전으로 이어진다
          sim.rotY += autoRotateSpeed * dt;
          const wobble = Math.sin(sim.elapsed * 0.4) * 6;
          sim.rotX += (wobble - sim.rotX) * Math.min(dt * 1.4, 1);
        }
        applyTransform();
      }
      raf = requestAnimationFrame(loop);
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion, autoRotateSpeed]);

  function setHover(active: boolean) {
    simRef.current.hovering = active;
    const el = scaleRef.current;
    if (el) el.style.transform = active && !reducedMotion ? `scale(${hoverScale})` : "scale(1)";
  }

  function onTileEnter(key: string) {
    setHoveredKey(key);
    setHover(true);
  }
  function onTileLeave() {
    setHoveredKey(null);
    setHover(false);
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (reducedMotion) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const sim = simRef.current;
    sim.dragging = true;
    sim.pointerId = e.pointerId;
    sim.lastX = e.clientX;
    sim.lastY = e.clientY;
    sim.lastMoveTime = performance.now();
    sim.samples = [];
    sim.velX = 0;
    sim.velY = 0;
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const sim = simRef.current;
    if (!sim.dragging || e.pointerId !== sim.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - sim.lastX;
    const dy = e.clientY - sim.lastY;
    const dt = Math.max(now - sim.lastMoveTime, 1);
    sim.rotY += dx * 0.3 * dragSensitivity;
    sim.rotX = clamp(sim.rotX - dy * 0.25 * dragSensitivity, -ROT_X_LIMIT, ROT_X_LIMIT);
    sim.samples.push({ dx, dy, dt });
    if (sim.samples.length > 5) sim.samples.shift();
    sim.lastX = e.clientX;
    sim.lastY = e.clientY;
    sim.lastMoveTime = now;
    applyTransform();
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const sim = simRef.current;
    if (e.pointerId !== sim.pointerId) return;
    sim.dragging = false;
    sim.pointerId = null;
    if (reducedMotion || sim.samples.length === 0) {
      sim.velX = 0;
      sim.velY = 0;
      return;
    }
    let sumDx = 0;
    let sumDy = 0;
    let sumDt = 0;
    for (const s of sim.samples) {
      sumDx += s.dx;
      sumDy += s.dy;
      sumDt += s.dt;
    }
    sim.velX = sumDt > 0 ? (sumDx / sumDt) * 1000 * 0.3 * dragSensitivity : 0;
    sim.velY = sumDt > 0 ? -(sumDy / sumDt) * 1000 * 0.25 * dragSensitivity : 0;
  }

  // 드래그가 불가능한 사용자를 위한 방향키 대체 조작. reduced-motion에서도 동작한다.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const sim = simRef.current;
    const step = 12;
    let handled = true;
    if (e.key === "ArrowLeft") sim.rotY -= step;
    else if (e.key === "ArrowRight") sim.rotY += step;
    else if (e.key === "ArrowUp") sim.rotX = clamp(sim.rotX - step, -ROT_X_LIMIT, ROT_X_LIMIT);
    else if (e.key === "ArrowDown") sim.rotX = clamp(sim.rotX + step, -ROT_X_LIMIT, ROT_X_LIMIT);
    else handled = false;
    if (!handled) return;
    e.preventDefault();
    sim.velX = 0;
    sim.velY = 0;
    applyTransform();
  }

  const half = size / 2;

  return (
    <div className="flex items-center justify-center rounded-xl p-10" style={{ perspective, background }}>
      <div
        role="group"
        aria-roledescription="3D 이미지 큐브"
        aria-label={`${clampedGrid}x${clampedGrid} 그리드로 6면에 배치된 이미지 ${totalImages}장. 드래그하거나 방향키로 자유롭게 회전할 수 있다.`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: "none" }}
        className="cursor-grab touch-none outline-none focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing"
      >
        <div
          ref={scaleRef}
          style={{ transform: "scale(1)", transition: reducedMotion ? undefined : "transform 0.35s cubic-bezier(0.22,1,0.36,1)" }}
        >
          <div
            ref={cubeRef}
            style={{
              width: size,
              height: size,
              transformStyle: "preserve-3d",
              transform: `rotateX(${INITIAL_ROT_X}deg) rotateY(${INITIAL_ROT_Y}deg)`,
            }}
            className="relative"
          >
            <Face faceKey="front" images={faceImages.front} gridSize={clampedGrid} gap={gap} hoveredKey={hoveredKey} hoverDim={hoverDim} onTileEnter={onTileEnter} onTileLeave={onTileLeave} transform={`translateZ(${half}px)`} />
            <Face faceKey="back" images={faceImages.back} gridSize={clampedGrid} gap={gap} hoveredKey={hoveredKey} hoverDim={hoverDim} onTileEnter={onTileEnter} onTileLeave={onTileLeave} transform={`rotateY(180deg) translateZ(${half}px)`} />
            <Face faceKey="right" images={faceImages.right} gridSize={clampedGrid} gap={gap} hoveredKey={hoveredKey} hoverDim={hoverDim} onTileEnter={onTileEnter} onTileLeave={onTileLeave} transform={`rotateY(90deg) translateZ(${half}px)`} />
            <Face faceKey="left" images={faceImages.left} gridSize={clampedGrid} gap={gap} hoveredKey={hoveredKey} hoverDim={hoverDim} onTileEnter={onTileEnter} onTileLeave={onTileLeave} transform={`rotateY(-90deg) translateZ(${half}px)`} />
            <Face faceKey="top" images={faceImages.top} gridSize={clampedGrid} gap={gap} hoveredKey={hoveredKey} hoverDim={hoverDim} onTileEnter={onTileEnter} onTileLeave={onTileLeave} transform={`rotateX(90deg) translateZ(${half}px)`} />
            <Face faceKey="bottom" images={faceImages.bottom} gridSize={clampedGrid} gap={gap} hoveredKey={hoveredKey} hoverDim={hoverDim} onTileEnter={onTileEnter} onTileLeave={onTileLeave} transform={`rotateX(-90deg) translateZ(${half}px)`} />
          </div>
        </div>
      </div>
    </div>
  );
}
