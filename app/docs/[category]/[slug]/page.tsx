import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSpec, loadSpecs } from "@/lib/load-specs";
import { highlightTsx } from "@/lib/highlight";
import { DetailView } from "@/components/studio/detail-view";

export function generateStaticParams() {
  return loadSpecs().map((spec) => ({ category: spec.category, slug: spec.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const spec = getSpec(category, slug);
  if (!spec) return {};

  return {
    title: spec.name,
    description: spec.description,
    openGraph: { title: spec.name, description: spec.description },
  };
}

export default async function ComponentDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const spec = getSpec(category, slug);
  if (!spec) notFound();

  const sourcePath = path.join(process.cwd(), "registry", category, `${slug}.tsx`);
  let source = "";
  let sourceHtml: string | null = null;
  try {
    source = await readFile(sourcePath, "utf-8");
    sourceHtml = await highlightTsx(source);
  } catch {
    source = "// 소스가 아직 준비되지 않았습니다.";
  }

  return <DetailView spec={spec} source={source} sourceHtml={sourceHtml} />;
}
