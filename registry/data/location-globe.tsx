"use client";

// deps: none
import { useCallback, useEffect, useRef, useState } from "react";

// Simplified continent outlines used only to decide which grid samples
// become "land" dots. Deliberately low-fidelity to match the dot-globe
// aesthetic — not meant to be geographically precise.
const CONTINENTS: [number, number][][] = [
  [[-165, 68], [-140, 70], [-95, 72], [-75, 68], [-60, 50], [-52, 47], [-65, 45], [-75, 35], [-80, 25], [-97, 18], [-105, 20], [-115, 30], [-125, 40], [-125, 50], [-135, 58], [-165, 68]],
  [[-105, 20], [-97, 18], [-88, 14], [-83, 9], [-79, 8], [-83, 15], [-92, 16], [-105, 20]],
  [[-79, 8], [-77, -5], [-70, -18], [-70, -30], [-73, -45], [-68, -55], [-62, -55], [-58, -38], [-48, -25], [-40, -10], [-35, -6], [-45, 2], [-60, 5], [-70, 10], [-79, 8]],
  [[-10, 36], [-9, 43], [0, 49], [5, 51], [10, 54], [20, 55], [30, 60], [40, 65], [45, 68], [35, 70], [20, 70], [5, 62], [-5, 50], [-10, 43], [-10, 36]],
  [[-17, 15], [-17, 21], [-10, 30], [10, 37], [20, 33], [32, 31], [35, 20], [43, 12], [51, 12], [48, 0], [40, -15], [35, -25], [27, -33], [18, -34], [13, -18], [9, 4], [-5, 5], [-15, 12], [-17, 15]],
  [[27, 40], [30, 45], [40, 50], [55, 55], [70, 60], [90, 65], [110, 70], [130, 70], [140, 60], [135, 50], [125, 45], [122, 38], [120, 30], [108, 22], [100, 20], [97, 28], [90, 26], [80, 28], [70, 30], [60, 30], [45, 32], [35, 37], [27, 40]],
  [[68, 24], [72, 20], [76, 10], [80, 8], [85, 10], [88, 22], [80, 28], [70, 30], [68, 24]],
  [[124.5, 43], [130.3, 42.3], [129.5, 37.5], [128.5, 35], [126.5, 34.3], [125, 36], [124.3, 39], [124.5, 43]],
  [[141.5, 45.5], [145.5, 43.5], [142, 39], [140.5, 35.5], [139, 34.3], [136, 33.5], [133, 32.5], [130.5, 31], [129.5, 33], [131.5, 34.5], [133, 35.5], [135.5, 36], [137, 37], [138.5, 38.5], [140, 40], [140, 43], [141.5, 45.5]],
  [[113, -22], [115, -33], [130, -32], [141, -38], [150, -37], [153, -28], [145, -17], [135, -12], [125, -15], [113, -22]],
  [[-45, 60], [-40, 75], [-25, 82], [-15, 78], [-25, 70], [-40, 65], [-45, 60]],
  [[-180, -63], [-180, -85], [180, -85], [180, -63]],
];

const DEG2RAD = Math.PI / 180;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function pointInPolygon(lng: number, lat: number, poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isLand(lng: number, lat: number) {
  return CONTINENTS.some((poly) => pointInPolygon(lng, lat, poly));
}

function sphereToXYZ(latDeg: number, lngDeg: number) {
  const lat = latDeg * DEG2RAD;
  const lng = lngDeg * DEG2RAD;
  return { x: Math.cos(lat) * Math.sin(lng), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lng) };
}

function rotatePoint(v: { x: number; y: number; z: number }, yaw: number, tilt: number) {
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const x1 = v.x * cosY + v.z * sinY;
  const z1 = -v.x * sinY + v.z * cosY;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const y2 = v.y * cosT - z1 * sinT;
  const z2 = v.y * sinT + z1 * cosT;
  return { x: x1, y: y2, z: z2 };
}

function buildDotField() {
  const field: { x: number; y: number; z: number }[] = [];
  const baseLngSamples = 150;
  for (let lat = -84; lat <= 84; lat += 2.5) {
    const samples = Math.max(6, Math.round(baseLngSamples * Math.cos(lat * DEG2RAD)));
    const lngStep = 360 / samples;
    for (let j = 0; j < samples; j++) {
      const lng = -180 + j * lngStep;
      if (isLand(lng, lat)) field.push(sphereToXYZ(lat, lng));
    }
  }
  return field;
}

