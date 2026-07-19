import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "shutter-reveal",
  category: "interaction",
  name: "Camera Shutter Reveal",
  description: "카메라 조리개 블레이드가 회전하며 열려 콘텐츠를 드러내는 시네마틱 리빌.",
  tags: ["reveal", "camera", "shutter", "iris", "cinematic"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 블레이드가 순차적으로 열린다.",
  params: [
    { key: "bladeCount", label: "Blades", control: "slider", min: 5, max: 12, step: 1, default: 8 },
    { key: "duration", label: "Duration", control: "slider", min: 0.4, max: 2.5, step: 0.05, default: 1.1, unit: "s" },
    { key: "delay", label: "Delay", control: "slider", min: 0, max: 1.5, step: 0.05, default: 0.2, unit: "s" },
    { key: "bladeColor", label: "Blade Color", control: "color", default: "#111113" },
    { key: "label", label: "Label", control: "text", default: "SHUTTER" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "블레이드를 렌더링하지 않고 콘텐츠를 즉시 표시한다." },
  install: { registryPath: "r/interaction/shutter-reveal.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
