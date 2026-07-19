import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "shuffle",
  category: "typography",
  name: "Shuffle Text",
  description: "글자가 무작위로 뒤섞이다가 원래 텍스트로 정착하는 효과.",
  tags: ["text", "hero", "scramble", "reveal"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생. hoverReplay로 재호버 재생 가능.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.1, max: 2, step: 0.05, default: 0.6, unit: "s" },
    { key: "stagger", label: "Stagger", control: "slider", min: 0, max: 0.2, step: 0.01, default: 0.03, unit: "s" },
    { key: "shuffleTimes", label: "Shuffles", control: "slider", min: 1, max: 10, step: 1, default: 4 },
    { key: "charset", label: "Charset", control: "select", options: ["upper", "lower", "alnum", "binary"], default: "upper" },
    { key: "hoverReplay", label: "Replay on hover", control: "toggle", default: false },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "셔플을 생략하고 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/shuffle.json" },
  credits: { inspiredBy: "reactbits.dev shuffle", license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
