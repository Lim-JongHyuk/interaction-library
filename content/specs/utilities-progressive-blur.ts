import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "progressive-blur",
  category: "utilities",
  name: "Progressive Blur",
  description: "backdrop-filter 레이어 6장을 마스크 밴드로 겹쳐 만드는 iOS 스타일 그라디언트 블러.",
  tags: ["utility", "blur", "gradient", "overlay", "ios", "premium"],
  trigger: "mount",
  triggerNote: "정적 효과 — 어떤 콘텐츠 위에 얹어도 가장자리가 점진적으로 흐려진다.",
  params: [
    { key: "direction", label: "Direction", control: "select", options: ["bottom", "top", "left", "right"], default: "bottom" },
    { key: "strength", label: "Strength", control: "slider", min: 4, max: 40, step: 2, default: 16, unit: "px" },
    { key: "coverage", label: "Coverage", control: "slider", min: 20, max: 80, step: 5, default: 45, unit: "%" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "움직임이 없는 정적 시각 효과라 그대로 렌더링된다.",
    notes: ["오버레이는 pointer-events:none + aria-hidden으로 상호작용·낭독에서 제외된다.", "children으로 실제 콘텐츠를 감싼다. tint prop으로 틴트 추가 가능."],
  },
  install: { registryPath: "r/utilities/progressive-blur.json" },
  credits: { inspiredBy: "Framer marketplace 'Progressive Blur'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
