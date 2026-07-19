import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "bento-grid",
  category: "layout",
  name: "Bento Grid",
  description: "타일마다 in-view 페이드인과 hover 리프트가 적용된 벤토 스타일 그리드 레이아웃.",
  tags: ["layout", "grid", "bento", "hover"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 타일이 순차 페이드인. hover 시 살짝 떠오름.",
  params: [{ key: "lift", label: "Hover Lift", control: "slider", min: 0, max: 16, step: 1, default: 6, unit: "px" }],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "페이드인/리프트 애니메이션 없이 모든 타일이 즉시 표시된다." },
  install: { registryPath: "r/layout/bento-grid.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
