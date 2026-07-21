import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "text-pressure",
  category: "typography",
  name: "Text Pressure",
  description: "커서에 가까울수록 글자가 굵고 크게 부풀어 오르는 가변 압력 타이포그래피.",
  tags: ["text", "variable", "pointer", "weight", "hero", "interactive"],
  trigger: "hover",
  triggerNote: "각 글자 중심과 포인터의 거리로 font-weight·scale·색을 rAF 루프에서 실시간 계산한다.",
  params: [
    { key: "radius", label: "Radius", control: "slider", min: 80, max: 320, step: 10, default: 180, unit: "px" },
    { key: "strength", label: "Strength", control: "slider", min: 0.2, max: 2, step: 0.1, default: 1 },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "포인터 반응을 끄고 고정 굵기의 정적 텍스트로 렌더한다.",
    notes: ["문단에 aria-label로 원본 텍스트 제공, 개별 글자는 aria-hidden."],
  },
  install: { registryPath: "r/typography/text-pressure.json" },
  credits: { inspiredBy: "reactbits.dev text pressure", license: "MIT" },
  demo: { text: "PRESSURE" },
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
