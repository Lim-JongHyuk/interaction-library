import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "cursor-pet",
  category: "interaction",
  name: "Cursor Pet",
  description: "커서를 눈과 몸 전체로 좇는 3D 프로시저럴 마스코트. 캐릭터마다 고유 팔레트와 수면·말풍선 상태를 갖는다.",
  tags: ["pet", "mascot", "eyes", "cursor", "character", "3d", "playful", "chat-bubble"],
  trigger: "hover",
  triggerNote: "전역 pointermove로 눈동자가 커서를 향하고, 몸 전체가 커서 쪽으로 끌려가며 perspective 3D로 기운다. 커서가 멎으면 잠들고 말풍선이 유휴 문구로 바뀐다.",
  params: [
    { key: "character", label: "Character", control: "select", options: ["pip", "puff", "botty", "spook"], default: "puff" },
    { key: "size", label: "Size", control: "slider", min: 60, max: 240, step: 4, default: 140, unit: "px" },
    { key: "autoColor", label: "Character Palette", control: "toggle", default: true },
    { key: "bodyColor", label: "Body Color", control: "color", default: "#6366f1" },
    { key: "followSpeed", label: "Follow Speed", control: "slider", min: 1, max: 10, step: 1, default: 6 },
    { key: "followDistance", label: "Follow Distance", control: "slider", min: 0, max: 40, step: 2, default: 16, unit: "px" },
    { key: "tilt3d", label: "3D Tilt", control: "slider", min: 0, max: 45, step: 1, default: 22, unit: "deg" },
    { key: "wobbleIntensity", label: "Wobble", control: "slider", min: 0, max: 1, step: 0.05, default: 0.4 },
    { key: "idleMode", label: "Idle (Sleep)", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "커서 추적·몸통 이동·3D 기울임·숨쉬기·깜빡임·수면 전환을 모두 정지하고 정적인 캐릭터와 말풍선을 표시한다.",
    notes: [
      "SVG는 role=img으로 캐릭터 종류를 aria-label에 요약해 노출한다.",
      "Character Palette를 끄면 Body Color로 몸 색을 직접 지정할 수 있다.",
    ],
  },
  install: { registryPath: "r/interaction/cursor-pet.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
