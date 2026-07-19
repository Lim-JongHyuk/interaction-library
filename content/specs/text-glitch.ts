import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "glitch",
  category: "typography",
  name: "Glitch Text",
  description: "RGB 색수차와 미세한 흔들림으로 디지털 글리치를 표현하는 루프 효과.",
  tags: ["text", "glitch", "loop"],
  trigger: "loop",
  params: [
    { key: "intensity", label: "Intensity", control: "slider", min: 0, max: 8, step: 0.5, default: 3, unit: "px" },
    { key: "interval", label: "Interval", control: "slider", min: 500, max: 5000, step: 100, default: 2000, unit: "ms" },
    { key: "rgbSplit", label: "RGB Split", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "글리치 애니메이션을 정지하고 정적인 텍스트를 표시한다.",
    notes: ["빈도와 강도를 낮게 유지해 광과민성 발작 유발 가능성을 배제한다."],
  },
  install: { registryPath: "r/typography/glitch.json" },
  credits: { license: "MIT" },
  demo: { text: "motionkit" },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
