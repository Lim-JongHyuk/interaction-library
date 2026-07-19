import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "iridescent-logo-3d",
  category: "interaction",
  name: "Iridescent Logo 3D",
  description: "SVG 로고를 압출해 만든 무지갯빛 3D 오브젝트. 드래그로 자유롭게 회전.",
  tags: ["3d", "logo", "webgl", "drag", "material"],
  trigger: "drag",
  triggerNote: "기본 자동 흔들림 회전. 드래그로 관성 있게 자유 회전 가능.",
  params: [
    {
      key: "preset",
      label: "Material",
      control: "select",
      options: ["opal", "prism", "pearl", "titanium", "obsidian", "roseGold"],
      default: "opal",
    },
    {
      key: "colorMode",
      label: "Colors",
      control: "select",
      options: ["chromatic", "original"],
      default: "chromatic",
    },
    { key: "depth", label: "Depth", control: "slider", min: 0.05, max: 0.6, step: 0.01, default: 0.28 },
    { key: "autoRotate", label: "Auto Rotate", control: "toggle", default: true },
    { key: "autoRotateSpeed", label: "Rotate Speed", control: "slider", min: 0.1, max: 2, step: 0.05, default: 0.6 },
    { key: "enableDrag", label: "Drag", control: "toggle", default: true },
  ],
  dependencies: ["three"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "자동 회전을 정지하고 마지막 각도에서 정적인 3D 오브젝트를 표시한다.",
    notes: ["WebGL 렌더링 — GPU 미지원 환경에서는 로딩 상태로 유지될 수 있다."],
  },
  install: { registryPath: "r/interaction/iridescent-logo-3d.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
