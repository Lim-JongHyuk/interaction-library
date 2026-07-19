import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "rotate-words",
  category: "typography",
  name: "Rotating Words",
  description: "쉼표로 구분된 단어들이 일정 간격으로 교체되며 순환하는 루프 효과.",
  tags: ["text", "words", "loop"],
  trigger: "loop",
  params: [
    { key: "words", label: "Words", control: "text", default: "Design, Motion, Code" },
    { key: "interval", label: "Interval", control: "slider", min: 800, max: 5000, step: 100, default: 2000, unit: "ms" },
    { key: "direction", label: "Direction", control: "select", options: ["up", "down"], default: "up" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "전환 애니메이션 없이 첫 번째 단어를 고정 표시한다." },
  install: { registryPath: "r/typography/rotate-words.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
