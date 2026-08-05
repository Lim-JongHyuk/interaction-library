"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";

export function PanelResizeHandle({ onResize, className, label }: { onResize: (delta: number) => void; className?: string; label: string }) {
  const previousX = useRef<number | null>(null);
  return <div role="separator" aria-orientation="vertical" aria-label={label} tabIndex={0}
    className={cn("group absolute z-30 hidden w-2 cursor-col-resize touch-none lg:block", className)}
    onPointerDown={(event) => { previousX.current = event.clientX; event.currentTarget.setPointerCapture(event.pointerId); document.body.style.userSelect = "none"; }}
    onPointerMove={(event) => { if (previousX.current === null) return; onResize(event.clientX - previousX.current); previousX.current = event.clientX; }}
    onPointerUp={() => { previousX.current = null; document.body.style.userSelect = ""; }}
    onPointerCancel={() => { previousX.current = null; document.body.style.userSelect = ""; }}
    onKeyDown={(event) => { if (event.key === "ArrowLeft") { onResize(-16); event.preventDefault(); } if (event.key === "ArrowRight") { onResize(16); event.preventDefault(); } }}
  ><span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors group-hover:bg-accent group-focus-visible:bg-accent" /></div>;
}
