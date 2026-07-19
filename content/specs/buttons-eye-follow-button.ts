import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "eye-follow-button",
  category: "buttons",
  name: "Eye Follow Button",
  description: "페이지 어디서든 커서를 따라오는 두 눈이 달린 캐릭터 CTA 버튼. 이따금 깜빡인다.",
  tags: ["button", "cta", "cursor", "playful", "character", "premium"],
  trigger: "hover",
  triggerNote: "전역 커서를 눈동자가 스프링으로 추적하고, 호버 시 눈동자가 커진다.",
  params: [
    { key: "label", label: "Label", control: "text", default: "Watch me" },
    { key: "range", label: "Pupil Range", control: "slider", min: 2, max: 7, step: 0.5, default: 4, unit: "px" },
    { key: "blink", label: "Blink", control: "toggle", default: true },
    { key: "color", label: "Color", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "눈동자 추적·깜빡임·스케일 효과를 모두 끄고 정적인 버튼으로 렌더링한다.",
    notes: ["눈은 장식(aria-hidden)이고 라벨 텍스트가 접근 가능한 이름이 된다."],
  },
  install: { registryPath: "r/buttons/eye-follow-button.json" },
  credits: { inspiredBy: "Framer marketplace 'Eye Follow Button'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
