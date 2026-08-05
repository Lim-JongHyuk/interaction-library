import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { getSpecsByCategory } from "@/lib/load-specs";
import { ComponentCard } from "@/components/site/component-card";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = CATEGORIES.find((c) => c.slug === category);
  if (!meta) return {};
  return {
    title: meta.label,
    description: `${meta.label} 카테고리의 모션 컴포넌트 모음.`,
  };
}

export default async function CategoryIndexPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const meta = CATEGORIES.find((c) => c.slug === category);
  if (!meta) notFound();

  const specs = getSpecsByCategory(category);

  return (
    <div className="mk-home flex flex-col gap-6 px-4 py-7 md:px-6 md:py-8">
      <div className="border-b border-border pb-4">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-accent">Component category</p>
        <h1 className="text-2xl font-semibold tracking-tight">{meta.label}</h1>
      </div>
      {specs.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 등록된 컴포넌트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {specs.map((spec) => (
            <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} gallery />
          ))}
        </div>
      )}
    </div>
  );
}
