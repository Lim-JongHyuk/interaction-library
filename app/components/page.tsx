import { loadSpecs } from "@/lib/load-specs";
import { CatalogView } from "@/components/site/catalog-view";

export const metadata = { title: "Components — MotionKit" };

export default function ComponentsPage() {
  const specs = loadSpecs();

  return <CatalogView specs={specs} />;
}
