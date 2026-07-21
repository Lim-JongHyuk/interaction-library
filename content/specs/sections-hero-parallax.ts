import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "hero-parallax",
  category: "sections",
  name: "Hero Parallax",
  description: "스크롤에 따라 여러 행이 반대로 흐르고 헤드라인이 3D로 펴지는 히어로 패럴럭스.",
  tags: ["hero", "parallax", "scroll-scrub", "3d", "showcase", "landing"],
  trigger: "scroll",
  triggerNote: "스크롤 진행도를 스프링으로 완충해 행 이동·헤드라인 rotateX·불투명도를 스크럽한다.",
  params: [
    { key: "travel", label: "Travel", control: "slider", min: 120, max: 600, step: 20, default: 320, unit: "px" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "스크럽·3D를 끄고 헤드라인과 타일을 정적 그리드로 렌더한다.",
    notes: ["타일 행은 장식으로 aria-hidden, 헤드라인은 실제 텍스트로 유지."],
  },
  install: { registryPath: "r/sections/hero-parallax.json" },
  credits: { inspiredBy: "aceternity hero parallax", license: "MIT" },
  demo: { heading: "The studio behind\nyour next launch." },
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
