import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "testimonial-stack",
  category: "carousels",
  name: "Testimonial Stack",
  description: "아바타가 3D로 겹쳐 회전하고 인용문이 크로스페이드되는 후기 슬라이더.",
  tags: ["testimonial", "3d", "slider", "social-proof", "quote", "autoplay"],
  trigger: "loop",
  triggerNote: "자동 넘김 + 이전/다음·인디케이터로 조작. 활성 아바타는 정면, 나머지는 3D로 젖혀 쌓인다.",
  params: [
    { key: "autoplay", label: "Autoplay", control: "toggle", default: true },
    { key: "interval", label: "Interval", control: "slider", min: 2, max: 10, step: 0.5, default: 5, unit: "s" },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "3D 회전·자동 넘김을 끄고 즉시 교체하며, 컨트롤로만 이동한다.",
    notes: [
      "이전/다음 버튼과 tab role 인디케이터로 완전 키보드 조작.",
      "비활성 아바타는 aria-hidden, 인용은 blockquote/footer로 구조화.",
    ],
  },
  install: { registryPath: "r/carousels/testimonial-stack.json" },
  credits: { inspiredBy: "aceternity animated testimonials", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-21",
};
export default spec;
