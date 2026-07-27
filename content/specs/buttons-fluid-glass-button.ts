import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "fluid-glass-button",
  category: "buttons",
  name: "Fluid Glass Button",
  description: "유리 테두리가 유체처럼 일렁이고 커서를 따라 굴절 하이라이트가 흐르는 글래스 버튼. 클릭 시 파문이 표면을 훑는다.",
  tags: ["glass", "fluid", "button", "shader", "ripple", "glow", "premium"],
  trigger: "hover",
  triggerNote: "호버하면 난류 왜곡이 강해지며 유리판이 커서 쪽으로 기울고, 클릭하면 파문이 퍼진다. 표면에는 입자가 상시 떠다닌다.",
  params: [
    { key: "label", label: "Label", control: "text", default: "Click me" },
    { key: "baseColor", label: "Base Color", control: "color", default: "#050505" },
    { key: "glassColor", label: "Glass Color", control: "color", default: "#ffffff" },
    { key: "hoverSpeed", label: "Hover Speed", control: "slider", min: 1, max: 10, step: 1, default: 6 },
    { key: "rimWidth", label: "Rim Width", control: "slider", min: 1, max: 6, step: 0.5, default: 2, unit: "px" },
    { key: "particles", label: "Particles", control: "slider", min: 0, max: 16, step: 1, default: 7 },
    { key: "radius", label: "Radius", control: "slider", min: 8, max: 999, step: 1, default: 999, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "유체 왜곡·기울임·입자·하이라이트 추적을 모두 끄고 정적인 유리 테두리 버튼으로 렌더한다.",
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
