import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "text-path-hint",
  category: "typography",
  name: "Char Stagger Hero",
  description: "글자 단위 스태거와 이징을 조합한 홈 히어로용 등장 효과.",
  tags: ["text", "hero", "stagger", "reveal"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.1, max: 1.2, step: 0.05, default: 0.6, unit: "s" },
    { key: "stagger", label: "Stagger", control: "slider", min: 0, max: 0.1, step: 0.005, default: 0.02, unit: "s" },
    {
      key: "ease",
      label: "Ease",
      control: "select",
      options: ["easeOut", "easeIn", "easeInOut", "backOut"],
      default: "easeOut",
    },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "글자별 애니메이션 없이 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/typography/text-path-hint.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
