import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "mask-hover-reveal",
  category: "utilities",
  name: "Mask Hover Reveal",
  description: "커서를 따라다니는 원형 마스크가 위 레이어를 뚫어 숨겨진 레이어를 드러내는 투-레이어 리빌.",
  tags: ["utility", "mask", "hover", "reveal", "cursor"],
  trigger: "hover",
  triggerNote: "커서 위치에 스프링으로 따라붙는 radial-gradient 마스크가 위 레이어를 투명하게 만든다.",
  params: [
    { key: "radius", label: "Radius", control: "slider", min: 50, max: 220, step: 5, default: 110, unit: "px" },
    { key: "feather", label: "Feather", control: "slider", min: 0, max: 100, step: 5, default: 40, unit: "px" },
    { key: "topLabel", label: "Top Label", control: "text", default: "Hover to see what's underneath" },
    { key: "hiddenLabel", label: "Hidden Label", control: "text", default: "THE HIDDEN LAYER" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "마스크 효과를 비활성화하고 위 레이어만 정적으로 표시한다." },
  install: { registryPath: "r/utilities/mask-hover-reveal.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
