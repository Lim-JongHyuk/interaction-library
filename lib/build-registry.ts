import { readFileSync } from "node:fs";
import path from "node:path";
import type { MotionSpec } from "@/lib/spec";

interface RegistryFile {
  path: string;
  type: "registry:component" | "registry:lib";
  target: string;
  content: string;
}

export interface RegistryItem {
  $schema: string;
  name: string;
  type: "registry:component";
  title: string;
  description: string;
  dependencies: string[];
  files: RegistryFile[];
}

/** spec → shadcn registry-item JSON (self-contained: 각 파일의 content 포함). */
export function buildRegistryItem(spec: MotionSpec): RegistryItem {
  const componentPath = path.join(process.cwd(), "registry", spec.category, `${spec.slug}.tsx`);
  const componentSource = readFileSync(componentPath, "utf-8");

  const files: RegistryFile[] = [
    {
      path: `registry/${spec.category}/${spec.slug}.tsx`,
      type: "registry:component",
      target: `components/motionkit/${spec.slug}.tsx`,
      content: componentSource,
    },
  ];

  if (componentSource.includes(`from "./_lib/split"`)) {
    const splitPath = path.join(process.cwd(), "registry", spec.category, "_lib", "split.ts");
    files.push({
      path: `registry/${spec.category}/_lib/split.ts`,
      type: "registry:lib",
      target: `components/motionkit/_lib/split.ts`,
      content: readFileSync(splitPath, "utf-8"),
    });
  }

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: spec.slug,
    type: "registry:component",
    title: spec.name,
    description: spec.description,
    dependencies: spec.dependencies,
    files,
  };
}
