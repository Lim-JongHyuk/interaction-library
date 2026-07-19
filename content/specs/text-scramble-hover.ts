import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "scramble-hover",
  category: "typography",
  name: "Scramble on Hover",
  description: "마우스를 올리면 글자가 잠깐 스크램블되었다가 원래 텍스트로 정착하는 효과.",
  tags: ["text", "hover", "scramble"],
  trigger: "hover",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 10, max: 100, step: 5, default: 30, unit: "ms" },
    {
      key: "charset",
      label: "Charset",
      control: "select",
      options: ["upper", "lower", "alnum", "binary"],
      default: "upper",
    },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "스크램블을 생략하고 hover 시에도 원래 텍스트를 그대로 표시한다." },
  install: { registryPath: "r/typography/scramble-hover.json" },
  credits: { license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
