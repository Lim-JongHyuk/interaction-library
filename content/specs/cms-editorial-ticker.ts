import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "editorial-ticker",
  category: "cms",
  name: "Editorial Ticker",
  description: "뉴스 와이어처럼 헤드라인이 세로로 흐르는 무한 티커. 호버하면 멈춰서 읽을 수 있다.",
  tags: ["cms", "ticker", "news", "editorial", "infinite", "premium"],
  trigger: "loop",
  triggerNote: "프레임 기반 래핑으로 이음새 없이 순환하고, 호버 시 부드럽게 감속·정지한다.",
  params: [
    { key: "speed", label: "Speed", control: "slider", min: 10, max: 80, step: 2, default: 28, unit: "px/s" },
    { key: "pauseOnHover", label: "Pause on Hover", control: "toggle", default: true },
    { key: "edgeFade", label: "Edge Fade", control: "toggle", default: true },
    { key: "accent", label: "Accent", control: "color", default: "#6366f1" },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: {
    reducedMotion: "자동 스크롤을 정지하고 항목을 정적 목록으로 렌더링한다.",
    notes: ["두 번째 복사본은 aria-hidden으로 중복 낭독을 막는다.", "items prop으로 시간·태그·헤드라인을 주입한다."],
  },
  install: { registryPath: "r/cms/editorial-ticker.json" },
  credits: { inspiredBy: "Framer marketplace 'Editorial Ticker'", license: "MIT" },
  demo: {},
  status: "stable",
  createdAt: "2026-07-20",
};
export default spec;
