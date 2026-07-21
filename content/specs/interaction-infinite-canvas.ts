import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "infinite-canvas",
  category: "interaction",
  name: "Infinite Canvas",
  description: "관성과 자동 드리프트가 있는, 사방으로 끝없이 이어지는 드래그 그리드 캔버스.",
  tags: ["canvas", "drag", "infinite", "grid", "gallery", "momentum"],
  trigger: "drag",
  triggerNote: "드래그로 사방 이동, 놓으면 관성으로 미끄러진다. 가만히 두면 천천히 드리프트.",
  params: [
    { key: "cellSize", label: "Cell Size", control: "slider", min: 140, max: 320, step: 10, default: 220, unit: "px" },
    { key: "gap", label: "Gap", control: "slider", min: 8, max: 40, step: 2, default: 16, unit: "px" },
    { key: "momentum", label: "Momentum", control: "slider", min: 0.8, max: 0.98, step: 0.01, default: 0.92 },
    { key: "drift", label: "Auto Drift", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "관성·자동 드리프트를 끄고, 사용자가 드래그한 만큼만 이동한다.",
    notes: [
      "컨테이너가 포커스 가능(tabIndex=0)하며 방향키로 60px씩 이동.",
      "타일은 장식 요소로 aria-hidden, 컨테이너에 region 라벨 제공.",
    ],
  },
  install: { registryPath: "r/interaction/infinite-canvas.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
