"use client";

import { useEffect, useRef } from "react";

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
}

type Star = { x: number; y: number; radius: number; seed: number };
const TAU = Math.PI * 2;
const stars: Star[] = Array.from({ length: 210 }, (_, index) => {
  const seed = (Math.sin(index * 95.31) * 43758.5453) % 1;
  const unit = Math.abs(seed);
  return { x: Math.abs(Math.sin(index * 15.91)) * 2 - 1, y: Math.abs(Math.sin(index * 41.23)) * 2 - 1, radius: 0.25 + unit * 1.65, seed: unit };
});

export function CosmicOrb({ size = 340, archetype = "auto", background = "#000000", colorA = "#65d9ff", colorB = "#9f61ff", colorC = "#fb63be", starColor = "#ffffff", speed = 50, spin = 50, lens = true, lensAmount = 45, lensColor = "#ffffff" }: CosmicOrbProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const configRef = useRef({ archetype, background, colorA, colorB, colorC, starColor, speed, spin, lens, lensAmount, lensColor });
  useEffect(() => {
    configRef.current = { archetype, background, colorA, colorB, colorC, starColor, speed, spin, lens, lensAmount, lensColor };
  }, [archetype, background, colorA, colorB, colorC, starColor, speed, spin, lens, lensAmount, lensColor]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const canvas = document.createElement("canvas");
    host.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (!context) return () => canvas.remove();
    let frame = 0;
    let width = 1;
    let height = 1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const side = Math.max(1, Math.min(host.clientWidth, host.clientHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = side;
      height = side;
      canvas.width = Math.round(side * dpr);
      canvas.height = Math.round(side * dpr);
      canvas.style.width = `${side}px`;
      canvas.style.height = `${side}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    const draw = (now: number) => {
      const cfg = configRef.current;
      const time = now * 0.001 * (0.22 + cfg.speed / 170);
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.39;
      context.clearRect(0, 0, width, height);
      context.fillStyle = cfg.background;
      context.fillRect(0, 0, width, height);
      context.save();
      context.beginPath();
      context.arc(cx, cy, radius, 0, TAU);
      context.clip();

      const base = context.createRadialGradient(cx - radius * 0.22, cy - radius * 0.2, radius * 0.03, cx, cy, radius * 1.08);
      base.addColorStop(0, "#111626");
      base.addColorStop(0.46, "#070814");
      base.addColorStop(0.82, "#04040a");
      base.addColorStop(1, "#010103");
      context.fillStyle = base;
      context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

      const rotation = time * (0.21 + cfg.spin / 210);
      // Soft galactic dust sits behind the stars. Blurred, uneven arcs give the orb its glassy depth.
      context.globalCompositeOperation = "screen";
      const clouds = archetype === "deep" ? 4 : archetype === "core" ? 8 : 6;
      for (let index = 0; index < clouds; index += 1) {
        const angle = rotation * (index % 2 ? -0.72 : 0.9) + index * 1.74;
        const x = cx + Math.cos(angle) * radius * (0.18 + (index % 3) * 0.14);
        const y = cy + Math.sin(angle * 1.28) * radius * (0.22 + (index % 2) * 0.2);
        const tint = index % 3 === 0 ? cfg.colorA : index % 3 === 1 ? cfg.colorB : cfg.colorC;
        const cloud = context.createRadialGradient(x, y, 0, x, y, radius * (0.32 + (index % 2) * 0.16));
        cloud.addColorStop(0, `${tint}${archetype === "deep" ? "30" : "50"}`);
        cloud.addColorStop(0.36, `${tint}20`);
        cloud.addColorStop(1, "transparent");
        context.filter = `blur(${Math.max(5, radius * 0.075)}px)`;
        context.fillStyle = cloud;
        context.beginPath();
        context.ellipse(x, y, radius * (0.34 + (index % 2) * 0.13), radius * 0.08, angle, 0, TAU);
        context.fill();
      }
      context.filter = "none";
      for (const star of stars) {
        const wave = Math.sin(star.seed * 30 + time * (1.1 + star.seed * 2));
        const angle = Math.atan2(star.y, star.x) + rotation * (0.4 + star.seed);
        const distance = Math.hypot(star.x, star.y) * radius * (0.74 + wave * 0.035);
        if (distance > radius * 0.96) continue;
        const x = cx + Math.cos(angle) * distance;
        const y = cy + Math.sin(angle) * distance * 0.91;
        const alpha = 0.22 + (wave + 1) * 0.16 + (1 - distance / radius) * 0.3;
        context.fillStyle = cfg.starColor;
        context.globalAlpha = alpha;
        context.beginPath();
        context.arc(x, y, star.radius * (0.65 + (1 - distance / radius)), 0, TAU);
        context.fill();
      }
      context.globalAlpha = 1;

      const bands = archetype === "deep" ? 3 : archetype === "core" ? 8 : 7;
      for (let index = 0; index < bands; index += 1) {
        const angle = rotation * (index % 2 ? -1 : 1) + index * 1.34;
        const gradient = context.createLinearGradient(cx - Math.cos(angle) * radius, cy - Math.sin(angle) * radius, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.3, `${index % 3 === 0 ? cfg.colorA : index % 3 === 1 ? cfg.colorB : cfg.colorC}12`);
        gradient.addColorStop(0.5, `${index % 3 === 0 ? cfg.colorA : index % 3 === 1 ? cfg.colorB : cfg.colorC}45`);
        gradient.addColorStop(0.7, "transparent");
        context.strokeStyle = gradient;
        context.lineWidth = radius * (0.06 + (index % 3) * 0.035);
        context.beginPath();
        context.ellipse(cx + Math.sin(angle * 1.7) * radius * 0.1, cy + Math.cos(angle * 1.3) * radius * 0.08, radius * (0.45 + (index % 2) * 0.22), radius * (0.12 + (index % 3) * 0.035), angle, 0, TAU);
        context.stroke();
      }

      const flare = context.createRadialGradient(cx + Math.sin(time * 0.7) * radius * 0.52, cy - radius * 0.62, 0, cx, cy, radius * 1.1);
      flare.addColorStop(0, `${cfg.lensColor}cc`);
      flare.addColorStop(0.08, `${cfg.colorC}66`);
      flare.addColorStop(0.28, `${cfg.colorB}18`);
      flare.addColorStop(1, "transparent");
      context.fillStyle = flare;
      context.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      context.restore();

      if (cfg.lens) {
        const rim = context.createRadialGradient(cx, cy, radius * 0.78, cx, cy, radius * 1.06);
        rim.addColorStop(0, "transparent");
        rim.addColorStop(0.66, `${cfg.lensColor}${Math.round(20 + cfg.lensAmount).toString(16).padStart(2, "0")}`);
        rim.addColorStop(0.79, `${cfg.colorA}${Math.round(12 + cfg.lensAmount / 2).toString(16).padStart(2, "0")}`);
        rim.addColorStop(1, "transparent");
        context.fillStyle = rim;
        context.beginPath();
        context.arc(cx, cy, radius * 1.09, 0, TAU);
        context.fill();
      }
      // Chromatic, broken rim highlights read as refraction rather than a flat border.
      context.lineWidth = Math.max(1, radius * 0.012);
      for (const [offset, color] of [[-0.03, cfg.colorA], [0, cfg.lensColor], [0.035, cfg.colorC]] as const) {
        context.globalAlpha = 0.38;
        context.strokeStyle = color;
        context.beginPath();
        context.arc(cx, cy, radius + offset * radius, -2.55 + rotation * 0.2, -0.38 + rotation * 0.2);
        context.arc(cx, cy, radius + offset * radius, 0.72 + rotation * 0.15, 1.5 + rotation * 0.15);
        context.stroke();
      }
      context.globalAlpha = 1;
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    if (reduced) draw(0);
    else frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); canvas.remove(); };
  // Configuration updates are read through configRef in the animation frame.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} className="overflow-hidden" style={{ width: `min(100%, ${size}px)`, aspectRatio: "1 / 1" }} aria-label="Animated cosmic orb" role="img" />;
}
