import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "animated-tag-list",
  category: "cms",
  name: "Animated Tag List",
  description: "선택된 태그 필터 뒤로 알약 배경이 부드럽게 이동하는 CMS 콘텐츠 필터 목록.",
  tags: ["cms", "filter", "tags", "layout-animation"],
  trigger: "click",
  triggerNote: "태그 클릭 시 layoutId 기반으로 배경 알약이 이동하고 목록이 재정렬된다.",
  params: [],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "알약 이동 스프링 애니메이션 없이 즉시 전환된다." },
  install: { registryPath: "r/cms/animated-tag-list.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
