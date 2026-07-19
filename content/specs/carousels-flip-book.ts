import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "flip-book",
  category: "carousels",
  name: "3D Flip Book",
  description: "책등을 축으로 낱장이 실제 3D로 넘어가는 인터랙티브 플립북.",
  tags: ["carousel", "book", "3d", "flip", "page"],
  trigger: "click",
  triggerNote: "오른쪽 페이지 클릭 = 앞으로, 왼쪽(넘어간) 페이지 클릭 = 뒤로. 하단 버튼도 지원.",
  params: [
    { key: "perspective", label: "Perspective", control: "slider", min: 500, max: 2500, step: 100, default: 1200, unit: "px" },
    { key: "flipDuration", label: "Flip Duration", control: "slider", min: 0.3, max: 1.6, step: 0.05, default: 0.8, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "3D 회전 없이 페이지가 즉시 전환되며, 버튼으로 항상 조작 가능하다." },
  install: { registryPath: "r/carousels/flip-book.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
