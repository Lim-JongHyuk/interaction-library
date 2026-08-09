import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "pixel-snow", category: "backgrounds", name: "Pixel Snow", description: "A ray-marched pixel snow field with depth-aware flakes and wind direction.", tags: ["background", "snow", "pixel", "webgl", "three", "winter"], trigger: "loop",
  params: [
    { key: "color", label: "Snow Color", control: "color", default: "#ffffff" }, { key: "flakeSize", label: "Flake Size", control: "slider", min: 0.001, max: 0.08, step: 0.001, default: 0.01 }, { key: "minFlakeSize", label: "Minimum Flake Size", control: "slider", min: 0.25, max: 3, step: 0.05, default: 1.25 }, { key: "pixelResolution", label: "Pixel Resolution", control: "slider", min: 80, max: 400, step: 10, default: 200 }, { key: "speed", label: "Speed", control: "slider", min: 0, max: 3, step: 0.05, default: 1.25 }, { key: "depthFade", label: "Depth Fade", control: "slider", min: 1, max: 20, step: 0.5, default: 8 }, { key: "farPlane", label: "Far Plane", control: "slider", min: 4, max: 32, step: 1, default: 20 }, { key: "brightness", label: "Brightness", control: "slider", min: 0.1, max: 2, step: 0.05, default: 1 }, { key: "gamma", label: "Gamma", control: "slider", min: 0.1, max: 1.5, step: 0.05, default: 0.4545 }, { key: "density", label: "Density", control: "slider", min: 0.02, max: 0.8, step: 0.02, default: 0.3 }, { key: "variant", label: "Flake Shape", control: "select", options: ["square", "round", "snowflake"], default: "square" }, { key: "direction", label: "Wind Direction", control: "slider", min: 0, max: 360, step: 1, default: 125 },
  ],
  dependencies: ["three"], variants: ["react-ts-tw"], a11y: { reducedMotion: "The snow field renders once without continuous motion when reduced motion is requested.", notes: ["The animated canvas is decorative and has no focusable controls."] }, install: { registryPath: "r/backgrounds/pixel-snow.json" }, credits: { license: "MIT" }, demo: {}, status: "stable", createdAt: "2026-08-09",
};

export default spec;
