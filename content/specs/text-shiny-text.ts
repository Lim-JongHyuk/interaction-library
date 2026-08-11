import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "shiny-text",
  category: "typography",
  name: "Shiny Text",
  description: "A moving highlight sweeps across text for a subtle metallic shine.",
  tags: ["text", "shine", "gradient", "loop"],
  trigger: "loop",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 0.5, max: 8, step: 0.1, default: 2, unit: "s" },
    { key: "delay", label: "Delay", control: "slider", min: 0, max: 5, step: 0.1, default: 0, unit: "s" },
    { key: "color", label: "Base color", control: "color", default: "#b5b5b5" },
    { key: "shineColor", label: "Shine color", control: "color", default: "#ffffff" },
    { key: "spread", label: "Gradient angle", control: "slider", min: 0, max: 180, step: 1, default: 120, unit: "°" },
    { key: "direction", label: "Direction", control: "select", options: ["left", "right"], default: "left" },
    { key: "yoyo", label: "Reverse on repeat", control: "toggle", default: false },
    { key: "pauseOnHover", label: "Pause on hover", control: "toggle", default: false },
    { key: "disabled", label: "Disable animation", control: "toggle", default: false },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "Respects reduced-motion preferences and renders static, readable text." },
  install: { registryPath: "r/typography/shiny-text.json" },
  credits: { inspiredBy: "React Bits", license: "MIT" },
  demo: { text: "Shiny Text Effect" },
  status: "stable",
  createdAt: "2026-08-10",
};

export default spec;
