import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "faq-accordion",
  category: "sections",
  name: "Searchable FAQ Accordion",
  description: "질문을 검색하고 클릭해 펼치는 스프링 애니메이션 기반 FAQ 섹션.",
  tags: ["faq", "accordion", "search", "section"],
  trigger: "click",
  triggerNote: "질문 클릭 시 펼침/접힘. 검색으로 실시간 필터링.",
  params: [
    { key: "showSearch", label: "Show Search", control: "toggle", default: true },
    { key: "allowMultipleOpen", label: "Multiple Open", control: "toggle", default: false },
    { key: "defaultOpenIndex", label: "Default Open", control: "number", min: -1, max: 10, default: 0 },
    {
      key: "animationSpeed",
      label: "Speed",
      control: "select",
      options: ["smooth", "snappy", "bouncy"],
      default: "smooth",
    },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "펼침/접힘 시 스프링 애니메이션 없이 즉시 높이가 전환된다.",
    notes: ["트리거 버튼에 aria-expanded/aria-controls, 패널에 role=region이 적용된다."],
  },
  install: { registryPath: "r/sections/faq-accordion.json" },
  credits: { author: "Jonghyuk", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
