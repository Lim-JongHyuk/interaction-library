import { z } from "zod";

export type Trigger = "mount" | "in-view" | "hover" | "click" | "scroll" | "drag" | "loop";

export type Category =
  | "interaction"
  | "carousels"
  | "typography"
  | "backgrounds"
  | "buttons"
  | "sections"
  | "layout"
  | "utilities"
  | "data"
  | "navigation"
  | "forms"
  | "cms"
  | "embeds";

/** 스튜디오 컨트롤 + codegen이 공유하는 파라미터 정의 */
export type ParamDef =
  | {
      key: string;
      label: string;
      control: "slider";
      min: number;
      max: number;
      step: number;
      default: number;
      unit?: string;
    }
  | { key: string; label: string; control: "number"; min?: number; max?: number; default: number }
  | { key: string; label: string; control: "select"; options: readonly string[]; default: string }
  | { key: string; label: string; control: "color"; default: string }
  | { key: string; label: string; control: "toggle"; default: boolean }
  | { key: string; label: string; control: "text"; default: string };

export interface MotionSpec {
  /** URL·레지스트리 경로: `${category}/${slug}` */
  slug: string; // 예: "shuffle" (category 제외한 마지막 세그먼트)
  category: Category;
  name: string; // "Shuffle Text"
  description: string; // 1문장
  tags: string[];
  trigger: Trigger;
  triggerNote?: string; // "뷰포트 진입 시 1회, hover로 재생 가능"

  params: ParamDef[];

  dependencies: ("motion" | "three")[];
  variants: ["react-ts-tw"]; // P1 고정. 배열인 이유: 추후 확장

  a11y: {
    reducedMotion: string; // reduced-motion 시 동작 서술 (필수)
    notes?: string[];
  };

  install: {
    registryPath: string; // "r/text/shuffle.json"
    mcpRef?: string; // P3 예약. 지금은 항상 undefined
  };

  credits?: { author?: string; inspiredBy?: string; license?: string };

  /** 프리뷰에서 컴포넌트에 넘길 데모용 고정 props (params 외의 것) */
  demo: { text?: string; [k: string]: unknown };

  status: "stable" | "beta";
  createdAt: string; // "2026-07-18"
}

const base = { key: z.string().regex(/^[a-z][a-zA-Z0-9]*$/), label: z.string() };

export const paramDefSchema = z.discriminatedUnion("control", [
  z
    .object({
      ...base,
      control: z.literal("slider"),
      min: z.number(),
      max: z.number(),
      step: z.number().positive(),
      default: z.number(),
      unit: z.string().optional(),
    })
    .refine((p) => p.default >= p.min && p.default <= p.max, "default must be within [min, max]"),
  z.object({
    ...base,
    control: z.literal("number"),
    min: z.number().optional(),
    max: z.number().optional(),
    default: z.number(),
  }),
  z
    .object({
      ...base,
      control: z.literal("select"),
      options: z.array(z.string()).min(2),
      default: z.string(),
    })
    .refine((p) => p.options.includes(p.default), "default must be an option"),
  z.object({
    ...base,
    control: z.literal("color"),
    default: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  }),
  z.object({ ...base, control: z.literal("toggle"), default: z.boolean() }),
  z.object({ ...base, control: z.literal("text"), default: z.string() }),
]);

export const motionSpecSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    category: z.enum([
      "interaction",
      "carousels",
      "typography",
      "backgrounds",
      "buttons",
      "sections",
      "layout",
      "utilities",
      "data",
      "navigation",
      "forms",
      "cms",
      "embeds",
    ]),
    name: z.string().min(2),
    description: z.string().min(8),
    tags: z.array(z.string()).min(1),
    trigger: z.enum(["mount", "in-view", "hover", "click", "scroll", "drag", "loop"]),
    triggerNote: z.string().optional(),
    params: z.array(paramDefSchema),
    dependencies: z.array(z.enum(["motion", "three"])),
    variants: z.tuple([z.literal("react-ts-tw")]),
    a11y: z.object({
      reducedMotion: z.string().min(8),
      notes: z.array(z.string()).optional(),
    }),
    install: z.object({ registryPath: z.string(), mcpRef: z.string().optional() }),
    credits: z
      .object({
        author: z.string().optional(),
        inspiredBy: z.string().optional(),
        license: z.string().optional(),
      })
      .optional(),
    demo: z.record(z.string(), z.unknown()),
    status: z.enum(["stable", "beta"]),
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  // param key 는 컴포넌트 props 와 1:1 — 중복 금지
  .refine(
    (s) => new Set(s.params.map((p) => p.key)).size === s.params.length,
    "duplicate param keys"
  );
