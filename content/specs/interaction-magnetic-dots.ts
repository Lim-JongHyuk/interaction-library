import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "magnetic-dots",
  category: "interaction",
  name: "Magnetic Dot Grid",
  description: "커서 주변의 점이 밀려나며 커지고 밝아지는 자기장 점 격자 배경.",
  tags: ["dots", "grid", "pointer", "magnetic", "background", "interactive"],
  trigger: "hover",
  triggerNote: "컨테이너 크기에 맞춰 점을 배치하고, 포인터 이동마다 각 점의 변위·스케일·밝기를 계산한다.",
  params: [
    { key: "gap", label: "Gap", control: "slider", min: 20, max: 60, step: 2, default: 34, unit: "px" },
    { key: "radius", label: "Radius", control: "slider", min: 60, max: 240, step: 10, default: 130, unit: "px" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "포인터 반응을 끄고 은은한 정적 점 격자로 렌더한다.",
    notes: ["순수 장식 배경이라 컨테이너에 aria-hidden 적용."],
  },
  install: { registryPath: "r/interaction/magnetic-dots.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
