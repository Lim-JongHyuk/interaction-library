import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "tilt-card",
  category: "interaction",
  name: "Parallax Tilt Card",
  description: "포인터를 따라 3D로 기울고 레이어가 시차 이동하는 광택 카드.",
  tags: ["3d", "tilt", "parallax", "pointer", "card", "glare"],
  trigger: "hover",
  triggerNote: "카드 위 포인터 위치로 기울기·레이어 시차·광택을 실시간 계산하고, 벗어나면 스프링으로 복원한다.",
  params: [
    { key: "maxTilt", label: "Max Tilt", control: "slider", min: 4, max: 28, step: 1, default: 14, unit: "deg" },
    { key: "glare", label: "Glare", control: "toggle", default: true },
    { key: "hoverScale", label: "Hover Scale", control: "slider", min: 1, max: 1.15, step: 0.01, default: 1.05 },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "기울기·시차·광택을 끄고 정면을 향한 정적 카드로 렌더한다.",
    notes: ["장식 레이어는 aria-hidden, 카드 콘텐츠는 실제 텍스트로 유지."],
  },
  install: { registryPath: "r/interaction/tilt-card.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
