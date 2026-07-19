import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "wave",
  category: "typography",
  name: "Wave Text",
  description: "글자들이 순차적으로 위아래로 출렁이며 파도치는 루프 효과.",
  tags: ["text", "wave", "loop"],
  trigger: "loop",
  params: [
    { key: "amplitude", label: "Amplitude", control: "slider", min: 0, max: 30, step: 1, default: 8, unit: "px" },
    { key: "speed", label: "Speed", control: "slider", min: 0.3, max: 3, step: 0.1, default: 1.2, unit: "s" },
    { key: "stagger", label: "Stagger", control: "slider", min: 0, max: 0.2, step: 0.01, default: 0.05, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "출렁임 애니메이션을 정지하고 정적인 텍스트를 표시한다." },
  install: { registryPath: "r/typography/wave.json" },
  credits: { license: "MIT" },
  demo: { text: "motionkit" },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
