export interface CategoryDef {
  slug: string;
  label: string;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "interaction", label: "Interaction" },
  { slug: "carousels", label: "Carousels" },
  { slug: "typography", label: "Typography" },
  { slug: "backgrounds", label: "Backgrounds" },
  { slug: "buttons", label: "Buttons" },
  { slug: "sections", label: "Sections" },
  { slug: "layout", label: "Layout" },
  { slug: "utilities", label: "Utilities" },
  { slug: "data", label: "Data" },
  { slug: "navigation", label: "Navigation" },
  { slug: "forms", label: "Forms" },
  { slug: "cms", label: "CMS" },
  { slug: "embeds", label: "Embeds" },
];
