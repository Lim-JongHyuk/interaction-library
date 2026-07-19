# 03. P1 MVP 컴포넌트 — Text 카테고리 16종

베타 출시 범위. 구현 순서 = 표 순서(쉬운 것 → 복잡한 것)로, 초반에 파이프라인 검증을 마친다.
모든 컴포넌트 공통: deps `motion` 이하, reduced-motion 대체 필수, props = spec.params 1:1.

| # | slug | 이름 | trigger | 핵심 params | 난이도 | 비고 |
|---|------|------|---------|-------------|--------|------|
| 1 | fade-up | Fade Up Text | in-view | duration, delay, distance | ★ | 파이프라인 검증용 1호 |
| 2 | blur-in | Blur In Text | in-view | duration, blurAmount | ★ | |
| 3 | typewriter | Typewriter | in-view | speed, cursor(toggle), loop(toggle) | ★ | reduced-motion: 전체 즉시 표시 |
| 4 | gradient-flow | Animated Gradient | loop | speed, colors 미노출→preset(select) | ★ | CSS keyframe 위주, JS 최소 |
| 5 | jitter | Jitter Text | loop | duration, intensity, rotate(toggle) | ★ | 레퍼런스1 계승 |
| 6 | split-reveal | Split Reveal | in-view | duration, stagger, direction(select) | ★★ | 글자 단위 분해 유틸 공용화 |
| 7 | shuffle | Shuffle Text | in-view | duration, stagger, shuffleTimes, charset, hoverReplay | ★★ | 레퍼런스2 계승, 스키마 예시와 동일 |
| 8 | scramble-hover | Scramble on Hover | hover | speed, charset | ★★ | 7의 로직 재사용 |
| 9 | wave | Wave Text | loop | amplitude, speed, stagger | ★★ | |
| 10 | glitch | Glitch Text | loop | intensity, interval, rgbSplit(toggle) | ★★ | 과도한 깜빡임 금지(광과민 주의 노트) |
| 11 | counter | Count Up | in-view | from, to, duration, decimals | ★★ | 숫자 전용, spring 이징 |
| 12 | rotate-words | Rotating Words | loop | words(text, 콤마구분), interval, direction(select) | ★★ | |
| 13 | blur-out-up | Blur Out Up | in-view | duration, stagger | ★★ | 6의 분해 유틸 재사용 |
| 14 | mask-reveal | Mask Reveal | in-view | duration, angle, delay | ★★★ | clip-path 기반 |
| 15 | magnetic-chars | Magnetic Characters | hover | strength, radius | ★★★ | pointer 추적, 모바일은 비활성 |
| 16 | text-path-hint | Char Stagger Hero | in-view | duration, stagger, ease(select) | ★★★ | 홈 히어로에 사용할 조합형 |

## 공용 유틸 (registry 내부 중복 방지)

- `registry/text/_lib/split.ts` — 텍스트 → 글자/단어 span 분해 (grapheme 안전: `Intl.Segmenter`)
- 각 컴포넌트 파일은 이 유틸을 **인라인 복사** 방식으로 포함하거나(레지스트리 파일 묶음), registry JSON에서 files 배열로 함께 배포. shadcn registry의 다중 파일 배포 사용.

## 컴포넌트별 완료 정의 (DoD)

1. `registry/text/<slug>.tsx` — TS strict 통과, props 주석
2. `content/specs/text-<slug>.ts` — zod 통과
3. 상세 페이지에서: 프리뷰 재생/리플레이 정상, 스튜디오 전 컨트롤 동작, Usage codegen 정확
4. `prefers-reduced-motion: reduce` 에뮬레이션에서 대체 동작 확인
5. 라이트/다크 양쪽에서 가독성 확인

## 데모 카피 통일

프리뷰 기본 텍스트는 컴포넌트 성격별로:
- 히어로형(1,6,7,14,16): `MOTION, DEFINED.`
- 루프형(4,5,9,10,12): `motionkit`
- 유틸형(3,11): 각각 `Building interfaces that move.` / `12,480`
