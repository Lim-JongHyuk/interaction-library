import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "cube-gallery",
  category: "interaction",
  name: "Cube Gallery",
  description: "6면 전체가 이미지 그리드인 3D 큐브 갤러리. 자유 드래그 회전, 관성, 자동 회전, 호버 포커스를 지원한다.",
  tags: ["3d", "gallery", "cube", "drag", "grid", "photos", "hover", "auto-rotate"],
  trigger: "drag",
  triggerNote: "드래그로 관성과 함께 자유롭게 회전. 놓으면 감쇠 후 유휴 자동 회전으로 이어지고, 타일에 호버하면 나머지가 어두워지며 큐브가 살짝 커진다. 방향키로도 조작 가능.",
  params: [
    { key: "gridSize", label: "Grid Size", control: "slider", min: 1, max: 3, step: 1, default: 3 },
    { key: "size", label: "Cube Size", control: "slider", min: 140, max: 340, step: 10, default: 220, unit: "px" },
    { key: "perspective", label: "Perspective", control: "slider", min: 600, max: 1800, step: 50, default: 1100, unit: "px" },
    { key: "autoRotateSpeed", label: "Auto Rotate", control: "slider", min: 0, max: 30, step: 1, default: 9, unit: "°/s" },
    { key: "hoverScale", label: "Hover Scale", control: "slider", min: 1, max: 1.2, step: 0.01, default: 1.05 },
    { key: "background", label: "Background", control: "color", default: "#04060a" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "자동 회전과 드래그 관성, 호버 확대 트랜지션을 모두 끄고 고정된 자세로 정적 렌더한다.",
    notes: [
      "role=group과 aria-label로 큐브 구성(그리드 크기·이미지 수)을 스크린리더에 요약 제공.",
      "reduced-motion에서도 방향키(←→↑↓)로 회전 조작이 가능해 드래그를 대체한다.",
      "이미지에 alt를 지정하면 각 타일에 그대로 노출된다.",
    ],
  },
  install: { registryPath: "r/interaction/cube-gallery.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-27",
};
export default spec;
