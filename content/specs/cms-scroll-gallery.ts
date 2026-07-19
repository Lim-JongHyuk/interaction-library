import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "scroll-gallery",
  category: "cms",
  name: "Scroll Gallery",
  description: "세로 스크롤을 가로 이동으로 바꾸는 스티키 스크롤 갤러리. 포트폴리오 쇼케이스의 단골 패턴.",
  tags: ["cms", "gallery", "scroll", "horizontal", "sticky", "premium"],
  trigger: "scroll",
  triggerNote: "섹션을 지나는 동안 화면이 고정되고 스크롤 진행도에 맞춰 트랙이 수평으로 스크럽된다.",
  params: [
    { key: "scrollLength", label: "Scroll Length", control: "slider", min: 150, max: 500, step: 25, default: 250, unit: "vh" },
    { key: "gap", label: "Gap", control: "slider", min: 12, max: 48, step: 4, default: 24, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스티키·스크럽을 해제하고 일반 가로 스크롤 목록으로 렌더링한다.",
    notes: ["items prop으로 이미지·캡션을 주입한다."],
  },
  install: { registryPath: "r/cms/scroll-gallery.json" },
  credits: { inspiredBy: "Framer marketplace 'CMS Scroll Gallery'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
