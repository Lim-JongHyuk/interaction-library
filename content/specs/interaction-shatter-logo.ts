import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "shatter-logo",
  category: "interaction",
  name: "Shatter Glass Logo",
  description: "커서가 가까워질수록 유리 파편이 3D 공간으로 흩어졌다가, 멀어지면 스프링으로 복원되는 인터랙티브 글래스 로고.",
  tags: ["shatter", "glass", "logo", "3d", "webgl", "hover", "pointer", "premium"],
  trigger: "hover",
  triggerNote: "커서가 로고 근처에 접근하면 반경 안의 파편이 바깥·카메라 방향으로 흩어지고, 멀어지면 탄성·감쇠와 함께 원래 자리로 되돌아온다. 접근하지 않으면 파편이 완벽히 결합해 하나의 로고로 보인다.",
  params: [
    { key: "fragments", label: "Fragments", control: "slider", min: 20, max: 140, step: 5, default: 60 },
    { key: "depth", label: "Extrude Depth", control: "slider", min: 0.05, max: 0.5, step: 0.01, default: 0.22 },
    { key: "bevel", label: "Bevel", control: "slider", min: 0, max: 1, step: 0.05, default: 0.5 },
    { key: "tint", label: "Glass Tint", control: "color", default: "#eaf2ff" },
    { key: "transmission", label: "Transmission", control: "slider", min: 0, max: 1, step: 0.05, default: 0.85 },
    { key: "frost", label: "Frost", control: "slider", min: 0, max: 1, step: 0.05, default: 0.35 },
    { key: "radius", label: "Hover Radius", control: "slider", min: 0.4, max: 3, step: 0.1, default: 1.4 },
    { key: "spread", label: "Shatter Spread", control: "slider", min: 0.2, max: 2.5, step: 0.1, default: 1.1 },
    { key: "shatterSpeed", label: "Shatter Speed", control: "slider", min: 4, max: 30, step: 1, default: 14 },
    { key: "restoreDamping", label: "Restore Damping", control: "slider", min: 0.75, max: 0.97, step: 0.01, default: 0.88 },
    { key: "idleFloat", label: "Idle Float", control: "toggle", default: true },
    { key: "idleFloatSpeed", label: "Float Speed", control: "slider", min: 0.1, max: 2, step: 0.05, default: 0.6 },
    { key: "lightColor", label: "Light Color", control: "color", default: "#eef3ff" },
  ],
  dependencies: ["three"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "파편 반응·유휴 부유 모션을 모두 끄고, 완전히 결합된 정적인 3D 로고 한 프레임만 렌더링한다.",
    notes: [
      "WebGL 렌더링 — GPU 미지원 환경에서는 로딩 상태로 유지될 수 있다.",
      "logo prop으로 SVG data URL 또는 마크업을 주입한다.",
    ],
  },
  install: { registryPath: "r/interaction/shatter-logo.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-28",
};
export default spec;
