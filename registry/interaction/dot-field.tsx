"use client";

import { useEffect, useRef } from "react";

export interface DotFieldProps {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
}

type Dot = { x: number; y: number; dx: number; dy: number; vx: number; vy: number };

export function DotField({ dotRadius = 1.5, dotSpacing = 14, cursorRadius = 500, cursorForce = 0.1, bulgeOnly = true, bulgeStrength = 67, glowRadius = 160, sparkle = false, waveAmplitude = 0, gradientFrom = "rgba(168, 85, 247, 0.35)", gradientTo = "rgba(180, 151, 207, 0.25)", glowColor = "#120F17" }: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current, host = hostRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999, previousX: -9999, previousY: -9999, speed: 0 };
    let dots: Dot[] = [], width = 1, height = 1, frame = 0, raf = 0;
    const buildDots = () => {
      const step = Math.max(2, dotRadius + dotSpacing); const cols = Math.floor(width / step), rows = Math.floor(height / step);
      const padX = (width - cols * step) / 2 + step / 2, padY = (height - rows * step) / 2 + step / 2;
      dots = Array.from({ length: cols * rows }, (_, index) => { const col = index % cols, row = Math.floor(index / cols), x = padX + col * step, y = padY + row * step; return { x, y, dx: x, dy: y, vx: 0, vy: 0 }; });
    };
    const resize = () => { const rect = host.getBoundingClientRect(); width = Math.max(1, rect.width); height = Math.max(1, rect.height); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); buildDots(); };
    const onMove = (event: PointerEvent) => { const rect = host.getBoundingClientRect(); mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    const draw = () => {
      frame++; const moveX = mouse.x - mouse.previousX, moveY = mouse.y - mouse.previousY; mouse.speed += (Math.hypot(moveX, moveY) - mouse.speed) * .5; mouse.previousX = mouse.x; mouse.previousY = mouse.y;
      ctx.clearRect(0, 0, width, height); const gradient = ctx.createLinearGradient(0, 0, width, height); gradient.addColorStop(0, gradientFrom); gradient.addColorStop(1, gradientTo); const radius = dotRadius / 2, cursorSq = cursorRadius * cursorRadius, active = Math.min(mouse.speed / 5, 1);
      if (active > .01) { const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, glowRadius); glow.addColorStop(0, glowColor); glow.addColorStop(1, "transparent"); ctx.globalAlpha = active * .35; ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height); ctx.globalAlpha = 1; } ctx.fillStyle = gradient;
      ctx.beginPath();
      for (let i = 0; i < dots.length; i++) { const dot = dots[i], mx = mouse.x - dot.x, my = mouse.y - dot.y, distanceSq = mx * mx + my * my;
        if (distanceSq < cursorSq && active > .01) { const distance = Math.max(1, Math.sqrt(distanceSq)); if (bulgeOnly) { const push = (1 - distance / cursorRadius) ** 2 * bulgeStrength * active; dot.dx += (dot.x - mx / distance * push - dot.dx) * .15; dot.dy += (dot.y - my / distance * push - dot.dy) * .15; } else { dot.vx -= mx / distance * (500 / distance) * mouse.speed * cursorForce; dot.vy -= my / distance * (500 / distance) * mouse.speed * cursorForce; } } else if (bulgeOnly) { dot.dx += (dot.x - dot.dx) * .1; dot.dy += (dot.y - dot.dy) * .1; }
        if (!bulgeOnly) { dot.vx *= .9; dot.vy *= .9; dot.dx += (dot.x + dot.vx - dot.dx) * .1; dot.dy += (dot.y + dot.vy - dot.dy) * .1; }
        const waveX = waveAmplitude ? Math.cos(dot.y * .03 + frame * .014) * waveAmplitude * .5 : 0, waveY = waveAmplitude ? Math.sin(dot.x * .03 + frame * .02) * waveAmplitude : 0, sparkleSize = sparkle && ((i * 2654435761 + (frame >> 3)) >>> 0) % 100 < 3 ? 1.8 : 1;
        ctx.moveTo(dot.dx + waveX + radius * sparkleSize, dot.dy + waveY); ctx.arc(dot.dx + waveX, dot.dy + waveY, radius * sparkleSize, 0, Math.PI * 2);
      }
      ctx.fill(); raf = requestAnimationFrame(draw);
    };
    const observer = new ResizeObserver(resize); observer.observe(host); resize(); host.addEventListener("pointermove", onMove, { passive: true }); host.addEventListener("pointerleave", onLeave); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); observer.disconnect(); host.removeEventListener("pointermove", onMove); host.removeEventListener("pointerleave", onLeave); };
  }, [dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, glowRadius, sparkle, waveAmplitude, gradientFrom, gradientTo, glowColor]);

  return <div ref={hostRef} role="img" aria-label="Interactive dot field" className="relative h-full w-full overflow-hidden rounded-xl"><canvas ref={canvasRef} className="absolute inset-0 h-full w-full" /></div>;
}
