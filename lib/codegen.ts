import type { MotionSpec } from "@/lib/spec";

export type ParamValues = Record<string, string | number | boolean>;

function pascalCase(input: string): string {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

/** registry 소스에서 실제 export된 컴포넌트 이름을 추출한다.
 * spec.name을 pascalCase로 유추하면 "Parallax Tilt Card" → "ParallaxTiltCard"처럼
 * 실제 export(예: 파일명 기반 축약 이름)와 어긋나는 경우가 많아, 소스에서 직접 읽는다. */
function extractComponentName(source: string, fallback: string): string {
  const match = source.match(/export\s+function\s+([A-Za-z_$][\w$]*)/) ??
    source.match(/export\s+const\s+([A-Za-z_$][\w$]*)\s*[:=]/);
  return match ? match[1] : fallback;
}

export function defaultParamValues(spec: MotionSpec): ParamValues {
  return Object.fromEntries(spec.params.map((p) => [p.key, p.default]));
}

function formatPropValue(value: string | number | boolean): string {
  if (typeof value === "number") return `{${value}}`;
  if (typeof value === "boolean") return `{${value}}`;
  return `"${value}"`;
}

function formatProp(key: string, value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? key : `${key}={false}`;
  }
  return `${key}=${formatPropValue(value)}`;
}

/** (spec, values, source) → Usage 탭에 표시할 코드 문자열.
 * import 경로는 CLI 설치 대상(components/motionkit/{spec.slug}.tsx)과 반드시 일치해야 하므로
 * spec.slug를 그대로 쓴다 (spec.name을 kebab-case한 값과는 다를 수 있음). */
export function generateUsageCode(spec: MotionSpec, values: ParamValues, source: string): string {
  const componentName = extractComponentName(source, pascalCase(spec.name));
  const importSlug = spec.slug;

  // params가 같은 키를 다루면 studio 값이 우선 — 둘 다 내보내면 JSX prop이 중복된다
  const paramKeys = new Set(spec.params.map((p) => p.key));
  const demoProps = Object.entries(spec.demo)
    .filter(([k, v]) => v !== undefined && !paramKeys.has(k))
    .map(([k, v]) => formatProp(k, v as string | number | boolean));

  const changedProps = spec.params
    .filter((p) => values[p.key] !== undefined && values[p.key] !== p.default)
    .map((p) => formatProp(p.key, values[p.key]));

  const props = [...demoProps, ...changedProps];
  const tag = props.length > 0 ? `<${componentName} ${props.join(" ")} />` : `<${componentName} />`;

  return [
    `import { ${componentName} } from "@/components/motionkit/${importSlug}";`,
    "",
    tag,
  ].join("\n");
}
