import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "scroll-timeline",
  category: "sections",
  name: "Scroll Timeline",
  description: "스크롤 진행도로 진행선이 차오르고 항목이 뷰포트 진입 시 드러나는 연혁 타임라인.",
  tags: ["timeline", "scroll", "changelog", "history", "progress", "reveal"],
  trigger: "scroll",
  triggerNote: "진행선은 스크롤 진행도에 스크럽되고, 각 항목은 뷰포트 진입 시 1회 페이드-슬라이드한다.",
  params: [
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "nodeSize", label: "Node Size", control: "slider", min: 10, max: 28, step: 2, default: 16, unit: "px" },
    { key: "beam", label: "Beam head", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "진행선을 가득 채운 상태로 고정하고 모든 항목을 즉시 표시한다.",
    notes: ["시맨틱 ol/li 리스트로 순서를 전달, 노드·진행선은 장식으로 aria-hidden."],
  },
  install: { registryPath: "r/sections/scroll-timeline.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
