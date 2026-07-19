import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "velocity-marquee",
  category: "typography",
  name: "Velocity Marquee",
  description: "스크롤 속도에 반응해 빨라지고 기울어지는 대형 디스플레이 마퀴. 방향도 스크롤을 따라 뒤집힌다.",
  tags: ["text", "marquee", "scroll", "velocity", "display", "premium"],
  trigger: "scroll",
  triggerNote: "스크롤 속도를 스프링으로 부드럽게 추적해 이동 속도·skew·진행 방향에 반영한다.",
  params: [
    { key: "textA", label: "Line A", control: "text", default: "MOTION DESIGN —" },
    { key: "textB", label: "Line B", control: "text", default: "MADE TO SELL —" },
    { key: "baseSpeed", label: "Base Speed", control: "slider", min: 20, max: 200, step: 10, default: 80, unit: "px/s" },
    { key: "velocityBoost", label: "Velocity Boost", control: "slider", min: 0, max: 4, step: 0.2, default: 1.6 },
    { key: "skewMax", label: "Max Skew", control: "slider", min: 0, max: 14, step: 1, default: 6, unit: "°" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "마퀴·skew를 정지하고 두 줄의 정적 텍스트로 렌더링한다.",
    notes: ["반복 복사본은 aria-hidden으로 중복 낭독을 막는다."],
  },
  install: { registryPath: "r/typography/velocity-marquee.json" },
  credits: { inspiredBy: "framer-motion scroll-velocity example", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
