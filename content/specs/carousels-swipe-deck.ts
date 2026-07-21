import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "swipe-deck",
  category: "carousels",
  name: "Swipe Deck",
  description: "드래그 오프셋과 릴리즈 속도로 판정하는 틴더식 스와이프 카드 덱.",
  tags: ["card", "swipe", "stack", "drag", "physics", "tinder"],
  trigger: "drag",
  triggerNote: "카드를 좌우로 드래그하거나 하단 버튼으로 넘긴다. 넘어간 카드는 덱 맨 뒤로 순환.",
  params: [
    { key: "rotation", label: "Rotation", control: "slider", min: 4, max: 24, step: 1, default: 12, unit: "deg" },
    { key: "threshold", label: "Threshold", control: "slider", min: 60, max: 200, step: 5, default: 120, unit: "px" },
    { key: "stackOffset", label: "Stack Offset", control: "slider", min: 6, max: 28, step: 1, default: 14, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "플링·스프링 없이 카드가 즉시 다음으로 교체된다.",
    notes: [
      "하단 Skip/Keep 버튼으로 드래그 없이 키보드 조작 가능.",
      "맨 위 카드에 제목·설명 aria-label, 뒤 카드는 aria-hidden.",
    ],
  },
  install: { registryPath: "r/carousels/swipe-deck.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
