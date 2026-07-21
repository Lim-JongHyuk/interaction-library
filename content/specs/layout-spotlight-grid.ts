import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "spotlight-grid",
  category: "layout",
  name: "Spotlight Card Grid",
  description: "커서를 따라다니는 공용 스포트라이트와 테두리 리빌을 공유하는 기능 카드 그리드.",
  tags: ["spotlight", "grid", "card", "mask-composite", "hover", "border"],
  trigger: "hover",
  triggerNote: "컨테이너 포인터의 로컬 좌표를 CSS 변수로 각 카드에 주입해 스포트라이트·테두리를 그린다.",
  params: [
    { key: "size", label: "Spotlight Size", control: "slider", min: 120, max: 420, step: 20, default: 260, unit: "px" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "border", label: "Border reveal", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스포트라이트·테두리 리빌을 끄고 정적 카드 그리드로 렌더한다.",
    notes: ["카드는 시맨틱 article, 아이콘·하이라이트는 장식으로 aria-hidden."],
  },
  install: { registryPath: "r/layout/spotlight-grid.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
