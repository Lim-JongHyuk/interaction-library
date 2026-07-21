import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "lamp-glow",
  category: "backgrounds",
  name: "Lamp Glow",
  description: "원뿔 그라디언트가 뷰포트 진입 시 좌우로 펼쳐지며 밝은 선을 만드는 램프 히어로.",
  tags: ["lamp", "glow", "hero", "conic", "mask", "premium"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 원뿔·밝은 선의 폭이 펴지고 헤드라인이 아래에서 떠오른다.",
  params: [
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "spread", label: "Spread", control: "slider", min: 16, max: 48, step: 2, default: 30, unit: "rem" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "펼침 애니메이션 없이 완전히 켜진 램프와 헤드라인을 정적으로 렌더한다.",
    notes: ["램프 리그는 장식으로 aria-hidden, 헤드라인은 실제 텍스트로 유지."],
  },
  install: { registryPath: "r/backgrounds/lamp-glow.json" },
  credits: { inspiredBy: "aceternity lamp", license: "MIT" },
  demo: { heading: "Built in the light." },
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
