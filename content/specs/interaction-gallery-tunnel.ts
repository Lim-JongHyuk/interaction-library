import type { MotionSpec } from "@/lib/spec";

const spec: MotionSpec = {
  slug: "gallery-tunnel",
  category: "interaction",
  name: "Gallery Tunnel",
  description: "A responsive 3D image tunnel with glowing grid lines, depth fog, and a press-to-start camera journey.",
  tags: ["gallery", "three", "3d", "tunnel", "images"],
  trigger: "click",
  params: [
    { key: "background", label: "Background", control: "color", default: "#000000" },
    { key: "lineColor", label: "Line Color", control: "color", default: "#B0B0B0" },
    { key: "lineOpacity", label: "Line Opacity", control: "slider", min: 0, max: 100, step: 1, default: 50 },
    { key: "grid", label: "Grid Density", control: "slider", min: 2, max: 8, step: 1, default: 4 },
    { key: "speed", label: "Speed", control: "slider", min: 0, max: 200, step: 1, default: 100 },
    { key: "boost", label: "Boost", control: "slider", min: 0, max: 200, step: 1, default: 100 },
    { key: "fade", label: "Depth Fade", control: "slider", min: 0, max: 100, step: 1, default: 100 },
    { key: "label", label: "Show Label", control: "toggle", default: true },
    { key: "labelText", label: "Label", control: "text", default: "Press to Start" },
    { key: "labelFill", label: "Label Fill", control: "color", default: "#FFFFFF" },
    { key: "labelColor", label: "Label Color", control: "color", default: "#000000" },
  ],
  dependencies: ["three"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "The tunnel remains usable with a static first frame when reduced motion is preferred." },
  install: { registryPath: "r/interaction/gallery-tunnel.json" },
  demo: {},
  status: "stable",
  createdAt: "2026-08-05",
};

export default spec;
