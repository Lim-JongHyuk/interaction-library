import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "spiral-slider",
  category: "carousels",
  name: "Spiral 3D Slider",
  description: "카드들이 나선 계단처럼 감아 올라가는 3D 스파이럴. 드래그하면 나선 전체가 회전·하강한다.",
  tags: ["carousel", "3d", "spiral", "helix", "drag", "premium"],
  trigger: "drag",
  triggerNote: "드래그로 나선을 돌리고 릴리즈하면 관성 감속 후 가장 가까운 카드에 스냅한다.",
  params: [
    { key: "radius", label: "Radius", control: "slider", min: 160, max: 400, step: 10, default: 260, unit: "px" },
    { key: "step", label: "Step Angle", control: "slider", min: 25, max: 70, step: 5, default: 45, unit: "°" },
    { key: "rise", label: "Rise", control: "slider", min: 0, max: 90, step: 2, default: 46, unit: "px" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "관성·스냅 애니메이션을 정지하고 정적 나선으로 렌더링한다. 드래그는 여전히 동작한다.",
    notes: ["items prop으로 이미지 카드를 주입한다."],
  },
  install: { registryPath: "r/carousels/spiral-slider.json" },
  credits: { inspiredBy: "Framer marketplace 'Spiral 3D Slider'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
