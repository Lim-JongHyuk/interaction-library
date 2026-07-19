import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "kinetic-lines",
  category: "backgrounds",
  name: "Kinetic Lines",
  description: "수평 유선들이 사인파로 흐르고 커서 근처에서 밀려나듯 휘어지는 캔버스 라인 필드.",
  tags: ["background", "lines", "kinetic", "cursor", "canvas"],
  trigger: "hover",
  triggerNote: "루프로 흐르며, 커서 위치에 가우시안 반발이 적용된다.",
  params: [
    { key: "lineCount", label: "Lines", control: "slider", min: 8, max: 60, step: 2, default: 26 },
    { key: "amplitude", label: "Amplitude", control: "slider", min: 2, max: 30, step: 1, default: 10, unit: "px" },
    { key: "influence", label: "Cursor Influence", control: "slider", min: 40, max: 260, step: 10, default: 110, unit: "px" },
    { key: "speed", label: "Flow Speed", control: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
    { key: "color", label: "Line Color", control: "color", default: "#818cf8" },
  ],
  dependencies: [],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "흐름 애니메이션을 정지하고 정적인 라인 한 프레임만 그린다." },
  install: { registryPath: "r/backgrounds/kinetic-lines.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-19",
};
export default spec;
