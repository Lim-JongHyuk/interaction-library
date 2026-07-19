import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "cursor-pet",
  category: "interaction",
  name: "Cursor Pet",
  description: "화면 어디서든 커서를 눈으로 좇고 깜빡이는 인터랙티브 블롭 펫.",
  tags: ["pet", "eyes", "cursor", "character", "playful"],
  trigger: "hover",
  triggerNote: "전역 pointermove를 추적해 동공이 커서 방향을 향한다. 몸통은 둥실거리며 주기적으로 깜빡인다.",
  params: [
    { key: "size", label: "Size", control: "slider", min: 60, max: 220, step: 4, default: 120, unit: "px" },
    { key: "bodyColor", label: "Body Color", control: "color", default: "#818cf8" },
    { key: "followStrength", label: "Tilt Strength", control: "slider", min: 0, max: 1, step: 0.05, default: 0.35 },
    { key: "blink", label: "Blink", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "커서 추적·둥실거림·깜빡임을 모두 정지하고 정적인 캐릭터를 표시한다." },
  install: { registryPath: "r/interaction/cursor-pet.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
