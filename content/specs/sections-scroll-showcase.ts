import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "scroll-showcase",
  category: "sections",
  name: "Scroll Showcase",
  description: "스크롤하는 동안 화면이 고정되고 스텝별 텍스트·비주얼이 크로스페이드되는 Apple 스타일 제품 쇼케이스.",
  tags: ["section", "scroll", "sticky", "showcase", "storytelling", "premium"],
  trigger: "scroll",
  triggerNote: "섹션을 통과하는 스크롤 진행도에 스텝 전환이 1:1로 스크럽된다.",
  params: [
    { key: "stepHeight", label: "Step Height", control: "slider", min: 60, max: 160, step: 10, default: 100, unit: "vh" },
    { key: "showProgress", label: "Progress Rail", control: "toggle", default: true },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스티키·스크럽을 해제하고 전체 스텝을 정적인 세로 목록으로 나열한다.",
    notes: ["items prop으로 실제 콘텐츠(제목·설명·이미지)를 주입한다. 데모는 목업 UI 카드."],
  },
  install: { registryPath: "r/sections/scroll-showcase.json" },
  credits: { inspiredBy: "Apple product pages", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