const DOT_FIELD = buildDotField();

function drawGridCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  yaw: number,
  tilt: number,
  mode: "lat" | "lng",
  fixedDeg: number
) {
  const steps = 72;
  let started = false;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const latDeg = mode === "lat" ? fixedDeg : -90 + (180 * i) / steps;
    const lngDeg = mode === "lat" ? -180 + (360 * i) / steps : fixedDeg;
    const rv = rotatePoint(sphereToXYZ(latDeg, lngDeg), yaw, tilt);
    if (rv.z <= 0) {
      started = false;
      continue;
    }
    const sx = cx + rv.x * R;
    const sy = cy - rv.y * R;
    if (!started) {
      ctx.moveTo(sx, sy);
      started = true;
    } else {
      ctx.lineTo(sx, sy);
    }
  }
  ctx.stroke();
}

export interface Location {
  label: string;
  lat: number;
  lng: number;
  color?: string;
}

export interface LocationGlobeProps {
  locations?: Location[];
  dotColor?: string;
  gridColor?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  rotationSensitivity?: number;
  tiltAngle?: number;
}

const DEFAULT_LOCATIONS: Location[] = [
  { label: "Tokyo", lat: 35.68, lng: 139.69, color: "#818cf8" },
  { label: "New Delhi", lat: 28.61, lng: 77.21, color: "#fb923c" },
  { label: "Dubai", lat: 25.2, lng: 55.27, color: "#4ade80" },
];

