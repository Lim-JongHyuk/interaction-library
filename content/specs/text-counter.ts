import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "counter",
  category: "typography",
  name: "Count Up",
  description: "숫자가 스프링성 이징으로 목표 값까지 올라가는 카운트업 효과.",
  tags: ["text", "number", "counter"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "from", label: "From", control: "number", default: 0 },
    { key: "to", label: "To", control: "number", default: 12480 },
    { key: "duration", label: "Duration", control: "slider", min: 0.3, max: 3, step: 0.1, default: 1.2, unit: "s" },
    { key: "decimals", label: "Decimals", control: "number", min: 0, max: 4, default: 0 },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "카운트업 애니메이션 없이 최종 숫자를 즉시 표시한다." },
  install: { registryPath: "r/typography/counter.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
