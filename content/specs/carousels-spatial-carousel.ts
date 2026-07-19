import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "spatial-carousel",
  category: "carousels",
  name: "Spatial 3D Carousel",
  description: "패널들이 3D 실린더 링으로 배치되어 드래그 관성으로 회전하는 공간형 캐러셀.",
  tags: ["carousel", "3d", "spatial", "drag", "ring"],
  trigger: "drag",
  triggerNote: "드래그로 회전, 놓으면 관성 감속. 유휴 시 천천히 자동 회전.",
  params: [
    { key: "radius", label: "Ring Radius", control: "slider", min: 120, max: 360, step: 10, default: 220, unit: "px" },
    { key: "autoSpin", label: "Auto Spin", control: "toggle", default: true },
    { key: "spinSpeed", label: "Spin Speed", control: "slider", min: 1, max: 30, step: 1, default: 6, unit: "°/s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "자동 회전과 관성을 정지하고 정적인 링을 표시한다." },
  install: { registryPath: "r/carousels/spatial-carousel.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
