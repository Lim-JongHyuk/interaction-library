"use client";

// deps: motion
import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface WorldMapPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface WorldMapConnection {
  from: WorldMapPoint;
  to: WorldMapPoint;
}

export interface WorldMapThemeColors {
  background: string;
  mapDotColor: string;
}

export type WorldMapAnimationType = "sequential" | "simultaneous";

export interface WorldMapConnectionsProps {
  /** 연결 경로 목록 — lat/lng 쌍만 넘기면 나머지는 자동으로 그려진다. */
  connections?: WorldMapConnection[];
  /** 다크/라이트 배색 전환 */
  darkMode?: boolean;
  /** 다크 모드 배색 재정의 (일부만 넘겨도 됨) */
  darkTheme?: Partial<WorldMapThemeColors>;
  /** 라이트 모드 배색 재정의 (일부만 넘겨도 됨) */
  lightTheme?: Partial<WorldMapThemeColors>;
  /** 호·마커 액센트 색 (두 테마 공통) */
  accent?: string;
  /** 호가 순서대로 그려지는지(sequential), 한꺼번에 그려지는지(simultaneous) */
  animationType?: WorldMapAnimationType;
  /** 흐르는 하이라이트·마커 펄스를 무한 반복할지 */
  loop?: boolean;
  /** 호 하나가 그려지는 데 걸리는 시간(초) */
  duration?: number;
  /** sequential일 때 호 사이 지연(초) */
  stagger?: number;
  /** 호 곡률 — 두 지점 사이 거리 대비 위로 들어올리는 비율 */
  curvature?: number;
  /** 선 굵기(px) */
  lineWidth?: number;
  /** 마커 펄스 링의 최대 반지름(px). 0이면 펄스를 끈다 */
  pulseRadius?: number;
  /** 지도를 이루는 점 하나의 반지름(px) */
  mapDotSize?: number;
}

const W = 1000;
const H = 460;
const LAT_MIN = -56;
const LAT_MAX = 78;
const GRID_STEP = 3;

const DARK_THEME: WorldMapThemeColors = { background: "#04060c", mapDotColor: "#33507a" };
const LIGHT_THEME: WorldMapThemeColors = { background: "#f3f4f8", mapDotColor: "#b7c0d6" };

// Simplified continent outlines used only to decide which grid samples become
// "land" dots — same low-fidelity approach as the Location Globe component,
// adapted to a flat equirectangular crop instead of a sphere. Not meant to be
// geographically precise.
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
];

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

function project(lat: number, lng: number) {
  return {
    x: ((lng + 180) / 360) * W,
    y: ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H,
  };
}

function buildMapDots() {
  const dots: { x: number; y: number }[] = [];
  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += GRID_STEP) {
    for (let lng = -180; lng < 180; lng += GRID_STEP) {
      if (isLand(lng, lat)) dots.push(project(lat, lng));
    }
  }
  return dots;
}

const MAP_DOTS = buildMapDots();

// 제어점을 두 점 사이 거리에 비례해 위로 들어올려 항상 위로 볼록한 호를 만든다.
function arcPath(p1: { x: number; y: number }, p2: { x: number; y: number }, curvature: number) {
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const liftY = my - dist * curvature;
  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} Q ${mx.toFixed(1)} ${liftY.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}

const DEFAULT_CONNECTIONS: WorldMapConnection[] = [
  { from: { lat: 37.77, lng: -122.42, label: "San Francisco" }, to: { lat: 51.51, lng: -0.13, label: "London" } },
  { from: { lat: 40.71, lng: -74.01, label: "New York" }, to: { lat: 52.52, lng: 13.4, label: "Berlin" } },
  { from: { lat: 26.0, lng: 31.0, label: "Cairo" }, to: { lat: 19.08, lng: 72.88, label: "Mumbai" } },
  { from: { lat: 26.0, lng: 31.0, label: "Cairo" }, to: { lat: 31.23, lng: 121.47, label: "Shanghai" } },
  { from: { lat: 26.0, lng: 31.0, label: "Cairo" }, to: { lat: 35.68, lng: 139.69, label: "Tokyo" } },
  { from: { lat: -23.55, lng: -46.63, label: "São Paulo" }, to: { lat: -8.84, lng: 13.23, label: "Luanda" } },
];

/**
 * 점묘화 세계지도 위에서 지점 간 연결이 순차적 또는 동시에 그려지는 네트워크
 * 다이어그램. 다크/라이트 테마, 루프 on/off, 애니메이션 타입을 프롭으로
 * 전환할 수 있다.
 */
