import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "browser-frame",
  category: "embeds",
  name: "Browser Frame",
  description: "스크린샷이나 iframe을 감싸는 브라우저 크롬 프레임. 뷰포트 진입 시 떠오르며 등장.",
  tags: ["embed", "frame", "browser", "reveal"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생.",
  params: [
    { key: "url", label: "URL", control: "text", default: "motionkit.dev" },
    { key: "title", label: "Title", control: "text", default: "MotionKit" },
    { key: "duration", label: "Duration", control: "slider", min: 0.2, max: 1.5, step: 0.05, default: 0.6, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "등장 애니메이션 없이 프레임이 즉시 최종 상태로 표시된다." },
  install: { registryPath: "r/embeds/browser-frame.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
