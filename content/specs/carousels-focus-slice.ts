import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "focus-slice",
  category: "carousels",
  name: "Focus Slice Carousel",
  description: "호버한 슬라이스가 확장되고 나머지가 압축되는 스프링 기반 포커스 갤러리.",
  tags: ["carousel", "gallery", "expand", "hover", "accordion", "premium"],
  trigger: "hover",
  triggerNote: "호버/포커스/탭으로 활성 슬라이스가 바뀌고, autoPlay 설정 시 자동 순환한다.",
  params: [
    { key: "expand", label: "Expand Ratio", control: "slider", min: 1.5, max: 6, step: 0.1, default: 3.4 },
    { key: "gap", label: "Gap", control: "slider", min: 2, max: 24, step: 2, default: 8, unit: "px" },
    { key: "autoPlay", label: "Auto Play", control: "slider", min: 0, max: 8, step: 0.5, default: 0, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "확장 전환과 자동 순환을 정지하고 상태 변경을 즉시 반영한다.",
    notes: ["role=listbox/option과 포커스 이동으로 키보드 탐색을 지원한다.", "items prop으로 이미지·캡션을 주입한다."],
  },
  install: { registryPath: "r/carousels/focus-slice.json" },
  credits: { inspiredBy: "Framer marketplace 'Focus Slice Carousel'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
