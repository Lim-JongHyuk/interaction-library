# MotionKit — Claude Code 오케스트레이션

모션이 스펙 단위로 정의된 오픈 컴포넌트 갤러리. 라이브 프리뷰 · 파라미터 스튜디오 · copy/CLI 설치.
벤치마크: Animata / React Bits / OriginKit. 배포: Vercel.

## 참조 문서 (반드시 먼저 읽기)

| 문서 | 내용 | 읽는 시점 |
|---|---|---|
| `docs/00_PLAN_V1.md` | 전체 기획안 (IA·기능명세·아키텍처·로드맵) | 프로젝트 시작 시 1회 |
| `docs/01_WIREFRAMES.md` | 화면별 와이어프레임 + 컴포넌트 배치 | Phase 2, 4, 6 |
| `docs/02_MOTION_SPEC_SCHEMA.md` | 스펙 TS 타입·zod·codegen 계약 | Phase 3 (구현의 기준) |
| `docs/03_MVP_COMPONENTS.md` | P1 시드 컴포넌트 16종 상세 | Phase 5 |

## 확정된 의사결정 (기획안 §12 기본값 채택)

- 프레임워크: **React(Next.js App Router) 전용**. Vue/Framer 변형은 스코프 외.
- 수익 모델: **완전 무료·오픈** (Pro는 추후).
- MCP: **P3로 연기**. 단, 스펙 스키마에 `install.mcpRef` 필드는 예약해 둔다.
- 라이선스: MIT + Commons Clause 검토 → LICENSE 파일은 일단 MIT로 두고 TODO 주석.
- 코드 변형: **초기 react-ts-tw 1종만**. 스키마의 `variants` 배열은 유지(확장 대비).

## 기술 스택 (고정 — 임의 변경 금지)

- Next.js 15+ (App Router, RSC), TypeScript strict
- Tailwind CSS v4, `motion` (구 framer-motion) — 애니메이션은 이 라이브러리로 통일
- 코드 하이라이트: `shiki` (빌드타임)
- 스펙 저장: `content/specs/*.ts` (TS 객체, zod 검증) — MDX/CMS 쓰지 않음
- 검증: `zod`
- 패키지 매니저: pnpm

## Phase 오케스트레이션

각 Phase는 순서대로. Phase 완료 조건(✅ Gate)을 모두 통과한 뒤 커밋하고 다음으로.

### Phase 1 — Scaffold
- [ ] `pnpm create next-app` (TS, Tailwind, App Router, src 없음, `@/*` alias)
- [ ] `motion`, `zod`, `shiki`, `clsx`, `tailwind-merge` 설치, `cn()` 유틸 작성
- [ ] 디렉토리 골격 생성:
  ```
  app/                    # 라우트
  components/site/        # 사이트 자체 UI (sidebar, header, theme)
  components/studio/      # 프리뷰·파라미터 컨트롤·코드뷰
  registry/text/          # 배포 대상 모션 컴포넌트 (사용자에게 복사되는 코드)
  content/specs/          # 모션 스펙 (single source of truth)
  lib/                    # 스펙 로더, codegen, registry 빌더
  ```
- ✅ Gate: `pnpm build` 성공, `pnpm lint` 클린.

### Phase 2 — 레이아웃 & 디자인 시스템
- `docs/01_WIREFRAMES.md`의 공통 레이아웃(L0) 구현.
- [ ] 다크 우선 테마 토큰(CSS vars): neutral 베이스 + 액센트 인디고 1색
- [ ] 좌측 고정 사이드바(카테고리 트리) + 상단 헤더(검색 트리거, 테마 토글, GitHub 링크)
- [ ] 반응형: <1024px에서 사이드바 → 드로어
- ✅ Gate: 홈/문서 라우트에서 레이아웃 렌더, 라이트·다크 전환 정상.