export function WorldMapConnections({
  connections = DEFAULT_CONNECTIONS,
  darkMode = true,
  darkTheme,
  lightTheme,
  accent = "#6366f1",
  animationType = "sequential",
  loop = true,
  duration = 1.4,
  stagger = 0.18,
  curvature = 0.28,
  lineWidth = 1.6,
  pulseRadius = 16,
  mapDotSize = 1.7,
}: WorldMapConnectionsProps) {
  const reducedMotion = useReducedMotion();
  const theme = darkMode ? { ...DARK_THEME, ...darkTheme } : { ...LIGHT_THEME, ...lightTheme };
  const sequential = animationType === "sequential";

  const arcs = useMemo(
    () =>
      connections.map((c, i) => {
        const p1 = project(c.from.lat, c.from.lng);
        const p2 = project(c.to.lat, c.to.lng);
        return {
          d: arcPath(p1, p2, curvature),
          delay: sequential ? i * stagger : 0,
          key: `${c.from.label ?? i}-${c.to.label ?? i}`,
        };
      }),
    [connections, curvature, sequential, stagger]
  );

  // 같은 지점을 여러 아크가 공유할 수 있으므로 좌표로 중복 제거하고,
  // 가장 먼저 그 지점에 닿는 아크의 지연 시간을 마커 등장 타이밍으로 쓴다.
  const markers = useMemo(() => {
    const map = new Map<string, { x: number; y: number; label?: string; delay: number }>();
    connections.forEach((c, i) => {
      const delay = sequential ? i * stagger : 0;
      for (const pt of [c.from, c.to]) {
        const key = `${pt.lat.toFixed(2)},${pt.lng.toFixed(2)}`;
        const proj = project(pt.lat, pt.lng);
        const existing = map.get(key);
        if (!existing || delay < existing.delay) {
          map.set(key, { x: proj.x, y: proj.y, label: pt.label, delay });
        }
      }
    });
    return Array.from(map.values());
  }, [connections, sequential, stagger]);

  const summary = connections.map((c) => `${c.from.label ?? "지점"} → ${c.to.label ?? "지점"}`).join(", ");
  const flowRepeat = loop ? Infinity : 0;
  const pulseRepeat = loop ? Infinity : 0;

  return (
    <div className="relative w-full overflow-hidden rounded-xl p-4" style={{ background: theme.background }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label={`글로벌 연결망 지도: ${summary}`}>
        <defs>
          <linearGradient id="wmc-flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="45%" stopColor={accent} stopOpacity="1" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 점묘 세계지도 */}
        <g aria-hidden="true">
          {MAP_DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={mapDotSize} fill={theme.mapDotColor} />
          ))}
        </g>

        {/* 연결 호 — sequential이면 순서대로, simultaneous면 한꺼번에 그려짐 */}
        <g aria-hidden="true">
          {arcs.map((arc) => (
            <motion.path
              key={`base-${arc.key}`}
              d={arc.d}
              fill="none"
              stroke={accent}
              strokeWidth={lineWidth}
              strokeLinecap="round"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.85 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration, delay: arc.delay, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          {/* 그려진 뒤 흐르는 하이라이트 — loop가 꺼져 있으면 한 번만 스윕하고 사라진다 */}
          {!reducedMotion &&
            arcs.map((arc) => (
              <motion.path
                key={`flow-${arc.key}`}
                d={arc.d}
                fill="none"
                stroke="url(#wmc-flow)"
                strokeWidth={lineWidth + 0.6}
                strokeLinecap="round"
                strokeDasharray="60 260"
                initial={{ strokeDashoffset: 320, opacity: 0 }}
                whileInView={{
                  strokeDashoffset: 0,
                  opacity: loop ? 1 : [0, 1, 1, 0],
                  transition: {
                    strokeDashoffset: { duration: 1.8, repeat: flowRepeat, ease: "linear", delay: duration + arc.delay },
                    opacity: loop
                      ? { duration: 0.4, delay: duration + arc.delay }
                      : { duration: 1.8, delay: duration + arc.delay, times: [0, 0.05, 0.85, 1], ease: "linear" },
                  },
                }}
                viewport={{ once: true, amount: 0.3 }}
              />
            ))}
        </g>

        {/* 엔드포인트 마커 */}
        <g>
          {markers.map((m, i) => (
            <g key={i}>
              {pulseRadius > 0 && !reducedMotion && (
                <motion.circle
                  cx={m.x}
                  cy={m.y}
                  fill="none"
                  stroke={accent}
                  strokeWidth={1.2}
                  initial={{ r: 3, opacity: 0 }}
                  whileInView={{
                    r: [3, 3, pulseRadius],
                    opacity: [0, 0.6, 0],
                    transition: { duration: 2.2, repeat: pulseRepeat, ease: "easeOut", delay: m.delay + duration },
                  }}
                  viewport={{ once: true, amount: 0.3 }}
                />
              )}
              <motion.circle
                cx={m.x}
                cy={m.y}
                fill={accent}
                stroke={theme.background}
                strokeWidth={1}
                initial={reducedMotion ? false : { r: 0, opacity: 0 }}
                whileInView={{ r: 3, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: m.delay, ease: "backOut" }}
              >
                {m.label && <title>{m.label}</title>}
              </motion.circle>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
