"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

export interface BlackHoleProps {
  size?: number;
  showCenter?: boolean;
  voidRadius?: number;
  voidX?: number;
  voidY?: number;
  particleCount?: number;
  particleSize?: number;
  particleColor?: string;
  outerRadius?: number;
  tilt?: number;
  tiltSideway?: number;
  trail?: number;
  orbitSpeed?: number;
  pullSpeed?: number;
  style?: CSSProperties;
}

type Particle = { angle: number; radius: number; height: number; speed: number };

/** A dependency-free Canvas black hole with a depth-sorted accretion disk. */
export function BlackHole({
  size = 420, showCenter = true, voidRadius = 40, voidX = 50, voidY = 50,
  particleCount = 1000, particleSize = 4, particleColor = "#ffffff", outerRadius = 70,
  tilt = 20, tiltSideway = 160, trail = 50, orbitSpeed = 4, pullSpeed = 0, style,
}: BlackHoleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const dimension = Math.max(180, Math.min(720, size));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = dimension * dpr;
    canvas.height = dimension * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const maxRadius = dimension / 2;
    const diskRadius = voidRadius + (Math.max(0, Math.min(100, outerRadius)) / 100) * (maxRadius - voidRadius);
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: voidRadius + Math.pow(Math.random(), 2) * (diskRadius - voidRadius),
      height: (Math.random() - 0.5) * 16,
      speed: 0.75 + Math.random() * 0.5,
    }));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fade = Math.max(0.02, 1 - (Math.max(0, Math.min(50, trail)) / 50) * 0.98);
    const tiltRadians = (tilt * Math.PI) / 180;
    const rollRadians = (tiltSideway * Math.PI) / 180;
    const centerX = (voidX / 100) * dimension;
    const centerY = (voidY / 100) * dimension;
    let frame = 0;
    let previous = performance.now();

    const draw = (now: number) => {
      const delta = Math.min((now - previous) / 16.667, 3);
      previous = now;
      context.globalCompositeOperation = "destination-out";
      context.fillStyle = `rgba(0, 0, 0, ${fade})`;
      context.fillRect(0, 0, dimension, dimension);
      context.globalCompositeOperation = "source-over";

      const back: Array<{ x: number; y: number; z: number; alpha: number }> = [];
      const front: typeof back = [];
      for (const particle of particlesRef.current) {
        if (!reducedMotion) {
          const gravity = Math.sqrt(voidRadius / Math.max(particle.radius, 10)) * particle.speed;
          particle.angle += orbitSpeed * gravity * 0.012 * delta;
          particle.radius -= pullSpeed * gravity * 0.5 * delta;
          if (particle.radius < voidRadius) particle.radius = diskRadius;
        }
        const x = particle.radius * Math.cos(particle.angle);
        const z = particle.radius * Math.sin(particle.angle);
        const y = particle.height * Math.cos(tiltRadians) + z * Math.sin(tiltRadians);
        const depth = -particle.height * Math.sin(tiltRadians) + z * Math.cos(tiltRadians);
        const px = centerX + x * Math.cos(rollRadians) - y * Math.sin(rollRadians);
        const py = centerY + x * Math.sin(rollRadians) + y * Math.cos(rollRadians);
        const item = { x: px, y: py, z: depth, alpha: Math.max(0.35, 1 - ((depth + diskRadius) / (2 * diskRadius)) * 0.45) };
        (depth >= 0 ? back : front).push(item);
      }
      const paint = (items: typeof back) => {
        items.sort((a, b) => b.z - a.z);
        context.fillStyle = particleColor;
        for (const item of items) {
          context.globalAlpha = item.alpha;
          context.beginPath();
          context.arc(item.x, item.y, Math.max(0.5, particleSize / 4), 0, Math.PI * 2);
          context.fill();
        }
      };
      paint(back);
      if (showCenter) {
        context.globalAlpha = 1;
        const gradient = context.createRadialGradient(centerX - voidRadius * 0.25, centerY - voidRadius * 0.3, 1, centerX, centerY, voidRadius);
        gradient.addColorStop(0, "#101014"); gradient.addColorStop(0.75, "#000000"); gradient.addColorStop(1, "#25252c");
        context.fillStyle = gradient;
        context.beginPath(); context.arc(centerX, centerY, voidRadius, 0, Math.PI * 2); context.fill();
      }
      paint(front);
      context.globalAlpha = 1;
      if (!reducedMotion) frame = requestAnimationFrame(draw);
    };
    draw(previous);
    return () => cancelAnimationFrame(frame);
  }, [dimension, showCenter, voidRadius, voidX, voidY, particleCount, particleSize, particleColor, outerRadius, tilt, tiltSideway, trail, orbitSpeed, pullSpeed]);

  return <canvas ref={canvasRef} aria-hidden="true" style={{ display: "block", width: dimension, height: dimension, maxWidth: "100%", background: "#000", ...style }} />;
}
