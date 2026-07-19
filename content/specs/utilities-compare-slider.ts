import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "compare-slider",
  category: "utilities",
  name: "Compare Slider",
  description: "드래그·클릭·키보드로 분할선을 옮기는 Before/After 이미지 비교 슬라이더. 스프링 감쇠로 부드럽게 따라온다.",
  tags: ["utility", "image", "compare", "slider", "drag", "premium"],
  trigger: "drag",
  triggerNote: "포인터 드래그·클릭 위치·키보드(←→, Home/End)로 분할 위치를 제어한다.",
  params: [
    { key: "initial", label: "Initial Position", control: "slider", min: 0, max: 100, step: 5, default: 50, unit: "%" },
    { key: "orientation", label: "Orientation", control: "select", options: ["horizontal", "vertical"], default: "horizontal" },
    { key: "showLabels", label: "Labels", control: "toggle", default: true },
    { key: "handleColor", label: "Handle", control: "color", default: "#ffffff" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "자율 애니메이션이 없어 그대로 동작한다. 스프링 추종은 사용자 입력에만 반응한다.",
    notes: ["role=slider + aria-valuenow로 스크린리더에 현재 위치를 노출한다.", "before/after prop에 이미지 URL을 넣는다. 데모는 듀오톤 목업."],
  },
  install: { registryPath: "r/utilities/compare-slider.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
