import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "animated-beam",
  category: "backgrounds",
  name: "Animated Beam",
  description: "바깥 노드에서 중앙 허브로 그라디언트 빔이 흐르는 인테그레이션 다이어그램.",
  tags: ["beam", "svg", "integration", "connect", "gradient", "diagram"],
  trigger: "loop",
  triggerNote: "각 곡선 경로 위를 그라디언트 대시가 무한 반복하며 노드→허브 방향으로 흐른다.",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 1, max: 8, step: 0.5, default: 3, unit: "s" },
    { key: "curvature", label: "Curvature", control: "slider", min: 0, max: 140, step: 5, default: 60 },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "흐름 애니메이션을 끄고 은은한 정적 그라디언트 연결선으로 렌더한다.",
    notes: ["SVG에 role=img과 라벨 제공, 노드 칩은 장식으로 aria-hidden."],
  },
  install: { registryPath: "r/backgrounds/animated-beam.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
