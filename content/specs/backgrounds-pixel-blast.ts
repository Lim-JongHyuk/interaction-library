import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "pixel-blast", category: "backgrounds", name: "Pixel Blast",
  description: "클릭 리플과 액체 왜곡을 지원하는 인터랙티브 디더 픽셀 배경.",
  tags: ["background", "webgl", "pixel", "interactive", "ripple"], trigger: "click",
  params: [
    { key: "variant", label: "Pixel shape", control: "select", options: ["square", "circle", "triangle", "diamond"], default: "circle" },
    { key: "pixelSize", label: "Pixel size", control: "slider", min: 2, max: 16, step: 1, default: 6 },
    { key: "color", label: "Color", control: "color", default: "#b497cf" },
    { key: "patternScale", label: "Pattern scale", control: "slider", min: 1, max: 8, step: 0.1, default: 3 },
    { key: "patternDensity", label: "Density", control: "slider", min: 0.2, max: 2, step: 0.1, default: 1.2 },
    { key: "enableRipples", label: "Click ripples", control: "toggle", default: true },
    { key: "speed", label: "Speed", control: "slider", min: 0, max: 2, step: 0.1, default: 0.6 },
  ],
  dependencies: ["three"], variants: ["react-ts-tw"],
  a11y: { reducedMotion: "사용자의 모션 감소 설정에서는 정적 프레임만 표시합니다." }, install: { registryPath: "r/backgrounds/pixel-blast.json" }, credits: { license: "MIT" }, demo: {}, status: "stable", createdAt: "2026-08-09",
};
export default spec;
