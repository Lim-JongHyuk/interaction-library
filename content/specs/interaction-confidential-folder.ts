import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "confidential-folder",
  category: "interaction",
  name: "Confidential Folder",
  description: "호버하면 폴더가 열리며 기밀 서류가 부채꼴로 솟아오르는 3D 인터랙션.",
  tags: ["interaction", "folder", "hover", "3d", "playful", "premium"],
  trigger: "hover",
  triggerNote: "호버로 열리고 클릭/탭으로 토글된다 (터치 환경 대응).",
  params: [
    { key: "label", label: "Label", control: "text", default: "Confidential" },
    { key: "color", label: "Folder Color", control: "color", default: "#d4a763" },
    { key: "lift", label: "Lift", control: "slider", min: 20, max: 120, step: 5, default: 60, unit: "px" },
    { key: "stamp", label: "Stamp", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스프링 전환을 생략하고 열림/닫힘 상태를 즉시 전환한다.",
    notes: ["button + aria-expanded로 키보드에서도 열고 닫을 수 있다.", "docs prop으로 실제 문서 카드(제목·이미지)를 주입한다."],
  },
  install: { registryPath: "r/interaction/confidential-folder.json" },
  credits: { inspiredBy: "Framer marketplace 'Confidential Folder'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
