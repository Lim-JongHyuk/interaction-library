import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "split-reveal",
  category: "typography",
  name: "Split Reveal",
  description: "글자 단위로 분해되어 방향성을 가지고 순차적으로 등장하는 효과.",
  tags: ["text", "reveal", "stagger", "hero"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.1, max: 1.5, step: 0.05, default: 0.5, unit: "s" },
    { key: "stagger", label: "Stagger", control: "slider", min: 0, max: 0.15, step: 0.01, default: 0.03, unit: "s" },
    {
      key: "direction",
      label: "Direction",
      control: "select",
      options: ["up", "down", "left", "right"],
      default: "up",
    },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "글자별 애니메이션 없이 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/split-reveal.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
