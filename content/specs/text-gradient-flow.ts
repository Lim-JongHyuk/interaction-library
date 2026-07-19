import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "gradient-flow",
  category: "typography",
  name: "Animated Gradient",
  description: "그라디언트가 텍스트 위를 흐르듯 반복해서 움직이는 배경 효과.",
  tags: ["text", "gradient", "loop"],
  trigger: "loop",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 1, max: 10, step: 0.5, default: 4, unit: "s" },
    {
      key: "preset",
      label: "Preset",
      control: "select",
      options: ["indigo", "sunset", "ocean", "mono"],
      default: "indigo",
    },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "그라디언트 이동 애니메이션을 정지하고 정적인 그라디언트를 표시한다." },
  install: { registryPath: "r/typography/gradient-flow.json" },
  credits: { license: "MIT" },
  demo: { text: "motionkit" },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
