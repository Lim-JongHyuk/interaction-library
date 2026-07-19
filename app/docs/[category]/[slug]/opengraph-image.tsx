import { ImageResponse } from "next/og";
import { getSpec, loadSpecs } from "@/lib/load-specs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return loadSpecs().map((spec) => ({ category: spec.category, slug: spec.slug }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const spec = getSpec(category, slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0a0a0b",
          color: "#f2f2f3",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, color: "#818cf8" }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: "#818cf8" }} />
          MotionKit
        </div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 600, marginTop: 32 }}>
          {spec?.name ?? "Component"}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#9a9aa2", marginTop: 16 }}>
          {spec?.description ?? ""}
        </div>
      </div>
    ),
    size
  );
}
