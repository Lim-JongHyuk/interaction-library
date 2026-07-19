import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "sticky-stack",
  category: "sections",
  name: "Sticky Stack",
  description: "스크롤하면 다음 카드가 이전 카드를 덮으며 쌓이는 스티키 스택 섹션. 종이가 겹치는 깊이감을 낸다.",
  tags: ["section", "scroll", "sticky", "stack", "cards", "premium"],
  trigger: "scroll",
  triggerNote: "각 카드가 상단에 고정된 채 다음 카드에 덮이며 스케일·밝기가 줄어든다.",
  params: [
    { key: "shrinkTo", label: "Shrink To", control: "slider", min: 0.8, max: 0.98, step: 0.01, default: 0.92 },
    { key: "stickyTop", label: "Sticky Top", control: "slider", min: 4, max: 24, step: 2, default: 12, unit: "vh" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스티키·스케일 전환 없이 카드를 일반 세로 목록으로 나열한다.",
    notes: ["items prop으로 제목·본문·이미지를 주입한다."],
  },
  install: { registryPath: "r/sections/sticky-stack.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
