import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "floating-label-input",
  category: "forms",
  name: "Floating Label Input",
  description: "포커스 시 라벨이 스프링으로 위로 떠오르는 입력 필드.",
  tags: ["form", "input", "label", "focus"],
  trigger: "click",
  triggerNote: "포커스/입력 시 라벨이 축소되며 위로 이동.",
  params: [
    { key: "label", label: "Label", control: "text", default: "Email address" },
    { key: "helperText", label: "Helper Text", control: "text", default: "We'll never share your email." },
    { key: "required", label: "Required", control: "toggle", default: false },
    { key: "type", label: "Type", control: "select", options: ["text", "email", "password"], default: "text" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "라벨 이동에 스프링 대신 즉시 전환되는 애니메이션이 적용된다." },
  install: { registryPath: "r/forms/floating-label-input.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
