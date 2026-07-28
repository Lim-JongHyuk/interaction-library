import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "infinite-canvas",
  category: "interaction",
  name: "Infinite Canvas",
  description: "원통 벽 안에 서 있는 듯한 3D 커브드 무한 갤러리. 드래그로 관성 있게 팬한다.",
  tags: ["canvas", "drag", "infinite", "grid", "gallery", "3d", "curved", "tilt"],
  trigger: "drag",
  triggerNote: "드래그로 자유롭게 팬하며 특정 위치로 스냅되지 않는다. 클릭·홀드로 타일이 모이거나 축소되는 효과는 전혀 없다 — 순수한 드래그 팬만 존재한다.",
  params: [
    { key: "cellSize", label: "Cell Size", control: "slider", min: 80, max: 260, step: 10, default: 130, unit: "px" },
    { key: "gap", label: "Gap", control: "slider", min: 4, max: 32, step: 2, default: 8, unit: "px" },
    { key: "momentum", label: "Momentum", control: "slider", min: 0.8, max: 0.98, step: 0.01, default: 0.92 },
    { key: "curvature", label: "Curvature", control: "slider", min: 0, max: 40, step: 1, default: 18, unit: "°" },
    { key: "curveRadius", label: "Curve Radius", control: "slider", min: 300, max: 2000, step: 50, default: 900, unit: "px" },
    { key: "tiltStrength", label: "Tilt Strength", control: "slider", min: 0, max: 16, step: 1, default: 6, unit: "°" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "관성 글라이드를 끈다 — 손을 뗀 자리에서 바로 멈춘다. 곡면 배치와 속도 기반 기울임은 사용자 드래그에 대한 직접 반응이라 유지된다.",
    notes: [
      "컨테이너가 포커스 가능(tabIndex=0)하며 방향키로 60px씩 이동.",
      "타일은 장식 요소로 aria-hidden, 컨테이너에 region 라벨 제공.",
      "갤러리 타일은 클릭 동작이 없는 순수 비주얼 컴포넌트다.",
      "items prop으로 이미지·제목·연도를 주입한다. 없으면 데모용 기본 목록을 사용한다.",
    ],
  },
  install: { registryPath: "r/interaction/infinite-canvas.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-28",
};
export default spec;
