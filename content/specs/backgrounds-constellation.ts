import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "constellation",
  category: "backgrounds",
  name: "Constellation",
  description: "표류하는 파티클이 실처럼 이어지고 커서에 거미줄처럼 끌려오는 네트워크 배경.",
  tags: ["background", "particles", "network", "cursor", "canvas", "premium"],
  trigger: "loop",
  triggerNote: "파티클이 표류하며 거리 기반으로 연결되고, 커서 주변 노드는 끌려와 밝게 이어진다.",
  params: [
    { key: "count", label: "Particles", control: "slider", min: 30, max: 140, step: 10, default: 70 },
    { key: "linkDistance", label: "Link Distance", control: "slider", min: 60, max: 200, step: 10, default: 110, unit: "px" },
    { key: "speed", label: "Speed", control: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: "color", label: "Color", control: "color", default: "#818cf8" },
    { key: "cursorLink", label: "Cursor Link", control: "toggle", default: true },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "표류를 정지하고 정적인 네트워크 한 프레임만 렌더링한다.",
    notes: ["장식용 배경 — 스크린리더에 노출할 정보가 없다."],
  },
  install: { registryPath: "r/backgrounds/constellation.json" },
  credits: { inspiredBy: "Framer marketplace 'SpiderEffect'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
