import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "command-menu",
  category: "navigation",
  name: "Command Palette",
  description: "⌘K로 열리는 스포트라이트 검색. 부분 일치 필터와 키보드 내비게이션을 갖춘다.",
  tags: ["command", "cmdk", "search", "keyboard", "palette", "spotlight"],
  trigger: "click",
  triggerNote: "⌘K/Ctrl+K 또는 힌트 버튼으로 열고, 방향키·Enter·Esc로 조작한다.",
  params: [
    { key: "placeholder", label: "Placeholder", control: "text", default: "Type a command or search…" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "showHint", label: "⌘K hint", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "열림/닫힘 스케일·페이드 전환을 생략하고 즉시 표시/숨김한다.",
    notes: [
      "role=dialog / listbox / option, aria-selected로 활성 항목 표기.",
      "방향키 이동·Enter 선택·Esc 닫기 완전 키보드 지원, 열릴 때 입력에 포커스.",
    ],
  },
  install: { registryPath: "r/navigation/command-menu.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
