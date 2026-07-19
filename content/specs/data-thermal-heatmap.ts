import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "thermal-heatmap",
  category: "data",
  name: "Thermal Heatmap",
  description: "커서가 지나간 자리에 열이 쌓이고 확산·냉각되는 애플 열화상 스타일 히트맵.",
  tags: ["heatmap", "thermal", "cursor", "canvas", "simulation"],
  trigger: "hover",
  triggerNote: "저해상도 열 버퍼를 매 프레임 확산·감쇠시키고 열화상 팔레트 LUT로 렌더링한다.",
  params: [
    { key: "intensity", label: "Heat Intensity", control: "slider", min: 0.3, max: 3, step: 0.1, default: 1 },
    { key: "decay", label: "Cooling", control: "slider", min: 0.9, max: 0.995, step: 0.005, default: 0.965 },
    { key: "radius", label: "Brush Radius", control: "slider", min: 2, max: 12, step: 1, default: 5 },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "확산 루프를 정지하고 커서 이동 시에만 정적 프레임을 갱신한다." },
  install: { registryPath: "r/data/thermal-heatmap.json" },
  credits: { inspiredBy: "Apple thermal visuals", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
