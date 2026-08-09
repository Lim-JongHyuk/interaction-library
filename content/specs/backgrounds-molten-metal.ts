import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "molten-metal",
  category: "backgrounds",
  name: "Molten Metal",
  description: "A WebGL liquid caustic field with glowing molten-metal filaments.",
  tags: ["background", "webgl", "liquid", "metal", "caustics"],
  trigger: "loop",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 0, max: 1, step: 0.05, default: 0.35 },
    { key: "scale", label: "Scale", control: "slider", min: 1, max: 8, step: 0.25, default: 4 },
    { key: "detail", label: "Detail", control: "slider", min: 1, max: 8, step: 1, default: 3 },
    { key: "glow", label: "Glow", control: "slider", min: 0.1, max: 3, step: 0.1, default: 1.6 },
    { key: "coreSize", label: "Core Size", control: "slider", min: 0.01, max: 0.4, step: 0.01, default: 0.1 },
    { key: "swirl", label: "Swirl", control: "slider", min: 0, max: 2, step: 0.05, default: 1 },
    { key: "fold", label: "Fold", control: "slider", min: -1, max: 1, step: 0.05, default: -0.2 },
    { key: "blackPoint", label: "Black Point", control: "slider", min: 0, max: 0.5, step: 0.01, default: 0.05 },
    { key: "brightness", label: "Brightness", control: "slider", min: 0.1, max: 2, step: 0.05, default: 1.3 },
    { key: "colorMode", label: "Color Mode", control: "select", options: ["molten", "ember", "frost"], default: "molten" },
    { key: "grain", label: "Film Grain", control: "toggle", default: true },
    { key: "grainIntensity", label: "Grain Intensity", control: "slider", min: 0, max: 0.15, step: 0.005, default: 0.05 },
    { key: "mouseInteraction", label: "Mouse Interaction", control: "toggle", default: true },
    { key: "mouseStrength", label: "Mouse Strength", control: "slider", min: 0, max: 1, step: 0.05, default: 0.3 },
    { key: "opacity", label: "Opacity", control: "slider", min: 0, max: 1, step: 0.05, default: 1 },
    { key: "color1", label: "Shadow Color", control: "color", default: "#5227FF" },
    { key: "color2", label: "Filament Color", control: "color", default: "#FF9FFC" },
    { key: "color3", label: "Core Color", control: "color", default: "#FFFFFF" },
  ],
  dependencies: ["ogl"], variants: ["react-ts-tw"],
  a11y: { reducedMotion: "The molten field renders once without continuous animation when reduced motion is requested.", notes: ["The canvas is decorative and includes no focusable controls."] },
  install: { registryPath: "r/backgrounds/molten-metal.json" }, credits: { inspiredBy: "React Bits", license: "MIT" }, demo: {}, status: "stable", createdAt: "2026-08-09",
};

export default spec;
