import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "floating-dock",
  category: "navigation",
  name: "Floating Dock",
  description: "마우스가 가까워질수록 아이콘이 확대되는 macOS 독 스타일 내비게이션.",
  tags: ["navigation", "dock", "hover", "magnify"],
  trigger: "hover",
  triggerNote: "커서와의 거리에 따라 아이콘 크기가 스프링으로 보간된다.",
  params: [
    { key: "magnification", label: "Magnification", control: "slider", min: 1, max: 2.5, step: 0.1, default: 1.6 },
    { key: "radius", label: "Radius", control: "slider", min: 40, max: 160, step: 5, default: 90, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "확대 애니메이션을 정지하고 모든 아이콘이 동일한 크기로 표시된다.",
    notes: ["각 아이콘에 라벨 툴팁이 hover 시 노출된다."],
  },
  install: { registryPath: "r/navigation/floating-dock.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
