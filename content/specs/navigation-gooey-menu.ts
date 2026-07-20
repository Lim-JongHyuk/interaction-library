import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "gooey-menu",
  category: "navigation",
  name: "Gooey Menu",
  description: "SVG goo 필터로 블롭이 젤리처럼 붙었다 떨어지며 퍼지는 FAB 메뉴.",
  tags: ["menu", "fab", "gooey", "svg-filter", "navigation"],
  trigger: "click",
  triggerNote: "+ 버튼 클릭 시 아이템이 스프링으로 퍼지고, 다시 클릭하면 역순으로 흡수된다.",
  params: [
    { key: "spread", label: "Spread", control: "slider", min: 80, max: 200, step: 5, default: 130, unit: "px" },
    { key: "stagger", label: "Stagger", control: "slider", min: 0, max: 0.1, step: 0.01, default: 0.04, unit: "s" },
    { key: "color", label: "Color", control: "color", default: "#6366f1" },
    {
      key: "direction",
      label: "Direction",
      control: "select",
      options: ["radial", "vertical"],
      default: "radial",
    },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스프링·지연 없이 아이템이 즉시 나타나고 사라진다.",
    notes: [
      "토글 버튼에 aria-expanded, 각 아이템에 aria-label 적용.",
      "닫힌 상태의 아이템은 tabIndex=-1로 포커스 순서에서 제외된다.",
    ],
  },
  install: { registryPath: "r/navigation/gooey-menu.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
