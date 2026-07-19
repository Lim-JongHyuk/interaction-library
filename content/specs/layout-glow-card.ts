import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "glow-card",
  category: "layout",
  name: "Glow Card",
  description: "커서를 따라 테두리가 발광하는 다크 글래스 카드. 프리미엄 다크 UI의 표준 패턴.",
  tags: ["layout", "card", "glow", "glass", "cursor", "premium"],
  trigger: "hover",
  triggerNote: "커서 위치를 CSS 변수로 추적해 radial-gradient 글로우가 테두리 링을 따라온다.",
  params: [
    { key: "glowColor", label: "Glow Color", control: "color", default: "#818cf8" },
    { key: "glowRadius", label: "Glow Radius", control: "slider", min: 80, max: 360, step: 20, default: 180, unit: "px" },
    { key: "borderWidth", label: "Border", control: "slider", min: 1, max: 3, step: 0.5, default: 1, unit: "px" },
    { key: "innerGlow", label: "Inner Glow", control: "toggle", default: true },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "글로우는 커서에만 반응하는 정적 효과라 그대로 동작한다.",
    notes: ["글로우 레이어는 aria-hidden + pointer-events:none 장식이다.", "children으로 실제 카드 콘텐츠를 주입한다."],
  },
  install: { registryPath: "r/layout/glow-card.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
