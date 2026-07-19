import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "fan-carousel",
  category: "carousels",
  name: "Fan Card Carousel",
  description: "손에 쥔 카드처럼 부채꼴로 펼쳐진 덱을 드래그로 돌리는 카루셀. 중앙 카드가 떠오른다.",
  tags: ["carousel", "cards", "fan", "drag", "deck", "premium"],
  trigger: "drag",
  triggerNote: "드래그로 부채를 돌리고 릴리즈하면 가장 가까운 카드에 스냅. 플릭 속도도 반영된다.",
  params: [
    { key: "spread", label: "Spread", control: "slider", min: 6, max: 24, step: 1, default: 14, unit: "°" },
    { key: "lift", label: "Active Lift", control: "slider", min: 0, max: 80, step: 4, default: 36, unit: "px" },
    { key: "radius", label: "Arc Radius", control: "slider", min: 240, max: 720, step: 20, default: 420, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "드래그를 비활성화하고 인디케이터·화살표 키로 즉시 전환한다.",
    notes: ["화살표 키 탐색과 aria-live로 활성 카드를 알린다.", "items prop으로 이미지 카드를 주입한다."],
  },
  install: { registryPath: "r/carousels/fan-carousel.json" },
  credits: { inspiredBy: "Framer marketplace 'Fan Card Carousel'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
