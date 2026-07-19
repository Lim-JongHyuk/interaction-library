import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "cursor-spotlight",
  category: "utilities",
  name: "Cursor Spotlight",
  description: "커서를 따라다니는 원형 스포트라이트로 어두운 카드를 밝히는 유틸리티.",
  tags: ["utility", "spotlight", "hover", "cursor"],
  trigger: "hover",
  params: [
    { key: "radius", label: "Radius", control: "slider", min: 80, max: 400, step: 10, default: 220, unit: "px" },
    { key: "color", label: "Color", control: "color", default: "#818cf8" },
    { key: "text", label: "Text", control: "text", default: "Hover to reveal the spotlight." },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "스포트라이트 효과가 비활성화되고 정적인 카드로 표시된다." },
  install: { registryPath: "r/utilities/cursor-spotlight.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
