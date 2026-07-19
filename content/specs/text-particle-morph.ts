import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "particle-morph",
  category: "typography",
  name: "Particle Morph",
  description: "텍스트를 수천 개의 파티클로 분해해 단어 사이를 유기적으로 모핑하는 인터랙티브 타이포그래피.",
  tags: ["text", "particles", "morph", "canvas", "physics", "flagship"],
  trigger: "loop",
  triggerNote: "단어가 interval마다 순환 모핑하고, 커서를 대면 파티클이 반발한다.",
  params: [
    { key: "words", label: "Words (| 구분)", control: "text", default: "MOTION|MORPH|KIT" },
    { key: "gap", label: "Density (gap px)", control: "slider", min: 2, max: 8, step: 1, default: 4 },
    { key: "particleSize", label: "Particle Size", control: "slider", min: 0.5, max: 3, step: 0.1, default: 1.4 },
    { key: "interval", label: "Interval", control: "slider", min: 1, max: 6, step: 0.5, default: 3, unit: "s" },
    { key: "repelRadius", label: "Repel Radius", control: "slider", min: 0, max: 200, step: 10, default: 90 },
    { key: "color", label: "Color", control: "color", default: "#a5b4fc" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "모핑·물리 시뮬레이션을 정지하고 첫 단어를 정적 파티클 배치로만 렌더링한다.",
    notes: ["실제 텍스트는 sr-only로 노출되고 캔버스는 role=img + aria-label로 대체된다."],
  },
  install: { registryPath: "r/typography/particle-morph.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
