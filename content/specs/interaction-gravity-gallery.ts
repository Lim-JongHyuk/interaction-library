import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "gravity-gallery",
  category: "interaction",
  name: "Gravity Gallery",
  description: "카드들이 중력으로 낙하해 쌓이고, 서로 충돌하며, 드래그로 집어 던질 수 있는 물리 갤러리.",
  tags: ["physics", "gravity", "drag", "gallery", "playful"],
  trigger: "drag",
  triggerNote: "뷰포트 진입 시 낙하 시작. 카드를 드래그해 던지면 관성·충돌·바운스가 적용된다.",
  params: [
    { key: "gravity", label: "Gravity", control: "slider", min: 0.2, max: 2.5, step: 0.05, default: 0.9 },
    { key: "bounce", label: "Bounce", control: "slider", min: 0, max: 0.9, step: 0.05, default: 0.55 },
    { key: "friction", label: "Air Friction", control: "slider", min: 0.95, max: 1, step: 0.005, default: 0.99 },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "물리 시뮬레이션 없이 정렬된 정적 그리드로 표시한다.",
    notes: ["외부 물리 엔진 없이 자체 rAF 시뮬레이션(원형 충돌·탄성 근사)으로 구현."],
  },
  install: { registryPath: "r/interaction/gravity-gallery.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
