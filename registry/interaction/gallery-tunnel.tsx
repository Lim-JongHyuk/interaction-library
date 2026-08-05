"use client";

import ImageBox from "@/components/originkit/ui/gallery-tunnel";

export type GalleryTunnelProps = Parameters<typeof ImageBox>[0];

/** Catalog adapter for the independent Originkit Gallery Tunnel source. */
export function GalleryTunnel(props: GalleryTunnelProps) {
  return <ImageBox {...props} />;
}
