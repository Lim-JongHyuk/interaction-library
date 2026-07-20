import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "otp-input",
  category: "forms",
  name: "OTP Input",
  description: "붙여넣기·자동완성까지 처리하고 성공 웨이브와 오류 흔들림으로 응답하는 인증 코드 입력.",
  tags: ["otp", "input", "form", "auth", "validation"],
  trigger: "click",
  triggerNote: "박스 클릭 → 입력. 전부 채우면 검증: 일치 시 성공 웨이브, 불일치 시 흔들림 후 초기화.",
  params: [
    { key: "length", label: "Digits", control: "slider", min: 4, max: 8, step: 1, default: 6 },
    { key: "masked", label: "Mask", control: "toggle", default: false },
    { key: "correctCode", label: "Demo Code", control: "text", default: "123456" },
    { key: "accentColor", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "팝·흔들림·웨이브를 생략하고 색상 변화만으로 상태를 전달한다.",
    notes: [
      "실제 입력은 단일 input이 받아 스크린리더·모바일 one-time-code 자동완성과 호환된다.",
      "검증 결과는 aria-live=polite 영역으로 안내된다.",
    ],
  },
  install: { registryPath: "r/forms/otp-input.json" },
  credits: { license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
