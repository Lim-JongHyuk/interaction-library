"use client";

import EmojiBurst, { type EmojiBurstProps } from "@/components/originkit/ui/emojiburst";

export type { EmojiBurstProps };

export function EmojiBurstComponent(props: EmojiBurstProps) {
  return <EmojiBurst {...props} />;
}
