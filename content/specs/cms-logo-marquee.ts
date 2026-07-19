import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "logo-marquee",
  category: "cms",
  name: "Logo Marquee",
  description: "드래그로 스크럽하고 관성으로 복귀하는 무한 로고 마퀴. 호버 감속과 엣지 페이드까지 갖췄다.",
  tags: ["cms", "marquee", "logos", "infinite", "drag", "premium"],
  trigger: "loop",
  triggerNote: "프레임 기반 래핑으로 이음새 없이 순환하며, 드래그 스크럽 후 관성이 감쇠하고 기본 속도로 복귀한다.",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 20, max: 160, step: 10, default: 60, unit: "px/s" },
    { key: "direction", label: "Direction", control: "select", options: ["left", "right"], default: "left" },
    { key: "hoverSlow", label: "Hover Slow", control: "slider", min: 0, max: 1, step: 0.05, default: 0.25 },
    { key: "gap", label: "Gap", control: "slider", min: 24, max: 96, step: 8, default: 48, unit: "px" },
    { key: "edgeFade", label: "Edge Fade", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "자동 스크롤을 정지하고 로고를 정적인 한 줄로 렌더링한다.",
    notes: ["두 번째 복사본은 aria-hidden으로 중복 낭독을 막는다.", "children으로 실제 로고(img/svg)를 주입한다."],
  },
  install: { registryPath: "r/cms/logo-marquee.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
