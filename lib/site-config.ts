export const siteConfig = {
  name: "MotionKit",
  title: "MotionKit — Motion, defined.",
  tagline: "Motion, defined.",
  description:
    "움직임을 스펙으로 정의하고, 라이브로 미리보고, copy 한 번 또는 CLI로 설치하는 오픈 모션 컴포넌트 갤러리.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://motionkit.example.com",
  /** 미설정 시 GitHub 링크는 UI에서 렌더하지 않는다. */
  github: process.env.NEXT_PUBLIC_GITHUB_URL,
};
