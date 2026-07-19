import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "panorama-carousel",
  category: "carousels",
  name: "Panorama 3D Carousel",
  description: "뷰어가 원통 안에 서 있는 듯한 콘케이브 3D 파노라마. 카드 벽이 주변을 감싸며 돌아간다.",
  tags: ["carousel", "3d", "panorama", "immersive", "drag", "premium"],
  trigger: "drag",
  triggerNote: "드래그로 원통을 돌리고 릴리즈하면 관성 감속 후 자동 회전으로 복귀한다.",
  params: [
    { key: "radius", label: "Radius", control: "slider", min: 400, max: 1000, step: 20, default: 640, unit: "px" },
    { key: "spinSpeed", label: "Spin Speed", control: "slider", min: 0, max: 16, step: 1, default: 4, unit: "°/s" },
    { key: "step", label: "Card Angle", control: "slider", min: 14, max: 36, step: 2, default: 22, unit: "°" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "자동 회전·관성을 정지하고 정적인 곡면 벽로 렌더링한다. 드래그는 여전히 동작한다.",
    notes: ["perspective를 radius보다 작게 둬 카메라가 원통 내부에 위치하는 것이 핵심이다.", "items prop으로 이미지 카드를 주입한다."],
  },
  install: { registryPath: "r/carousels/panorama-carousel.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
