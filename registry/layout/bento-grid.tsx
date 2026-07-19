"use client";

// deps: motion
import { motion, useReducedMotion } from "motion/react";

export interface BentoTile {
  title: string;
  description: string;
  span?: "sm" | "lg";
}

export interface BentoGridProps {
  tiles?: BentoTile[];
  lift?: number;
}

const DEFAULT_TILES: BentoTile[] = [
  { title: "Realtime sync", description: "Every edit streams instantly to your team.", span: "lg" },
  { title: "Type-safe specs", description: "Zod-validated at build time.", span: "sm" },
  { title: "Edge deploy", description: "Global CDN, zero cold starts.", span: "sm" },
  { title: "Motion-first", description: "Every interaction is a first-class citizen.", span: "sm" },
];

export function BentoGrid({ tiles = DEFAULT_TILES, lift = 6 }: BentoGridProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid w-full max-w-2xl grid-cols-3 gap-3">
      {tiles.map((tile, i) => (
        <motion.div
          key={tile.title}
          initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          whileHover={reducedMotion ? undefined : { y: -lift }}
          className={
            "flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-lg " +
            (tile.span === "lg" ? "col-span-2 row-span-1" : "col-span-1")
          }
        >
          <div className="h-8 w-8 rounded-lg bg-accent/20" />
          <div>
            <p className="text-sm font-semibold">{tile.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{tile.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
