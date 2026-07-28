import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "particle-text",
  category: "typography",
  name: "WebGL Particle Text",
  description: "수천 개의 WebGL 파티클로 텍스트를 그려내고, 커서가 다가오면 흩어졌다가 스프링으로 복귀하는 강력한 파티클 타이포그래피.",
  tags: ["text", "particles", "webgl", "three", "pointer", "interactive", "hero"],
  trigger: "hover",
  triggerNote: "마운트 시 파티클이 화면 전역에서 모여들며 글자를 조립하고, 이후 커서가 반경 안에 들어오면 반발력으로 흩어졌다가 스프링으로 원위치한다.",
  params: [
    { key: "text", label: "Text", control: "text", default: "Particle" },
    {
      key: "tag",
      label: "HTML Tag",
      control: "select",
      options: ["h1", "h2", "h3", "h4", "p", "span"],
      default: "h2",
    },
    {
      key: "font",
      label: "Font",
      control: "select",
      options: ["Sans Serif", "Serif", "Monospace", "Rounded"],
      default: "Sans Serif",
    },
    { key: "color", label: "Color", control: "color", default: "#ffffff" },
    { key: "particleSize", label: "Particle Size", control: "slider", min: 0.5, max: 5, step: 0.1, default: 2, unit: "px" },
    { key: "spread", label: "Spread", control: "slider", min: 0, max: 3, step: 0.1, default: 1 },
    { key: "density", label: "Density", control: "slider", min: 1, max: 10, step: 1, default: 6 },
    { key: "mouseInteraction", label: "Mouse Interaction", control: "toggle", default: true },
    { key: "force", label: "Force", control: "slider", min: 0, max: 5, step: 0.1, default: 2 },
    { key: "mouseRadius", label: "Mouse Radius", control: "slider", min: 20, max: 320, step: 10, default: 120, unit: "px" },
    { key: "hitStrength", label: "Hit Strength", control: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: "speed", label: "Animation Speed", control: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: "padding", label: "Padding", control: "slider", min: 0, max: 80, step: 4, default: 24, unit: "px" },
  ],
  dependencies: ["three"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "진입 조립 연출·흔들림·마우스 반발을 모두 끄고 파티클을 글자 형태의 최종 위치에 정적으로 배치한다.",
    notes: [
      "실제 텍스트는 지정한 HTML Tag 안에 sr-only로 노출되고, 캔버스는 aria-hidden으로 장식 요소 처리된다.",
      "WebGL 렌더링 — GPU 미지원 환경에서는 빈 배경으로 폴백될 수 있다.",
    ],
  },
  install: { registryPath: "r/typography/particle-text.json" },
  credits: { license: "MIT" },
  demo: { text: "Particle" },
  status: "stable",
  createdAt: "2026-07-28",
};
export default spec;
