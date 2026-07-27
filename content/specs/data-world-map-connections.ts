import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "world-map-connections",
  category: "data",
  name: "World Map Connections",
  description: "점묘화 세계지도 위에서 연결 호가 그려지는 글로벌 네트워크 다이어그램. 다크/라이트 테마, 순차·동시 애니메이션, 루프 on/off를 지원한다.",
  tags: ["map", "world", "network", "connections", "svg", "geo", "theme", "loop"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 연결 호가 (설정에 따라) 순서대로 또는 한꺼번에 그려지고, loop가 켜져 있으면 흐르는 하이라이트와 마커 펄스가 계속 반복된다.",
  params: [
    { key: "darkMode", label: "Dark Mode", control: "toggle", default: true },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "animationType", label: "Animation", control: "select", options: ["sequential", "simultaneous"], default: "sequential" },
    { key: "loop", label: "Loop", control: "toggle", default: true },
    { key: "duration", label: "Speed", control: "slider", min: 0.4, max: 3, step: 0.1, default: 1.4, unit: "s" },
    { key: "stagger", label: "Delay", control: "slider", min: 0, max: 0.5, step: 0.02, default: 0.18, unit: "s" },
    { key: "lineWidth", label: "Line Width", control: "slider", min: 0.8, max: 4, step: 0.1, default: 1.6, unit: "px" },
    { key: "pulseRadius", label: "Pulse Radius", control: "slider", min: 0, max: 28, step: 1, default: 16, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "모든 연결 호를 즉시 완전히 그려진 상태로, 마커는 펄스 없이 정적으로 표시한다.",
    notes: [
      "SVG는 role=img이며 연결 목록을 aria-label로 요약해 스크린리더에 제공한다.",
      "각 마커에는 <title>로 지점명을 노출한다.",
      "darkTheme/lightTheme 프롭으로 배경·지도 점 색을 테마별로 독립적으로 재정의할 수 있다.",
    ],
  },
  install: { registryPath: "r/data/world-map-connections.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-27",
};
export default spec;
