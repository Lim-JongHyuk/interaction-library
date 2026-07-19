import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "task-runner",
  category: "interaction",
  name: "Task Runner Card",
  description: "AI 에이전트가 태스크를 하나씩 처리해 나가는 상태 카드. 스피너가 순차적으로 체크로 바뀐다.",
  tags: ["interaction", "ai", "checklist", "status", "loader", "premium"],
  trigger: "loop",
  triggerNote: "stepDuration 간격으로 태스크가 완료되고, path-draw 체크 애니메이션이 이어진다.",
  params: [
    {
      key: "tasks",
      label: "Tasks (| 구분)",
      control: "text",
      default: "Generate color palettes|Recommend font pairings|Create layout templates|Build section engine|Generate hero variants",
    },
    { key: "stepDuration", label: "Step Duration", control: "slider", min: 0.5, max: 4, step: 0.1, default: 1.4, unit: "s" },
    { key: "loop", label: "Loop", control: "toggle", default: true },
    { key: "accent", label: "Accent", control: "color", default: "#818cf8" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "진행 애니메이션을 생략하고 전체 완료 상태를 정적으로 렌더링한다.",
    notes: ["role=status + aria-label로 현재 진행 상황을 스크린리더에 알린다."],
  },
  install: { registryPath: "r/interaction/task-runner.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
