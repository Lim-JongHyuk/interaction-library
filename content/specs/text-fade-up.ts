import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "fade-up",
  category: "typography",
  name: "Fade Up Text",
  description: "아래에서 위로 살짝 이동하며 서서히 나타나는 가장 기본적인 등장 효과.",
  tags: ["text", "reveal", "fade", "hero"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.1, max: 2, step: 0.05, default: 0.6, unit: "s" },
    { key: "delay", label: "Delay", control: "slider", min: 0, max: 1, step: 0.05, default: 0, unit: "s" },
    { key: "distance", label: "Distance", control: "slider", min: 0, max: 80, step: 4, default: 24, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "이동/투명도 애니메이션 없이 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/fade-up.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
