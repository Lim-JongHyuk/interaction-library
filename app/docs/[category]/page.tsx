import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { getSpecsByCategory } from "@/lib/load-specs";
import { ComponentCard } from "@/components/site/component-card";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
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
    <div className="flex flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">{meta.label}</h1>
      {specs.length === 0 ? (
        <p className="text-sm text-muted-foreground">아직 등록된 컴포넌트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec) => (
            <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} />
          ))}
        </div>
      )}
    </div>
  );
}
