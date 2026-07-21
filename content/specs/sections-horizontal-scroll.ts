import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "horizontal-scroll",
  category: "sections",
  name: "Horizontal Scroll Gallery",
  description: "세로 스크롤을 가로 패널 이동으로 변환하는 스크롤-스크럽 쇼케이스 섹션.",
  tags: ["scroll", "horizontal", "scroll-scrub", "gallery", "showcase", "sticky"],
  trigger: "scroll",
  triggerNote: "sticky 뷰포트에서 트랙 폭을 측정해 스크롤 진행도로 정확히 가로 이동한다.",
  params: [
    { key: "gap", label: "Gap", control: "slider", min: 8, max: 48, step: 2, default: 20, unit: "px" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "showProgress", label: "Progress bar", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스크럽을 끄고 좌우로 스크롤되는 일반 가로 스크롤 목록으로 렌더한다.",
    notes: ["섹션에 라벨 제공, 패널은 시맨틱 article로 구성."],
  },
  install: { registryPath: "r/sections/horizontal-scroll.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
