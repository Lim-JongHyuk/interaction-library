import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "liquid-gradient",
  category: "backgrounds",
  name: "Liquid Gradient",
  description: "유체처럼 형태가 뭉개지며 도는 블롭 그라디언트 배경. 필름 그레인 오버레이 지원.",
  tags: ["background", "gradient", "liquid", "loop", "grain"],
  trigger: "loop",
  triggerNote: "border-radius 모핑과 회전을 조합해 WebGL 없이 리퀴드 느낌을 낸다.",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 6, max: 30, step: 1, default: 14, unit: "s" },
    { key: "palette", label: "Palette", control: "select", options: ["iris", "ember", "lagoon", "mono"], default: "iris" },
    { key: "blur", label: "Blur", control: "slider", min: 10, max: 80, step: 2, default: 36, unit: "px" },
    { key: "grain", label: "Film Grain", control: "toggle", default: true },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "모핑 애니메이션을 정지하고 정적인 그라디언트를 표시한다." },
  install: { registryPath: "r/backgrounds/liquid-gradient.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
