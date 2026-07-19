import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "typewriter",
  category: "typography",
  name: "Typewriter",
  description: "한 글자씩 타이핑되는 것처럼 텍스트가 순차적으로 나타나는 효과.",
  tags: ["text", "typewriter", "reveal"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생. loop 활성화 시 반복.",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 10, max: 150, step: 5, default: 40, unit: "ms" },
    { key: "cursor", label: "Cursor", control: "toggle", default: true },
    { key: "loop", label: "Loop", control: "toggle", default: false },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "타이핑 애니메이션 없이 전체 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/typewriter.json" },
  credits: { license: "MIT" },
  demo: { text: "Building interfaces that move." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
