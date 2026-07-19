"use client";

// deps: none
import { useId } from "react";

export interface AuroraMeshProps {
  speed?: number;
  intensity?: number;
  colorA?: string;
  colorB?: string;
  colorC?: string;
}

export function AuroraMesh({
  speed = 12,
  intensity = 0.55,
  colorA = "#4f46e5",
  colorB = "#a855f7",
  colorC = "#22d3ee",
}: AuroraMeshProps) {
  const id = useId().replace(/[:]/g, "");
  const a1 = `motionkit-aurora-a-${id}`;
  const a2 = `motionkit-aurora-b-${id}`;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#08080b]">
      <style>{`
        @keyframes ${a1} { 0%,100% { transform: translate(-10%,-10%) scale(1); } 50% { transform: translate(10%,5%) scale(1.15); } }
        @keyframes ${a2} { 0%,100% { transform: translate(5%,10%) scale(1.1); } 50% { transform: translate(-15%,-5%) scale(0.95); } }
        @media (prefers-reduced-motion: reduce) {
          .${a1}, .${a2} { animation: none !important; }
        }
      `}</style>
      <div
        className={a1}
        style={{
          position: "absolute",
          inset: "-20%",
          background: `radial-gradient(closest-side, ${colorA}, transparent)`,
          opacity: intensity,
          filter: "blur(40px)",
          animation: `${a1} ${speed}s ease-in-out infinite`,
        }}
      />
      <div
        className={a2}
        style={{
          position: "absolute",
          inset: "-20%",
          background: `radial-gradient(closest-side, ${colorB}, transparent 70%), radial-gradient(closest-side, ${colorC}, transparent 70%)`,
          backgroundPosition: "70% 30%, 20% 80%",
          backgroundSize: "60% 60%, 55% 55%",
          backgroundRepeat: "no-repeat",
          opacity: intensity,
          filter: "blur(50px)",
          animation: `${a2} ${speed * 1.3}s ease-in-out infinite`,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]" />
    </div>
  );
}
