import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "magnetic-button",
  category: "buttons",
  name: "Magnetic Button",
  description: "커서를 따라 살짝 끌려오고 클릭 시 리플이 퍼지는 자석 버튼.",
  tags: ["button", "magnetic", "hover", "ripple"],
  trigger: "hover",
  triggerNote: "마우스가 근처에 있을 때 스프링으로 따라오며, 클릭 시 리플 재생.",
  params: [
    { key: "strength", label: "Strength", control: "slider", min: 0.1, max: 1, step: 0.05, default: 0.4 },
    { key: "rounded", label: "Corner Radius", control: "slider", min: 0, max: 999, step: 1, default: 999, unit: "px" },
    { key: "variant", label: "Variant", control: "select", options: ["solid", "outline"], default: "solid" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "포인터 추적과 리플 애니메이션 없이 정적인 버튼으로 표시된다." },
  install: { registryPath: "r/buttons/magnetic-button.json" },
  credits: { license: "MIT" },
  demo: { label: "Get started" },
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
