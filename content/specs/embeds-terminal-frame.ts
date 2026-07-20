import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "terminal-frame",
  category: "embeds",
  name: "Terminal Frame",
  description: "명령을 실제로 타이핑하고 출력을 순서대로 흘려보내는 macOS 스타일 터미널 임베드.",
  tags: ["terminal", "typing", "cli", "embed", "hero"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 시작. loop 켜면 스크립트 종료 후 지우고 반복.",
  params: [
    { key: "typingSpeed", label: "Typing Speed", control: "slider", min: 10, max: 80, step: 5, default: 40, unit: "cps" },
    { key: "title", label: "Title", control: "text", default: "motionkit — zsh" },
    { key: "accentColor", label: "Accent", control: "color", default: "#34d399" },
    { key: "loop", label: "Loop", control: "toggle", default: true },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "타이핑 애니메이션을 생략하고 전체 스크립트를 최종 상태로 즉시 렌더한다.",
    notes: ["role=log로 노출되어 스크린리더가 터미널 영역임을 인지한다."],
  },
  install: { registryPath: "r/embeds/terminal-frame.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
