"use client";

import type { CSSProperties } from "react";
import Orb from "@/components/originkit/ui/cosmic-orb";

export type CosmicOrbArchetype = "auto" | "spiral" | "nebula" | "core" | "deep";

export interface CosmicOrbProps {
  size?: number;
  archetype?: CosmicOrbArchetype;
  background?: string;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  starColor?: string;
  speed?: number;
  spin?: number;
  lens?: boolean;
  lensAmount?: number;
  lensColor?: string;
  style?: CSSProperties;
}

/**
 * The catalog-facing adapter keeps the Studio prop names while rendering the
 * exact source copied by `originkit add cosmic-orb` into this project.
 */
export function CosmicOrb({
  size = 340,
  archetype = "auto",
  background = "#000000",
  colorA = "#65d9ff",
  colorB = "#9f61ff",
  colorC = "#fb63be",
  speed = 50,
  spin = 50,
  lens = true,
  lensAmount = 45,
  style,
}: CosmicOrbProps) {
  return (
    <Orb
      size={size}
      archetype={archetype}
      background={background}
      palette={{
        anchor: "#6A3CFF",
        colorA,
        colorB,
        colorC,
      }}
      speed={speed}
      spin={spin}
      lens={lens}
      lensAmount={lensAmount}
      style={style}
    />
  );
}
