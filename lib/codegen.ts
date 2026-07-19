import type { MotionSpec } from "@/lib/spec";

export type ParamValues = Record<string, string | number | boolean>;

function pascalCase(input: string): string {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join("");
}

function kebabCase(input: string): string {
  return input
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .join("-")
    .toLowerCase();
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

/** (spec, values) → Usage 탭에 표시할 코드 문자열. */
export function generateUsageCode(spec: MotionSpec, values: ParamValues): string {
  const componentName = pascalCase(spec.name);
  const importSlug = kebabCase(spec.name);

  const demoProps = Object.entries(spec.demo)
    .filter(([, v]) => v !== undefined)
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
