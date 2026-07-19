import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "media-hover-list",
  category: "cms",
  name: "Media Hover List",
  description: "리스트 항목에 커서를 올리면 미디어 미리보기 카드가 커서를 스프링으로 따라다니는 포트폴리오 목록.",
  tags: ["cms", "list", "hover", "media", "portfolio"],
  trigger: "hover",
  triggerNote: "항목 hover 시 미리보기 카드 등장. 카드가 커서 이동 속도에 따라 기울어진다.",
  params: [
    { key: "cardWidth", label: "Card Width", control: "slider", min: 120, max: 280, step: 8, default: 176, unit: "px" },
    { key: "tilt", label: "Velocity Tilt", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "미리보기 카드를 표시하지 않고 정적인 리스트로 동작한다.",
    notes: ["키보드 포커스로도 항목 활성화가 가능하다."],
  },
  install: { registryPath: "r/cms/media-hover-list.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
