import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "morph-navbar",
  category: "navigation",
  name: "Morph Navbar",
  description: "스크롤하면 글래스 필로 수축하고 활성 링크 필이 미끄러지는 모던 내비게이션 바.",
  tags: ["navigation", "navbar", "glass", "scroll", "pill", "premium"],
  trigger: "scroll",
  triggerNote: "스크롤 40px를 넘으면 컴팩트 필로 수축하고, 링크 클릭 시 활성 필이 layout 애니메이션으로 이동한다.",
  params: [
    { key: "links", label: "Links (, 구분)", control: "text", default: "Home, Work, About, Contact" },
    { key: "brand", label: "Brand", control: "text", default: "Studio®" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "shrinkOnScroll", label: "Shrink on Scroll", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "수축·필 이동 애니메이션을 즉시 전환으로 대체한다.",
    notes: ["aria-current=page로 활성 링크를 표시한다."],
  },
  install: { registryPath: "r/navigation/morph-navbar.json" },
  credits: { inspiredBy: "Framer marketplace 'Modern Navbar'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
