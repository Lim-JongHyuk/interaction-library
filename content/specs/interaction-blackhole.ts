import type { MotionSpec } from "@/lib/spec";

const spec: MotionSpec = {
  slug: "blackhole",
  category: "interaction",
  name: "Black Hole",
  description: "A Canvas-rendered accretion disk with depth-sorted orbiting particles and a central event horizon.",
  tags: ["canvas", "space", "particles", "orbit", "3d"],
  trigger: "loop",
  params: [
    { key: "size", label: "Size", control: "slider", min: 180, max: 720, step: 10, default: 420, unit: "px" },
    { key: "showCenter", label: "Event Horizon", control: "toggle", default: true },
    { key: "voidRadius", label: "Horizon Size", control: "slider", min: 10, max: 120, step: 1, default: 40, unit: "px" },
    { key: "voidX", label: "Horizon X", control: "slider", min: 0, max: 100, step: 1, default: 50, unit: "%" },
    { key: "voidY", label: "Horizon Y", control: "slider", min: 0, max: 100, step: 1, default: 50, unit: "%" },
    { key: "particleCount", label: "Particles", control: "slider", min: 100, max: 2000, step: 50, default: 1000 },
    { key: "particleSize", label: "Particle Size", control: "slider", min: 1, max: 50, step: 1, default: 4 },
    { key: "particleColor", label: "Particle Color", control: "color", default: "#ffffff" },
    { key: "outerRadius", label: "Disk Radius", control: "slider", min: 0, max: 100, step: 1, default: 70, unit: "%" },
    { key: "tilt", label: "Tilt", control: "slider", min: 0, max: 85, step: 1, default: 20, unit: "°" },
    { key: "tiltSideway", label: "Side Tilt", control: "slider", min: 0, max: 360, step: 1, default: 160, unit: "°" },
    { key: "trail", label: "Trail", control: "slider", min: 0, max: 50, step: 1, default: 50 },
    { key: "orbitSpeed", label: "Orbit Speed", control: "slider", min: 0, max: 12, step: 0.5, default: 4 },
    { key: "pullSpeed", label: "Pull Speed", control: "slider", min: 0, max: 20, step: 0.5, default: 0 },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "Animation can be paused by rendering a static frame when reduced motion is preferred." },
  install: { registryPath: "r/interaction/blackhole.json" },
  demo: {},
  status: "stable",
  createdAt: "2026-08-06",
};

export default spec;
