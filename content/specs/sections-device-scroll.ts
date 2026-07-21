import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "device-scroll",
  category: "sections",
  name: "Device Scroll",
  description: "스크롤을 내리면 3D 노트북 뚜껑이 열리며 화면 UI가 켜지는 제품 쇼케이스 섹션.",
  tags: ["laptop", "3d", "scroll-scrub", "product", "showcase", "hero"],
  trigger: "scroll",
  triggerNote: "섹션 스크롤 진행도로 시점(-64°→-16°)·뚜껑 개폐(-89°→8°)·스케일을 스크럽한다.",
  params: [
    { key: "zoom", label: "Zoom", control: "slider", min: 0.8, max: 1.3, step: 0.05, default: 1 },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
    { key: "glow", label: "Glow", control: "toggle", default: true },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스크롤 스크럽 없이 완전히 열린 상태를 정적으로 렌더한다.",
    notes: ["노트북 3D 모형은 장식 요소로 aria-hidden, 섹션에 라벨 제공."],
  },
  install: { registryPath: "r/sections/device-scroll.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
