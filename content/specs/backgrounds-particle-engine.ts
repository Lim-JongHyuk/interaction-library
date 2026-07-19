import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "particle-engine",
  category: "backgrounds",
  name: "3D Particle Engine",
  description: "수천 개의 파티클이 맥동하는 구형 클라우드로 떠다니는 몰입형 WebGL 배경.",
  tags: ["background", "particles", "3d", "webgl", "immersive"],
  trigger: "loop",
  triggerNote: "가산 블렌딩 포인트 클라우드가 회전·맥동하며, 마우스 패럴랙스로 카메라가 따라온다.",
  params: [
    { key: "count", label: "Particles", control: "slider", min: 1000, max: 10000, step: 500, default: 4000 },
    { key: "color", label: "Color", control: "color", default: "#818cf8" },
    { key: "speed", label: "Speed", control: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: "parallax", label: "Mouse Parallax", control: "toggle", default: true },
  ],
  dependencies: ["three"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "회전·맥동·패럴랙스를 정지하고 정적인 파티클 한 프레임만 렌더링한다.",
    notes: ["WebGL 렌더링 — GPU 미지원 환경에서는 빈 배경으로 폴백될 수 있다."],
  },
  install: { registryPath: "r/backgrounds/particle-engine.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
