import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "ripple-distortion",
  category: "interaction",
  name: "Ripple Distortion",
  description: "Pointer movement creates soft, refractive ripples across a cover-fitted image.",
  tags: ["ripple", "image", "webgl", "distortion", "cursor"],
  trigger: "hover",
  triggerNote: "Move the pointer across the image to leave expanding, fading waves behind.",
  params: [
    { key: "brushSize", label: "Brush Size", control: "slider", min: 40, max: 300, step: 10, default: 150, unit: "px" },
    { key: "strength", label: "Strength", control: "slider", min: 0, max: 0.6, step: 0.05, default: 0.2 },
    { key: "swirl", label: "Swirl", control: "slider", min: 0, max: 3, step: 0.25, default: 1 },
    { key: "rings", label: "Rings", control: "slider", min: 0, max: 8, step: 1, default: 4 },
    { key: "spread", label: "Spread", control: "slider", min: 1, max: 10, step: 0.5, default: 5 },
    { key: "fade", label: "Fade", control: "slider", min: 0.5, max: 6, step: 0.25, default: 3, unit: "s" },
    { key: "grayscale", label: "Grayscale", control: "toggle", default: true },
    { key: "tint", label: "Tint", control: "color", default: "#a855f7" },
    { key: "glint", label: "Glint", control: "slider", min: 0, max: 1, step: 0.1, default: 0 },
    { key: "quality", label: "Quality", control: "select", options: ["low", "medium", "high"], default: "low" },
  ],
  dependencies: ["ogl"], variants: ["react-ts-tw"],
  a11y: { reducedMotion: "When reduced motion is requested, the image remains static and pointer ripples are disabled.", notes: ["The visual is decorative; provide nearby text if it carries essential content."] },
  install: { registryPath: "r/interaction/ripple-distortion.json" }, credits: { inspiredBy: "React Bits", license: "MIT" }, demo: {}, status: "stable", createdAt: "2026-08-09",
};
export default spec;
