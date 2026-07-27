import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "cosmic-ray",
  category: "backgrounds",
  name: "Cosmic Ray",
  description: "GLSL 셰이더로 그린 심우주 배경. 반짝이는 다층 별밭 위로 코어 별에서 광선이 뻗어나간다.",
  tags: ["space", "stars", "webgl", "shader", "glsl", "beam", "parallax", "background"],
  trigger: "loop",
  triggerNote: "가는 빛줄기들이 코어로 수렴한 채 일렁이고, 별밭은 광선의 반대 방향으로 시차를 두고 천천히 흘러간다. IntersectionObserver로 화면 밖에서는 렌더 루프를 멈춘다.",
  params: [
    { key: "coreShape", label: "Core Shape", control: "select", options: ["round", "lensFlare", "diamond", "comet"], default: "round" },
    { key: "originX", label: "Origin X", control: "slider", min: 0, max: 1, step: 0.01, default: 0.52 },
    { key: "originY", label: "Origin Y", control: "slider", min: 0, max: 1, step: 0.01, default: 0.62 },
    { key: "angle", label: "Beam Angle", control: "slider", min: -180, max: 180, step: 1, default: 28, unit: "deg" },
    { key: "spread", label: "Spread", control: "slider", min: 0.1, max: 1.5, step: 0.05, default: 0.5 },
    { key: "beamLength", label: "Beam Length", control: "slider", min: 0.2, max: 2.5, step: 0.1, default: 0.9 },
    { key: "speed", label: "Speed", control: "slider", min: 0, max: 4, step: 0.1, default: 1 },
    { key: "showStars", label: "Starfield", control: "toggle", default: true },
    { key: "backgroundColor", label: "Background", control: "color", default: "#0a0620" },
    { key: "coreColor", label: "Core Color", control: "color", default: "#ffffff" },
    { key: "auraColor", label: "Beam Aura", control: "color", default: "#a855f7" },
  ],
  dependencies: ["three"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "애니메이션 루프를 돌리지 않고 정지된 한 프레임만 렌더링한다.",
    notes: [
      "장식적 배경이므로 role=img과 aria-label로 장면을 한 줄 요약해 노출한다.",
      "IntersectionObserver로 뷰포트 밖에서는 GPU 렌더를 멈춰 배터리를 아낀다.",
      "devicePixelRatio를 2로 제한해 고해상도 화면에서 과도한 픽셀 처리를 막는다.",
    ],
  },
  install: { registryPath: "r/backgrounds/cosmic-ray.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-27",
};
export default spec;
