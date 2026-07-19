import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "coverflow-carousel",
  category: "carousels",
  name: "Coverflow Carousel",
  description: "3D 원근감으로 카드가 좌우로 회전하며 배치되는 커버플로우 캐러셀.",
  tags: ["carousel", "3d", "coverflow", "slider"],
  trigger: "click",
  triggerNote: "화살표/도트 클릭으로 전환. 각 카드는 spring으로 위치·각도가 보간된다.",
  params: [{ key: "perspective", label: "Perspective", control: "slider", min: 400, max: 1600, step: 50, default: 900, unit: "px" }],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "3D 회전 없이 평면적으로 카드가 전환된다." },
  install: { registryPath: "r/carousels/coverflow-carousel.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
