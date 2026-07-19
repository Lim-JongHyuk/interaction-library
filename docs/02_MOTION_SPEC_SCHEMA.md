# 02. Motion Spec 스키마 — 실제 데이터 구조

기획안 §5의 구현 확정본. **이 파일이 single source of truth**이며,
프리뷰·스튜디오·codegen·레지스트리·(추후)MCP가 전부 이 타입에서 파생된다.

## 1. TypeScript 타입 (`lib/spec.ts`)

```ts
export type Trigger =
  | "mount" | "in-view" | "hover" | "click" | "scroll" | "drag" | "loop";

export type Category =
  | "text" | "reveal" | "scroll" | "hover" | "image" | "background" | "ui";

/** 스튜디오 컨트롤 + codegen이 공유하는 파라미터 정의 */
export type ParamDef =
  | { key: string; label: string; control: "slider";
      min: number; max: number; step: number; default: number; unit?: string }
  | { key: string; label: string; control: "number";
      min?: number; max?: number; default: number }
  | { key: string; label: string; control: "select";
      options: readonly string[]; default: string }
  | { key: string; label: string; control: "color"; default: string }
  | { key: string; label: string; control: "toggle"; default: boolean }
  | { key: string; label: string; control: "text"; default: string };

export interface MotionSpec {
  /** URL·레지스트리 경로: `${category}/${slug}` */
  slug: string;                 // 예: "shuffle" (category 제외한 마지막 세그먼트)
  category: Category;
  name: string;                 // "Shuffle Text"
  description: string;          // 1문장
  tags: string[];
  trigger: Trigger;
  triggerNote?: string;         // "뷰포트 진입 시 1회, hover로 재생 가능"

  params: ParamDef[];

  dependencies: ("motion")[];   // 현 단계에선 motion만 허용. 빈 배열 = 무의존
  variants: ["react-ts-tw"];    // P1 고정. 배열인 이유: 추후 확장

  a11y: {
    reducedMotion: string;      // reduced-motion 시 동작 서술 (필수)
    notes?: string[];
  };

  install: {
    registryPath: string;       // "r/text/shuffle.json"
    mcpRef?: string;            // P3 예약. 지금은 항상 undefined
  };

  credits?: { author?: string; inspiredBy?: string; license?: string };

  /** 프리뷰에서 컴포넌트에 넘길 데모용 고정 props (params 외의 것) */
  demo: { text?: string; [k: string]: unknown };

  status: "stable" | "beta";
  createdAt: string;            // "2026-07-18"
}
```

## 2. zod 스키마 (검증 — 빌드 시 전 스펙 통과 필수)

```ts
import { z } from "zod";

const base = { key: z.string().regex(/^[a-z][a-zA-Z0-9]*$/), label: z.string() };

export const paramDefSchema = z.discriminatedUnion("control", [
  z.object({ ...base, control: z.literal("slider"),
    min: z.number(), max: z.number(), step: z.number().positive(),
    default: z.number(), unit: z.string().optional() })
    .refine(p => p.default >= p.min && p.default <= p.max,
      "default must be within [min, max]"),
  z.object({ ...base, control: z.literal("number"),
    min: z.number().optional(), max: z.number().optional(), default: z.number() }),
  z.object({ ...base, control: z.literal("select"),
    options: z.array(z.string()).min(2), default: z.string() })
    .refine(p => p.options.includes(p.default), "default must be an option"),
  z.object({ ...base, control: z.literal("color"),
    default: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/) }),
  z.object({ ...base, control: z.literal("toggle"), default: z.boolean() }),
  z.object({ ...base, control: z.literal("text"), default: z.string() }),
]);

export const motionSpecSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: z.enum(["text","reveal","scroll","hover","image","background","ui"]),
  name: z.string().min(2),
  description: z.string().min(8),
  tags: z.array(z.string()).min(1),
  trigger: z.enum(["mount","in-view","hover","click","scroll","drag","loop"]),
  triggerNote: z.string().optional(),
  params: z.array(paramDefSchema),
  dependencies: z.array(z.literal("motion")),
  variants: z.tuple([z.literal("react-ts-tw")]),
  a11y: z.object({ reducedMotion: z.string().min(8),
                   notes: z.array(z.string()).optional() }),
  install: z.object({ registryPath: z.string(), mcpRef: z.string().optional() }),
  credits: z.object({ author: z.string().optional(),
                      inspiredBy: z.string().optional(),
                      license: z.string().optional() }).optional(),
  demo: z.record(z.string(), z.unknown()),
  status: z.enum(["stable","beta"]),
  createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
// param key 는 컴포넌트 props 와 1:1 — 중복 금지
.refine(s => new Set(s.params.map(p => p.key)).size === s.params.length,
  "duplicate param keys");
```

## 3. 예시 스펙 (`content/specs/text-shuffle.ts`)

```ts
import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "shuffle",
  category: "text",
  name: "Shuffle Text",
  description: "글자가 무작위로 뒤섞이다가 원래 텍스트로 정착하는 효과.",
  tags: ["text", "hero", "scramble", "reveal"],
  trigger: "in-view",
  triggerNote: "뷰포트 진입 시 1회 재생. hoverReplay로 재호버 재생 가능.",
  params: [
    { key: "duration", label: "Duration", control: "slider",
      min: 0.1, max: 2, step: 0.05, default: 0.6, unit: "s" },
    { key: "stagger", label: "Stagger", control: "slider",
      min: 0, max: 0.2, step: 0.01, default: 0.03, unit: "s" },
    { key: "shuffleTimes", label: "Shuffles", control: "slider",
      min: 1, max: 10, step: 1, default: 4 },
    { key: "charset", label: "Charset", control: "select",
      options: ["upper", "lower", "alnum", "binary"], default: "upper" },
    { key: "hoverReplay", label: "Replay on hover", control: "toggle",
      default: false },
  ],
  dependencies: ["motion"],
  variants: ["react-ts-tw"],
  a11y: { reducedMotion: "셔플을 생략하고 최종 텍스트를 즉시 표시한다." },
  install: { registryPath: "r/text/shuffle.json" },
  credits: { inspiredBy: "reactbits.dev shuffle", license: "MIT" },
  demo: { text: "MOTION, DEFINED." },
  status: "stable",
  createdAt: "2026-07-18",
};
export default spec;
```

## 4. codegen 계약 (`lib/codegen.ts`)

입력 `(spec, values)` → 출력: Usage 탭에 표시할 코드 문자열.

규칙:
1. import 라인: `import { ShuffleText } from "@/components/motionkit/shuffle-text";`
   (컴포넌트명 = slug의 PascalCase + 카테고리 접미 규칙은 두지 않음. registry 파일의 export명과 일치시킬 것)
2. `values[key] === param.default` 인 props는 **출력 생략** — 기본값은 코드에 노출하지 않는다.
3. 값 포맷: number 그대로 / string은 따옴표 / boolean true는 `hoverReplay` 단독 표기.
4. `demo.text` 등 데모 고정값은 children/props로 포함.

예 (`duration`만 0.8로 변경 시):

```tsx
import { ShuffleText } from "@/components/motionkit/shuffle-text";

<ShuffleText text="MOTION, DEFINED." duration={0.8} />
```

## 5. 파일 규약

- 스펙: `content/specs/<category>-<slug>.ts`, `export default spec`
- 컴포넌트: `registry/<category>/<slug>.tsx`, named export PascalCase
- 컴포넌트 props 인터페이스는 spec.params의 key·타입과 **정확히 1:1**. 어긋나면 스튜디오·codegen이 깨진다 — Phase 5 리뷰 체크 항목.
