import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "depth-carousel",
  category: "carousels",
  name: "Depth Image Carousel",
  description: "중앙 카드를 축으로 옆 카드들이 스케일·블러·디밍으로 물러나는 초점 거리 시뮬레이션 캐러셀.",
  tags: ["carousel", "3d", "depth", "focus", "drag", "premium"],
  trigger: "drag",
  triggerNote: "드래그 거리·플릭 속도로 카드를 넘기고, 인디케이터·화살표 키로도 이동한다.",
  params: [
    { key: "spacing", label: "Spacing", control: "slider", min: 90, max: 240, step: 10, default: 150, unit: "px" },
    { key: "depthScale", label: "Depth Scale", control: "slider", min: 0.05, max: 0.25, step: 0.01, default: 0.14 },
    { key: "depthBlur", label: "Depth Blur", control: "slider", min: 0, max: 4, step: 0.2, default: 1.6, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "드래그를 비활성화하고 인디케이터·키보드로 즉시 전환한다.",
    notes: ["aria-live로 활성 카드 제목을 알린다.", "items prop으로 이미지 카드를 주입한다."],
  },
  install: { registryPath: "r/carousels/depth-carousel.json" },
  credits: { inspiredBy: "Framer marketplace 'Depth Image Carousal'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
