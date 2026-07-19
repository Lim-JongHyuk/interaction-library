import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "magnetic-chars",
  category: "typography",
  name: "Magnetic Characters",
  description: "마우스 포인터 근처의 글자들이 자석처럼 끌려오는 효과.",
  tags: ["text", "hover", "pointer", "magnetic"],
  trigger: "hover",
  triggerNote: "마우스 포인터 위치를 추적. 터치/모바일에서는 비활성화.",
  params: [
    { key: "strength", label: "Strength", control: "slider", min: 0, max: 1, step: 0.05, default: 0.4 },
    { key: "radius", label: "Radius", control: "slider", min: 20, max: 150, step: 5, default: 60, unit: "px" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "포인터 추적 애니메이션을 비활성화하고 정적인 텍스트를 표시한다." },
  install: { registryPath: "r/typography/magnetic-chars.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