### Phase 3 — 모션 스펙 엔진 (핵심)
`docs/02_MOTION_SPEC_SCHEMA.md`가 유일한 기준. 스키마를 임의로 바꾸지 말 것.
- [ ] `lib/spec.ts`: MotionSpec 타입 + zod 스키마 (문서의 코드 그대로)
- [ ] `lib/load-specs.ts`: `content/specs/*.ts` 전체 로드 + zod 검증(실패 시 빌드 에러)
- [ ] `lib/codegen.ts`: (spec, paramValues) → 사용 예시 코드 문자열 생성 (계약 §4)
- [ ] `components/studio/param-controls.tsx`: param 정의 → slider/select/color/toggle 자동 렌더
- ✅ Gate: 더미 스펙 1개로 컨트롤 렌더 + 값 변경 시 codegen 문자열 갱신되는 단위 테스트 통과.

### Phase 4 — 컴포넌트 상세 페이지
`docs/01_WIREFRAMES.md` S3 참조. 라우트: `app/docs/[category]/[slug]/page.tsx`
- [ ] 프리뷰 캔버스: 재생/리플레이 버튼, 격자 배경 토글, `key` 리마운트로 리플레이
- [ ] 파라미터 스튜디오 패널 (Phase 3 산출물 연결)
- [ ] 코드 탭: 컴포넌트 소스(shiki) + 사용 예시(codegen) + 복사 버튼
- [ ] 설치 탭: Manual(copy) / CLI(레지스트리 URL) — CLI URL은 Phase 7에서 활성화
- [ ] 정의서 섹션: trigger/params/a11y/credits 표 자동 렌더
- ✅ Gate: 더미 스펙으로 상세 페이지 전 섹션 동작.

### Phase 5 — 시드 컴포넌트 16종
`docs/03_MVP_COMPONENTS.md` 목록 순서대로. 컴포넌트마다:
1. `registry/text/<slug>.tsx` 구현 → 2. `content/specs/text-<slug>.ts` 스펙 작성 → 3. 상세 페이지에서 육안 확인
- **가드레일 (모든 컴포넌트 공통, 예외 없음)**
  - `useReducedMotion()` 감지 → 애니메이션 생략하고 최종 상태 즉시 렌더
  - in-view 트리거는 `whileInView` 또는 IntersectionObserver, 기본 1회 재생
  - 외부 의존성은 `motion` 하나만. GSAP 등 추가 금지
  - 모든 조정 가능 값은 props로 노출하고 스펙 `params`와 1:1 일치 (codegen 정합성)
- ✅ Gate: 16종 전부 스펙 zod 통과 + reduced-motion 동작 확인.

### Phase 6 — 카탈로그 & 홈
- [ ] `/components`: 그리드 카드(호버 시에만 모션 활성, 그 외 정적 포스터), 카테고리·태그 필터, 클라이언트 검색(fuse.js 허용)
- [ ] `/`: 히어로(자체 컴포넌트 조합 데모) + 신규/인기 섹션
- [ ] 성능: 그리드 카드의 모션은 hover/in-view 시에만 마운트. 초기 JS 예산: 상세 페이지 First Load < 180kB
- ✅ Gate: Lighthouse(모바일) Performance 90+ 목표, CLS < 0.1.

### Phase 7 — 레지스트리 & 배포
- [ ] `lib/build-registry.ts`: 스펙 → shadcn registry 규격 JSON 생성, `app/r/[...slug]/route.ts`로 서빙
  - 검증: `pnpm dlx shadcn@latest add <배포URL>/r/text/shuffle.json` 이 실제로 파일 생성해야 함
- [ ] SEO: 메타데이터, sitemap, OG 이미지(`next/og`로 스펙 기반 자동 생성)
- [ ] Vercel 배포: GitHub 연결, 프리뷰 배포 확인, 커스텀 도메인은 사용자 확인 후
- ✅ Gate: 프로덕션 URL에서 CLI 설치 e2e 성공.

## 작업 규칙

- 커밋 단위: Phase 내 체크박스 1~3개. 메시지: `feat(phase-N): ...`
- 막히면 임의 우회하지 말고, 스키마/와이어프레임 문서와 충돌 지점을 명시해 사용자에게 질문
- `registry/` 안의 코드는 "사용자 프로젝트로 복사되는 제품"이다 — 사이트 내부 유틸(`@/lib/...`) import 금지, `cn` 정도만 허용하고 파일 상단 주석으로 의존성 명시
- 새 라이브러리 추가는 사전 승인 필요 (fuse.js, next-themes 는 사전 승인됨)
