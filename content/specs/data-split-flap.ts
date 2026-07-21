import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "split-flap",
  category: "data",
  name: "Split Flap",
  description: "위 반쪽이 접히고 아래 반쪽이 펼쳐지는 공항 출발판식 스플릿 플랩 디스플레이.",
  tags: ["split-flap", "airport", "ticker", "3d", "retro", "display"],
  trigger: "loop",
  triggerNote: "단어들을 hold 간격으로 순환. 각 셀이 문자표를 순차 플립해 목표 글자에 도착한다.",
  params: [
    { key: "speed", label: "Flip Speed", control: "slider", min: 40, max: 140, step: 5, default: 70, unit: "ms" },
    { key: "stagger", label: "Stagger", control: "slider", min: 0, max: 0.15, step: 0.01, default: 0.06, unit: "s" },
    { key: "hold", label: "Hold", control: "slider", min: 1.5, max: 5, step: 0.1, default: 2.6, unit: "s" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "플립·순환 없이 첫 단어를 즉시 정적으로 표시한다.",
    notes: [
      "보드 전체에 현재 단어를 role=img + aria-label로 노출, 개별 셀은 aria-hidden.",
    ],
  },
  install: { registryPath: "r/data/split-flap.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
