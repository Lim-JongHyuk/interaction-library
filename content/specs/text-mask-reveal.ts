import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "mask-reveal",
  category: "typography",
  name: "Mask Reveal",
  description: "각진 마스크가 이동하며 텍스트를 점진적으로 드러내는 효과.",
  tags: ["text", "reveal", "mask", "hero"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.2, max: 2, step: 0.05, default: 0.7, unit: "s" },
    { key: "angle", label: "Angle", control: "slider", min: 0, max: 90, step: 5, default: 10, unit: "deg" },
    { key: "delay", label: "Delay", control: "slider", min: 0, max: 1, step: 0.05, default: 0, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "마스크 이동 애니메이션 없이 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/mask-reveal.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
