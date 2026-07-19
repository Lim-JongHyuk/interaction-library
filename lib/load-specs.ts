import { allSpecs } from "@/content/specs";
import { motionSpecSchema, type MotionSpec } from "@/lib/spec";

let cached: MotionSpec[] | null = null;

/** content/specs/index.ts의 전 스펙을 zod로 검증한다. 실패 시 빌드 에러. */
export function loadSpecs(): MotionSpec[] {
  if (cached) return cached;

  const slugs = new Set<string>();
  cached = allSpecs.map((spec) => {
    const parsed = motionSpecSchema.parse(spec) as MotionSpec;
    const key = `${parsed.category}/${parsed.slug}`;
    if (slugs.has(key)) {
      throw new Error(`duplicate spec slug: ${key}`);
    }
    slugs.add(key);
    return parsed;
  });

  return cached;
}

export function getSpec(category: string, slug: string): MotionSpec | undefined {
  return loadSpecs().find((s) => s.category === category && s.slug === slug);
}

export function getSpecsByCategory(category: string): MotionSpec[] {
  return loadSpecs().filter((s) => s.category === category);
}
