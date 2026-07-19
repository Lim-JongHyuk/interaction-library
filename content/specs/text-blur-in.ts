import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "blur-in",
  category: "typography",
  name: "Blur In Text",
  description: "블러가 걷히며 초점이 맞는 것처럼 텍스트가 선명해지는 효과.",
  tags: ["text", "reveal", "blur"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.1, max: 2, step: 0.05, default: 0.6, unit: "s" },
    { key: "blurAmount", label: "Blur Amount", control: "slider", min: 0, max: 20, step: 1, default: 8, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "블러/투명도 애니메이션 없이 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/blur-in.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
