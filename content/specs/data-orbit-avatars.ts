import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "orbit-avatars",
  category: "data",
  name: "Orbit Avatars",
  description: "중심 브랜드를 둘러싸고 아바타들이 서로 다른 속도·방향으로 궤도를 도는 소셜 프루프 섹션.",
  tags: ["orbit", "avatars", "social-proof", "team", "loop"],
  trigger: "loop",
  triggerNote: "상시 궤도 회전. 호버 시 일시정지(옵션).",
  params: [
    { key: "speed", label: "Orbit Period", control: "slider", min: 4, max: 40, step: 1, default: 18, unit: "s" },
    { key: "rings", label: "Rings", control: "slider", min: 1, max: 3, step: 1, default: 2 },
    { key: "counterRotate", label: "Counter Rotate", control: "toggle", default: true },
    { key: "pauseOnHover", label: "Pause on Hover", control: "toggle", default: true },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "궤도 회전을 정지하고 아바타를 고정 위치에 정적으로 배치한다.",
    notes: ["장식적 시각화로 role=img + aria-label로 요약 노출된다."],
  },
  install: { registryPath: "r/data/orbit-avatars.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
