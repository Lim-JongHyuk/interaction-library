import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "aurora-mesh",
  category: "backgrounds",
  name: "Aurora Mesh",
  description: "여러 색의 블러 처리된 빛 덩어리가 천천히 떠다니는 오로라 배경.",
  tags: ["background", "gradient", "aurora", "loop", "mesh"],
  trigger: "loop",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 4, max: 30, step: 1, default: 12, unit: "s" },
    { key: "intensity", label: "Intensity", control: "slider", min: 0.1, max: 1, step: 0.05, default: 0.55 },
    { key: "colorA", label: "Color A", control: "color", default: "#4f46e5" },
    { key: "colorB", label: "Color B", control: "color", default: "#a855f7" },
    { key: "colorC", label: "Color C", control: "color", default: "#22d3ee" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "떠다니는 애니메이션을 정지하고 정적인 그라디언트를 표시한다." },
  install: { registryPath: "r/backgrounds/aurora-mesh.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
