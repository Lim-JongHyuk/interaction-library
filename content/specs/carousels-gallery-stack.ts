import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "gallery-stack",
  category: "carousels",
  name: "Gallery Stack",
  description: "맨 위 카드를 드래그해 넘기면 스택 맨 뒤로 순환하는 갤러리 카드 덱.",
  tags: ["carousel", "stack", "cards", "drag", "deck", "premium"],
  trigger: "drag",
  triggerNote: "임계값 이상 드래그하거나 빠르게 플릭하면 다음 카드로 넘어간다. 버튼·화살표 키도 지원.",
  params: [
    { key: "offset", label: "Stack Offset", control: "slider", min: 6, max: 32, step: 2, default: 16, unit: "px" },
    { key: "scaleStep", label: "Scale Step", control: "slider", min: 0, max: 0.12, step: 0.01, default: 0.05 },
    { key: "threshold", label: "Threshold", control: "slider", min: 50, max: 200, step: 10, default: 110, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "드래그를 비활성화하고 버튼/키보드 내비게이션으로만 즉시 전환한다.",
    notes: ["화살표 키와 이전/다음 버튼으로 포인터 없이도 조작 가능하다.", "items prop으로 이미지 카드들을 주입한다."],
  },
  install: { registryPath: "r/carousels/gallery-stack.json" },
  credits: { inspiredBy: "Framer marketplace 'GalleryStack' / 'Stacked Flow'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
