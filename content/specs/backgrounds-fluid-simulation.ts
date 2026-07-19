import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "fluid-simulation",
  category: "backgrounds",
  name: "Fluid Simulation",
  description: "GPU에서 Navier-Stokes 방정식을 실시간으로 풀어내는 인터랙티브 유체 시뮬레이션 배경.",
  tags: ["background", "fluid", "webgl", "shader", "interactive", "flagship"],
  trigger: "loop",
  triggerNote: "포인터 드래그로 잉크를 뿌리고, ambient 모드에서는 주기적으로 잉크가 자동 분사된다.",
  params: [
    { key: "splatRadius", label: "Splat Radius", control: "slider", min: 0.05, max: 1, step: 0.05, default: 0.25 },
    { key: "fade", label: "Fade", control: "slider", min: 0.2, max: 4, step: 0.1, default: 1 },
    { key: "curl", label: "Curl", control: "slider", min: 0, max: 50, step: 1, default: 30 },
    { key: "colorful", label: "Rainbow", control: "toggle", default: true },
    { key: "color", label: "Ink Color", control: "color", default: "#6366f1" },
    { key: "ambient", label: "Ambient Splats", control: "toggle", default: true },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "시뮬레이션을 정지하고 미리 계산된 정적 잉크 프레임 한 장만 렌더링한다.",
    notes: [
      "장식용 배경 — 스크린리더에는 노출할 정보가 없다.",
      "WebGL half-float 미지원 환경에서는 정적 그라디언트로 폴백한다.",
    ],
  },
  install: { registryPath: "r/backgrounds/fluid-simulation.json" },
  credits: { inspiredBy: "GPU Gems Ch.38 / Pavel Dobryakov WebGL-Fluid", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