export function LocationGlobe({
  locations = DEFAULT_LOCATIONS,
  dotColor = "rgba(255,255,255,0.85)",
  gridColor = "rgba(255,255,255,0.15)",
  autoRotate = true,
  autoRotateSpeed = 8,
  rotationSensitivity = 1,
  tiltAngle = -14,
}: LocationGlobeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctx2dRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const simRef = useRef({
    status: "idle" as "idle" | "dragging" | "released",
    yaw: 0.5,
    velYaw: 0,
    elapsed: 0,
    lastFrameTime: 0,
    releaseElapsed: 0,
    samples: [] as { dx: number; dt: number }[],
    pointerId: null as number | null,
    lastX: 0,
    lastMoveTime: 0,
  });

  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctx2dRef.current;
    if (!canvas || !ctx || canvas.width === 0) return;
    const sim = simRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.42;
    const yaw = sim.yaw;
    const tilt = tiltAngle * DEG2RAD;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = Math.max(1, w * 0.0015);
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = Math.max(1, w * 0.001);
    for (let lat = -60; lat <= 60; lat += 20) drawGridCircle(ctx, cx, cy, R, yaw, tilt, "lat", lat);
    for (let lng = -180; lng < 180; lng += 20) drawGridCircle(ctx, cx, cy, R, yaw, tilt, "lng", lng);

    ctx.fillStyle = dotColor;
    const baseR = Math.max(0.5, w * 0.0012);
    for (const v of DOT_FIELD) {
      const rv = rotatePoint(v, yaw, tilt);
      if (rv.z <= 0) continue;
      const sx = cx + rv.x * R;
      const sy = cy - rv.y * R;
      const depth = 0.55 + 0.45 * rv.z;
      ctx.globalAlpha = depth;
      ctx.beginPath();
      ctx.arc(sx, sy, baseR * depth, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      const rv = rotatePoint(sphereToXYZ(loc.lat, loc.lng), yaw, tilt);
      if (rv.z <= 0) continue;
      const sx = cx + rv.x * R;
      const sy = cy - rv.y * R;
      const depth = 0.6 + 0.4 * rv.z;
      const dotRadius = Math.max(2.5, w * 0.008) * depth;
      const color = loc.color || "#818cf8";

      if (!reducedMotionRef.current) {
        const pulse = (sim.elapsed * 0.6 + i * 0.35) % 1;
        ctx.beginPath();
        ctx.arc(sx, sy, dotRadius * (1 + pulse * 2.2), 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = (1 - pulse) * 0.5;
        ctx.lineWidth = Math.max(1, dotRadius * 0.35);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(sx, sy, dotRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = Math.max(0.5, dotRadius * 0.2);
      ctx.stroke();

      if (loc.label) {
        const fontSize = Math.max(9, w * 0.026);
        ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        ctx.textBaseline = "middle";
        const flip = sx > w * 0.7;
        ctx.textAlign = flip ? "right" : "left";
        const tx = sx + (flip ? -(dotRadius + 6) : dotRadius + 6);
        ctx.lineJoin = "round";
        ctx.lineWidth = fontSize * 0.28;
        ctx.strokeStyle = "rgba(0,0,0,0.55)";
        ctx.strokeText(loc.label, tx, sy);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(loc.label, tx, sy);
      }
    }
  }, [locations, dotColor, gridColor, tiltAngle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const el = wrapperRef.current;
    if (!canvas || !el) return;
    ctx2dRef.current = canvas.getContext("2d");

    // Size synchronously on mount instead of waiting for the first
    // ResizeObserver tick, which some browsers defer by a frame.
    const rect = el.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    drawFrame();
  }, [drawFrame]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = () => {
      reducedMotionRef.current = mq.matches;
      drawFrame();
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [drawFrame]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => setIsVisible(entries[0].isIntersecting), {
      rootMargin: "200px",
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const w = Math.max(1, Math.round(entry.contentRect.width));
      const h = Math.max(1, Math.round(entry.contentRect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      drawFrame();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [drawFrame]);

  useEffect(() => {
    if (!isVisible) return;
    if (reducedMotionRef.current) {
      drawFrame();
      return;
    }

    // 렌더 루프. 자기 자신을 재귀 예약해야 하므로 effect 로컬 함수로 둔다.
    function loop(now: number) {
      const sim = simRef.current;
      const dt = clamp((now - sim.lastFrameTime) / 1000, 0, 0.05);
      sim.lastFrameTime = now;
      const reduced = reducedMotionRef.current;

      if (!reduced) sim.elapsed += dt;

      if (sim.status === "released") {
        sim.yaw += sim.velYaw * dt;
        sim.velYaw *= Math.pow(0.02, dt / 0.8);
        sim.releaseElapsed += dt;
        if (sim.releaseElapsed > 0.8 || Math.abs(sim.velYaw) < 0.005) {
          sim.status = "idle";
          sim.releaseElapsed = 0;
          sim.velYaw = 0;
        }
      } else if (sim.status === "idle" && autoRotate && !reduced) {
        sim.yaw += autoRotateSpeed * DEG2RAD * dt;
      }

      drawFrame();
      rafRef.current = requestAnimationFrame(loop);
    }

    simRef.current.lastFrameTime = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isVisible, drawFrame, autoRotate, autoRotateSpeed]);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const sim = simRef.current;
    sim.status = "dragging";
    sim.pointerId = e.pointerId;
    sim.lastX = e.clientX;
    sim.lastMoveTime = performance.now();
    sim.samples = [];
    setIsDragging(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const sim = simRef.current;
    if (sim.status !== "dragging" || e.pointerId !== sim.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - sim.lastX;
    const dt = Math.max(now - sim.lastMoveTime, 1);
    const sens = clamp(rotationSensitivity, 0.1, 2);
    sim.yaw += dx * 0.35 * sens * DEG2RAD;
    sim.samples.push({ dx, dt });
    if (sim.samples.length > 5) sim.samples.shift();
    sim.lastX = e.clientX;
    sim.lastMoveTime = now;
    drawFrame();
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const sim = simRef.current;
    if (sim.status !== "dragging" || e.pointerId !== sim.pointerId) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    if (reducedMotionRef.current || sim.samples.length === 0) {
      sim.status = "idle";
      sim.velYaw = 0;
      return;
    }
    let sumDx = 0;
    let sumDt = 0;
    for (const s of sim.samples) {
      sumDx += s.dx;
      sumDt += s.dt;
    }
    const sens = clamp(rotationSensitivity, 0.1, 2);
    const velDeg = sumDt > 0 ? (sumDx / sumDt) * 1000 * 0.35 * sens : 0;
    sim.velYaw = velDeg * DEG2RAD;
    sim.status = "released";
    sim.releaseElapsed = 0;
  }

  return (
    <div
      ref={wrapperRef}
      aria-label="위치가 표시된 인터랙티브 지구본"
      role="img"
      style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
      className="relative h-full w-full overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 block h-full w-full" />
    </div>
  );
}
