import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "border-beam-button",
  category: "buttons",
  name: "Border Beam Button",
  description: "다크 글래스 필 테두리를 따라 그라디언트 빔이 흐르는 프리미엄 CTA 버튼.",
  tags: ["button", "cta", "beam", "gradient", "glass", "premium"],
  trigger: "loop",
  triggerNote: "mask-composite로 뚫은 테두리 링 안에서 코닉 그라디언트 빔이 일정 속도로 순환한다.",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 1.5, max: 10, step: 0.5, default: 4, unit: "s" },
    { key: "colorFrom", label: "Beam From", control: "color", default: "#f97316" },
    { key: "colorTo", label: "Beam To", control: "color", default: "#e11d48" },
    { key: "beamArc", label: "Beam Arc", control: "slider", min: 30, max: 140, step: 5, default: 70, unit: "°" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "빔 회전을 정지하고 정적 테두리만 렌더링한다.",
    notes: ["빔 레이어는 aria-hidden + pointer-events:none 장식이다."],
  },
  install: { registryPath: "r/buttons/border-beam-button.json" },
  credits: { inspiredBy: "magicui Border Beam", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
