import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "location-globe",
  category: "data",
  name: "Location Globe",
  description: "위치 마커가 표시된 점묘화 스타일 지구본. 드래그로 회전, 자동 회전 지원.",
  tags: ["globe", "map", "data", "3d", "canvas"],
  trigger: "drag",
  triggerNote: "기본 자동 회전. 드래그로 관성 있게 수동 회전 가능(키보드 화살표도 지원).",
  params: [
    { key: "autoRotate", label: "Auto Rotate", control: "toggle", default: true },
    { key: "autoRotateSpeed", label: "Rotate Speed", control: "slider", min: 0, max: 30, step: 1, default: 8, unit: "°/s" },
    { key: "rotationSensitivity", label: "Drag Sensitivity", control: "slider", min: 0.1, max: 2, step: 0.1, default: 1 },
    { key: "tiltAngle", label: "Tilt", control: "slider", min: -60, max: 60, step: 1, default: -14, unit: "deg" },
    { key: "dotColor", label: "Dot Color", control: "color", default: "#ffffff" },
    { key: "gridColor", label: "Grid Color", control: "color", default: "#ffffff" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "자동 회전과 위치 마커 펄스 애니메이션을 정지하고 정적인 지구본을 표시한다.",
    notes: ["Canvas 2D로 렌더링되며 role=img으로 스크린리더에 노출된다."],
  },
  install: { registryPath: "r/data/location-globe.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
