import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "swarm-cursor", category: "interaction", name: "Swarm Cursor",
  description: "A luminous swarm of particles orbits the cursor, fuses into soft shapes, and scatters on click.",
  tags: ["cursor", "particles", "webgl", "swarm", "gooey"], trigger: "hover",
  triggerNote: "Move across the panel to guide the swarm, then click to scatter it outward.",
  params: [
    { key: "count", label: "Particle Count", control: "slider", min: 1, max: 60, step: 1, default: 10 },
    { key: "size", label: "Particle Size", control: "slider", min: 3, max: 30, step: 1, default: 10, unit: "px" },
    { key: "spread", label: "Spread", control: "slider", min: 30, max: 240, step: 5, default: 100, unit: "px" },
    { key: "speed", label: "Speed", control: "slider", min: 0.5, max: 10, step: 0.5, default: 2.5 },
    { key: "wander", label: "Wander", control: "slider", min: 0, max: 1, step: 0.05, default: 0.25 },
    { key: "merge", label: "Merge", control: "slider", min: 0.2, max: 1, step: 0.05, default: 0.77 },
    { key: "glow", label: "Glow", control: "slider", min: 0, max: 1, step: 0.05, default: 0.75 },
    { key: "color", label: "Base Color", control: "color", default: "#ffffff" },
    { key: "accentColor", label: "Accent Color", control: "color", default: "#ffffff" },
    { key: "scatterOnClick", label: "Scatter on Click", control: "toggle", default: true },
  ],
  dependencies: ["ogl"], variants: ["react-ts-tw"],
  a11y: { reducedMotion: "When reduced motion is requested, the decorative particle swarm remains disabled.", notes: ["The canvas does not intercept pointer interactions with surrounding content."] },
  install: { registryPath: "r/interaction/swarm-cursor.json" }, credits: { inspiredBy: "React Bits", license: "MIT" }, demo: {}, status: "stable", createdAt: "2026-08-09",
};
export default spec;
