import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "expanding-panels",
  category: "cms",
  name: "Expanding Panels",
  description: "hover·focus 시 부드럽게 펼쳐지는 가로 확장형 이미지 갤러리.",
  tags: ["gallery", "accordion", "expand", "hover", "panels", "showcase"],
  trigger: "hover",
  triggerNote: "패널에 hover·focus하면 해당 패널의 flex-grow가 커지고 나머지는 접힌다.",
  params: [
    { key: "expandFlex", label: "Expand Ratio", control: "slider", min: 2, max: 8, step: 0.5, default: 5 },
    { key: "gap", label: "Gap", control: "slider", min: 0, max: 24, step: 2, default: 12, unit: "px" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "펼침 트랜지션을 제거하고 즉시 전환한다(기능은 동일).",
    notes: ["패널은 button으로 키보드 포커스·확장 가능, aria-expanded로 상태 전달."],
  },
  install: { registryPath: "r/cms/expanding-panels.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
