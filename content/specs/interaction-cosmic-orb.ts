import type { MotionSpec } from "@/lib/spec";

const spec: MotionSpec = {
  slug: "cosmic-orb",
  category: "interaction",
  name: "Cosmic Orb",
  description: "A luminous, deep-space orb with drifting starfields, chromatic nebula bands, and a responsive glass-like rim.",
  tags: ["space", "orb", "canvas", "stars", "ambient"],
  trigger: "loop",
  params: [
    { key: "size", label: "Size", control: "slider", min: 180, max: 520, step: 10, default: 340, unit: "px" },
    { key: "archetype", label: "Galaxy", control: "select", options: ["auto", "spiral", "nebula", "core", "deep"], default: "auto" },
    { key: "background", label: "Background", control: "color", default: "#000000" },
    { key: "starColor", label: "Stars", control: "color", default: "#ffffff" },
    { key: "speed", label: "Drift Speed", control: "slider", min: 0, max: 100, step: 1, default: 50 },
    { key: "spin", label: "Spin", control: "slider", min: 0, max: 100, step: 1, default: 50 },
    { key: "lens", label: "Lens Glow", control: "toggle", default: true },
    { key: "lensAmount", label: "Lens Amount", control: "slider", min: 0, max: 100, step: 1, default: 45 },
    { key: "lensColor", label: "Lens Color", control: "color", default: "#ffffff" },
    { key: "colorA", label: "Cyan", control: "color", default: "#3ce0ff" },
    { key: "colorB", label: "Violet", control: "color", default: "#a24bff" },
    { key: "colorC", label: "Pink", control: "color", default: "#ff5ea8" },
  ],
  dependencies: [], variants: ["react-ts-tw"],
  a11y: { reducedMotion: "Stops the animation and displays a static cosmic orb when reduced motion is preferred." },
  install: { registryPath: "r/interaction/cosmic-orb.json" }, demo: {}, status: "stable", createdAt: "2026-08-05",
};
export default spec;
