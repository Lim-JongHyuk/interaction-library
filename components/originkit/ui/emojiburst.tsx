"use client";

import { useCallback, useEffect, useMemo, useRef, type CSSProperties } from "react";

export interface EmojiBurstProps {
  label?: string;
  paddingX?: number;
  paddingY?: number;
  objectColor?: string;
  textColor?: string;
  radius?: number;
  shakeIntensity?: number;
  shadowEnabled?: boolean;
  shadowIntensity?: number;
  shadowOpacity?: number;
  shadowColor?: string;
  font?: CSSProperties;
  emojis?: string;
  emojiSize?: number;
  burstCount?: number;
  power?: number;
  spread?: number;
  gravity?: number;
  autoBurst?: boolean;
  autoBurstInterval?: number;
  style?: CSSProperties;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  age: number;
  life: number;
  emoji: string;
  size: number;
};

const DEFAULT_EMOJIS = "🎉,✨,😄,🔥,💥,⭐,💖,🤩,👍,🥳,🎊,😎";

function withAlpha(color: string, opacity: number) {
  const match = color.trim().match(/^#([0-9a-f]{6})$/i);
  if (!match) return color;
  const alpha = Math.round(Math.max(0, Math.min(100, opacity)) * 2.55).toString(16).padStart(2, "0");
  return `${color}${alpha}`;
}

export default function EmojiBurst({
  label = "Click Here",
  paddingX = 24,
  paddingY = 18,
  objectColor = "#FFFFFF",
  textColor = "#111111",
  radius = 0,
  shakeIntensity = 0,
  shadowEnabled = false,
  shadowIntensity = 5,
  shadowOpacity = 50,
  shadowColor = "rgba(0,0,0,0.25)",
  font = { fontFamily: "Inter, sans-serif", fontSize: 20, fontWeight: 500 },
  emojis = DEFAULT_EMOJIS,
  emojiSize = 20,
  burstCount = 16,
  power = 12,
  spread = 55,
  gravity = 4,
  autoBurst = true,
  autoBurstInterval = 2.2,
  style,
}: EmojiBurstProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const emojiList = useMemo(() => emojis.split(",").map((emoji) => emoji.trim()).filter(Boolean), [emojis]);

  const burst = useCallback(() => {
    const { x, y } = originRef.current;
    const spreadRadians = (Math.max(0, Math.min(180, spread)) * Math.PI) / 180;
    const count = Math.max(1, Math.round(burstCount));
    const launch = Math.max(1, power) * 7;
    for (let index = 0; index < count; index += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRadians;
      const speed = launch * (0.72 + Math.random() * 0.5);
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: (Math.random() - 0.5) * 0.5,
        spin: (Math.random() - 0.5) * 5,
        age: 0,
        life: 1.9 + Math.random() * 1.2,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)] ?? "✨",
        size: Math.max(8, emojiSize) * (0.82 + Math.random() * 0.42),
      });
    }
    if (particlesRef.current.length > 180) {
      particlesRef.current.splice(0, particlesRef.current.length - 180);
    }
    const button = buttonRef.current;
    if (button && shakeIntensity > 0 && typeof button.animate === "function") {
      button.getAnimations().forEach((animation) => animation.cancel());
      const distance = Math.min(9, shakeIntensity / 3);
      button.animate(
        [
          { transform: "translate3d(0, 0, 0) rotate(0deg)" },
          { transform: `translate3d(${-distance}px, 0, 0) rotate(-1.4deg)` },
          { transform: `translate3d(${distance}px, 0, 0) rotate(1.4deg)` },
          { transform: `translate3d(${-distance * 0.4}px, 0, 0) rotate(-0.4deg)` },
          { transform: "translate3d(0, 0, 0) rotate(0deg)" },
        ],
        { duration: Math.max(140, shakeIntensity * 28 + 120), easing: "cubic-bezier(.22,.8,.32,1)" },
      );
    }
  }, [burstCount, emojiList, emojiSize, power, shakeIntensity, spread]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const overscanX = 260;
    const overscanY = 320;
    let width = 1;
    let height = 1;

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width + overscanX * 2);
      height = Math.max(1, rect.height + overscanY * 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      originRef.current = { x: overscanX + rect.width / 2, y: overscanY + rect.height / 2 };
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const gravityForce = Math.max(0, gravity) * 45;
      if (particlesRef.current.length === 0) {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }
      context.clearRect(0, 0, width, height);
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.age += dt;
        particle.vy += gravityForce * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.rotation += particle.spin * dt;
        const progress = particle.age / particle.life;
        if (progress >= 1) return false;
        context.save();
        const fade = progress < 0.72 ? 1 : 1 - (progress - 0.72) / 0.28;
        const scale = progress < 0.12 ? 0.7 + progress * 2.5 : 1;
        context.globalAlpha = Math.max(0, fade);
        context.translate(particle.x, particle.y);
        context.rotate(particle.rotation);
        context.scale(scale, scale);
        context.font = `${particle.size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(particle.emoji, 0, 0);
        context.restore();
        return particle.x > -100 && particle.x < width + 100 && particle.y < height + 180;
      });
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [gravity]);

  useEffect(() => {
    if (!autoBurst) return;
    const timer = window.setInterval(burst, Math.max(0.4, autoBurstInterval) * 1000);
    return () => window.clearInterval(timer);
  }, [autoBurst, autoBurstInterval, burst]);

  const shadow = shadowEnabled
    ? `0 ${Math.max(0, shadowIntensity)}px ${Math.max(0, shadowIntensity) * 2}px ${withAlpha(shadowColor, shadowOpacity)}`
    : "none";

  return (
    <div ref={hostRef} className="relative inline-flex items-center justify-center" style={style}>
      <canvas ref={canvasRef} className="pointer-events-none absolute -left-[260px] -top-[320px] z-10" aria-hidden="true" />
      <button
        ref={buttonRef}
        type="button"
        onClick={burst}
        aria-label={label}
        className="relative z-20 cursor-pointer border-0 transition-transform active:scale-[0.97]"
        style={{
          padding: `${paddingY}px ${paddingX}px`,
          borderRadius: `${Math.max(0, radius)}px`,
          background: objectColor,
          color: textColor,
          boxShadow: shadow,
          ...font,
        }}
      >
        {label}
      </button>
    </div>
  );
}
