import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "blur-out-up",
  category: "typography",
  name: "Blur Out Up",
  description: "글자들이 블러가 걷히며 위로 살짝 이동해 정착하는 등장 효과.",
  tags: ["text", "reveal", "blur", "stagger"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.1, max: 1.5, step: 0.05, default: 0.5, unit: "s" },
    { key: "stagger", label: "Stagger", control: "slider", min: 0, max: 0.15, step: 0.01, default: 0.03, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "글자별 애니메이션 없이 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/blur-out-up.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
