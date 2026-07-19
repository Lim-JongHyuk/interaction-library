import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "shatter-logo",
  category: "interaction",
  name: "Shatter Glass Logo",
  description: "클릭하면 로고가 유리 파편처럼 산산조각 났다가 다시 조립되는 효과.",
  tags: ["shatter", "glass", "logo", "click", "shards"],
  trigger: "click",
  triggerNote: "클릭 토글. 파편은 지터 그리드 폴리곤(clip-path)이라 흩어지기 전에는 빈틈이 없다.",
  params: [
    { key: "label", label: "Label", control: "text", default: "MK" },
    { key: "shardCount", label: "Shards", control: "slider", min: 6, max: 24, step: 1, default: 12 },
    { key: "force", label: "Force", control: "slider", min: 40, max: 300, step: 10, default: 120, unit: "px" },
    { key: "duration", label: "Duration", control: "slider", min: 0.3, max: 1.5, step: 0.05, default: 0.7, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "파편 애니메이션 없이 온전한 로고를 정적으로 표시한다." },
  install: { registryPath: "r/interaction/shatter-logo.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
