"use client";

// deps: none
import { useEffect, useRef } from "react";

export interface KineticLinesProps {
  lineCount?: number;
  amplitude?: number;
  influence?: number;
  speed?: number;
  color?: string;
}

/**
 * 수평 유선들이 사인파로 흐르고, 커서 근처에서는 밀려나듯 휘어지는
 * 캔버스 기반 키네틱 라인 필드.
 */
export function KineticLines({
  lineCount = 26,
  amplitude = 10,
  influence = 110,
  speed = 1,
  color = "#818cf8",
}: KineticLinesProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = wrapper!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.round(rect.width * dpr));
      canvas!.height = Math.max(1, Math.round(rect.height * dpr));
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    let phase = 0;

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);
      ctx!.lineWidth = 1 * dpr;

      const p = pointerRef.current;
      const inf = influence * dpr;
      const amp = amplitude * dpr;
      const segments = 90;

      for (let li = 0; li < lineCount; li++) {
        const baseY = ((li + 1) / (lineCount + 1)) * h;
        const alpha = 0.25 + 0.5 * Math.sin((li / lineCount) * Math.PI);
        ctx!.strokeStyle = color;
        ctx!.globalAlpha = alpha;
        ctx!.beginPath();
        for (let s = 0; s <= segments; s++) {
          const x = (s / segments) * w;
          // 기본 사인 흐름
          let y = baseY + Math.sin(phase + s * 0.22 + li * 0.6) * amp;
          // 커서 반발 (가우시안 범프)
          const dx = x - p.x;
          const dy = baseY - p.y;
          const dist2 = dx * dx + dy * dy;
          const push = Math.exp(-dist2 / (inf * inf)) * inf * 0.45;
          y += dy >= 0 ? push : -push;
          if (s === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;
    }

    if (reduced) {
      draw();
    } else {
      const loop = () => {
        phase += 0.015 * speed;
        draw();
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerRef.current = { x: (e.clientX - rect.left) * dpr, y: (e.clientY - rect.top) * dpr };
    }
    function onPointerLeave() {
      pointerRef.current = { x: -9999, y: -9999 };
    }
    wrapper.addEventListener("pointermove", onPointerMove);
    wrapper.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      wrapper.removeEventListener("pointermove", onPointerMove);
      wrapper.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [lineCount, amplitude, influence, speed, color]);

  return (
    <div ref={wrapperRef} className="relative h-full w-full overflow-hidden rounded-xl bg-[#0a0a0f]">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
