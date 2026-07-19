import { NextResponse } from "next/server";
import { getSpec, loadSpecs } from "@/lib/load-specs";
import { buildRegistryItem } from "@/lib/build-registry";

export function generateStaticParams() {
  return loadSpecs().map((spec) => ({ slug: [spec.category, `${spec.slug}.json`] }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const [category, filename] = slug;
  if (!category || !filename?.endsWith(".json")) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const spec = getSpec(category, filename.replace(/\.json$/, ""));
  if (!spec) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(buildRegistryItem(spec));
}
