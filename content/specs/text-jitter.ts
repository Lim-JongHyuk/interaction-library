import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "jitter",
  category: "typography",
  name: "Jitter Text",
  description: "텍스트가 미세하게 떨리며 불안정한 에너지를 표현하는 루프 효과.",
  tags: ["text", "jitter", "loop"],
  trigger: "loop",
  params: [
    { key: "duration", label: "Duration", control: "slider", min: 0.1, max: 1, step: 0.05, default: 0.3, unit: "s" },
    { key: "intensity", label: "Intensity", control: "slider", min: 0, max: 10, step: 0.5, default: 2, unit: "px" },
    { key: "rotate", label: "Rotate", control: "toggle", default: false },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "떨림 애니메이션을 정지하고 정적인 텍스트를 표시한다." },
  install: { registryPath: "r/typography/jitter.json" },
  credits: { license: "MIT" },
  demo: { text: "motionkit" },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
