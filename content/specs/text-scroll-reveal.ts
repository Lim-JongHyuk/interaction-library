import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "scroll-reveal",
  category: "typography",
  name: "Scroll Reveal",
  description: "스크롤 진행도에 맞춰 문단이 단어 단위로 밝아지는 매니페스토 타이포그래피.",
  tags: ["text", "scroll", "reveal", "manifesto", "premium"],
  trigger: "scroll",
  triggerNote: "문단이 뷰포트를 통과하는 동안 단어가 순서대로 리빌되며, 스크롤을 되돌리면 함께 되돌아간다.",
  params: [
    {
      key: "text",
      label: "Text",
      control: "text",
      default: "좋은 모션은 장식이 아니라 위계다. 시선이 머무는 순서를 설계하는 일이며, 그 차이가 프리미엄을 만든다.",
    },
    { key: "baseOpacity", label: "Base Opacity", control: "slider", min: 0, max: 0.4, step: 0.02, default: 0.12 },
    { key: "blur", label: "Blur Transition", control: "toggle", default: true },
    { key: "startAt", label: "Start At", control: "slider", min: 0.5, max: 1, step: 0.05, default: 0.85 },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "리빌을 생략하고 문단 전체를 완전한 오파시티로 즉시 렌더링한다.",
    notes: ["단어는 실제 텍스트 노드로 렌더되어 스크린리더가 그대로 읽는다."],
  },
  install: { registryPath: "r/typography/scroll-reveal.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
