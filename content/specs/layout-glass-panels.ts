import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "glass-panels",
  category: "layout",
  name: "Glass Panels",
  description: "컬러 필드 위에 떠 있는 글래스모피즘 패널 그룹. 커서 이동에 따라 전체가 3D로 기운다.",
  tags: ["layout", "glassmorphism", "glass", "tilt", "3d"],
  trigger: "hover",
  triggerNote: "컨테이너 안 커서 위치를 0~1로 정규화해 rotateX/rotateY로 매핑. 패널마다 translateZ 깊이가 다르다.",
  params: [
    { key: "blur", label: "Backdrop Blur", control: "slider", min: 4, max: 40, step: 2, default: 16, unit: "px" },
    { key: "tiltStrength", label: "Tilt Strength", control: "slider", min: 0, max: 20, step: 1, default: 8, unit: "deg" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "3D 틸트를 비활성화하고 패널을 평면으로 정적 표시한다." },
  install: { registryPath: "r/layout/glass-panels.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
