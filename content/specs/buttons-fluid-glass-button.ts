import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "fluid-glass-button",
  category: "buttons",
  name: "Fluid Glass Button",
  description: "은은한 테두리 글로우와 안쪽에서 반짝이는 별이 있는 글래스모피즘 버튼. 호버하면 글로우가 밝아진다.",
  tags: ["glass", "glassmorphism", "button", "ripple", "glow", "premium"],
  trigger: "hover",
  triggerNote: "기본 상태에서도 테두리가 은은하게 빛나고 안쪽 별이 제자리에서 반짝인다. 호버하면 글로우와 별이 더 밝아지고, 클릭하면 파문이 퍼진다.",
  params: [
    { key: "label", label: "Label", control: "text", default: "Click me" },
    { key: "baseColor", label: "Base Color", control: "color", default: "#050505" },
    { key: "glassColor", label: "Glass Color", control: "color", default: "#eaf2ff" },
    { key: "rimWidth", label: "Rim Width", control: "slider", min: 1, max: 6, step: 0.5, default: 2, unit: "px" },
    { key: "particles", label: "Star Particles", control: "slider", min: 0, max: 24, step: 1, default: 10 },
    { key: "radius", label: "Radius", control: "slider", min: 8, max: 999, step: 1, default: 999, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "별 반짝임을 멈추고 정적인 유리 테두리 버튼으로 렌더한다.",
    notes: [
      "href를 주면 <a>, 없으면 <button type=button>으로 렌더돼 시맨틱이 유지된다.",
      "장식 레이어는 모두 aria-hidden이며 라벨 텍스트만 접근성 트리에 노출된다.",
      "focus-visible 링을 제공해 키보드 포커스를 확인할 수 있다.",
    ],
  },
  install: { registryPath: "r/buttons/fluid-glass-button.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-27",
};
export default spec;
