import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "image-trail",
  category: "interaction",
  name: "Image Trail",
  description: "커서가 지나간 자리에 이미지가 흩뿌려지며 따라오는 트레일. 에이전시 히어로의 시그니처 인터랙션.",
  tags: ["interaction", "cursor", "trail", "images", "hero", "premium"],
  trigger: "hover",
  triggerNote: "이동 거리 기반으로 이미지가 스폰되고 스프링 등장 후 수명이 다하면 가라앉으며 사라진다.",
  params: [
    { key: "spawnDistance", label: "Spawn Distance", control: "slider", min: 16, max: 80, step: 2, default: 34, unit: "px" },
    { key: "lifetime", label: "Lifetime", control: "slider", min: 0.4, max: 2.5, step: 0.1, default: 0.9, unit: "s" },
    { key: "size", label: "Card Size", control: "slider", min: 60, max: 180, step: 4, default: 104, unit: "px" },
    { key: "maxCount", label: "Max Cards", control: "slider", min: 4, max: 20, step: 1, default: 10 },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "트레일 스폰을 비활성화하고 안내 문구만 정적으로 렌더링한다.",
    notes: ["트레일 카드는 pointer-events:none 장식이다.", "images prop으로 실제 이미지 URL 배열을 주입한다."],
  },
  install: { registryPath: "r/interaction/image-trail.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
