import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "fluid-glass-button",
  category: "buttons",
  name: "Fluid Glass Button",
  description: "빛이 버튼 안쪽에서만 도는 글래스모피즘 버튼. 커서를 따라 유체 굴절광이 흐르고 호버하면 눈처럼 알갱이가 내린다.",
  tags: ["glass", "glassmorphism", "fluid", "button", "ripple", "snow", "premium"],
  trigger: "hover",
  triggerNote: "커서 좌표를 실시간 추적해 테두리와 유리면에 굴절광이 모이고, 호버하는 동안 표면에 알갱이가 내린다. 클릭하면 파문이 퍼진다. 빛은 버튼 바깥으로 새지 않는다.",
  params: [
    { key: "label", label: "Label", control: "text", default: "Click me" },
    { key: "baseColor", label: "Base Color", control: "color", default: "#050505" },
    { key: "glassColor", label: "Glass Color", control: "color", default: "#ffffff" },
    { key: "hoverSpeed", label: "Hover Speed", control: "slider", min: 1, max: 10, step: 1, default: 6 },
    { key: "rimWidth", label: "Rim Width", control: "slider", min: 1, max: 6, step: 0.5, default: 2, unit: "px" },
    { key: "particles", label: "Snow Particles", control: "slider", min: 0, max: 30, step: 1, default: 14 },
    { key: "radius", label: "Radius", control: "slider", min: 8, max: 999, step: 1, default: 999, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "알갱이·하이라이트 추적을 모두 끄고 정적인 유리 테두리 버튼으로 렌더한다.",
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
