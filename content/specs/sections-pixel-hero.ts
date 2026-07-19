import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "pixel-hero",
  category: "sections",
  name: "Pixel Hero",
  description: "콘텐츠를 덮은 픽셀 그리드가 무작위 순서로 디졸브되며 히어로를 드러내는 리빌 섹션.",
  tags: ["hero", "pixel", "reveal", "dissolve", "section"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생. 캔버스 클릭으로 리플레이.",
  params: [
    { key: "pixelSize", label: "Pixel Size", control: "slider", min: 14, max: 60, step: 2, default: 28, unit: "px" },
    { key: "duration", label: "Duration", control: "slider", min: 0.5, max: 3, step: 0.1, default: 1.4, unit: "s" },
    { key: "color", label: "Pixel Color", control: "color", default: "#4f46e5" },
    { key: "title", label: "Title", control: "text", default: "Pixels, dissolved." },
    { key: "subtitle", label: "Subtitle", control: "text", default: "A hero that de-materializes into view." },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "픽셀 오버레이를 렌더링하지 않고 콘텐츠를 즉시 표시한다.",
    notes: ["픽셀 셀 수는 성능을 위해 내부 상한(약 500개)이 있다."],
  },
  install: { registryPath: "r/sections/pixel-hero.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
