# MotionKit

**Motion, defined.** — 움직임을 스펙으로 정의하고, 라이브로 미리보고, copy 한 번 또는 CLI로 설치하는 오픈 모션 컴포넌트 갤러리.

42개 컴포넌트 · 13개 카테고리 (Typography, Interaction, Backgrounds, Carousels, Data, Sections …)

## 특징

- **스펙이 단일 소스** — 모든 컴포넌트는 `content/specs/*.ts`의 MotionSpec(TS 객체, zod 검증)으로 정의된다. 파라미터 스튜디오, 사용 코드 생성(codegen), 레지스트리 JSON이 전부 이 스펙에서 파생된다.
- **파라미터 스튜디오** — duration·stagger·easing 등을 슬라이더/셀렉트로 조정하면 사용 예시 코드가 그 값 그대로 갱신된다.
- **두 가지 설치 방식** — 소스 복사(Manual) 또는 shadcn CLI:
  ```bash
  pnpm dlx shadcn@latest add <site-url>/r/typography/shuffle.json
  ```
- **접근성 기본 내장** — 모든 컴포넌트가 `useReducedMotion()`을 감지해 애니메이션을 생략하고 최종 상태를 즉시 렌더한다.
- **의존성 최소** — 배포되는 컴포넌트의 외부 의존성은 `motion` 하나 (일부 3D 컴포넌트는 `three`).

## 기술 스택

Next.js (App Router, RSC) · TypeScript strict · Tailwind CSS v4 · [motion](https://motion.dev) · shiki(빌드타임 하이라이트) · zod · pnpm

## 개발

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build
pnpm lint
```

환경 변수(선택):

| 변수 | 용도 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 배포 도메인 (메타데이터·레지스트리 URL 기준) |
| `NEXT_PUBLIC_GITHUB_URL` | GitHub 저장소 링크 (미설정 시 UI에서 숨김) |

## 디렉토리 구조

```
app/                  # 라우트 (홈, /components, /docs/[category]/[slug], /r/... 레지스트리)
components/site/      # 사이트 UI (사이드바, 헤더, 카탈로그, 테마)
components/studio/    # 프리뷰·파라미터 컨트롤·코드 뷰
registry/<category>/  # 배포 대상 모션 컴포넌트 (사용자 프로젝트로 복사되는 코드)
content/specs/        # 모션 스펙 — single source of truth
lib/                  # 스펙 로더, codegen, 레지스트리 빌더
docs/                 # 기획·와이어프레임·스키마 문서
```

`registry/` 안의 코드는 사용자 프로젝트로 복사되는 "제품"이다 — 사이트 내부 유틸을 import하지 않으며, 파일 상단 주석으로 의존성을 명시한다.

## 컴포넌트 추가하기

1. `registry/<category>/<slug>.tsx` 구현 (`useReducedMotion` 폴백 필수)
2. `content/specs/<category>-<slug>.ts` 스펙 작성 후 `content/specs/index.ts`에 등록
3. `lib/registry-components.tsx`에 컴포넌트 매핑 추가
4. 상세 페이지(`/docs/<category>/<slug>`)에서 육안 확인

스펙 스키마 계약은 `docs/02_MOTION_SPEC_SCHEMA.md` 참조.

## 라이선스

[MIT](./LICENSE)
