"use client";

// deps: motion
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "motion/react";

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  delay?: number;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = "",
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  delay = 0,
}: ShinyTextProps) {
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = Math.max(speed, 0.1) * 1000;
  const delayDuration = Math.max(delay, 0) * 1000;
  const animationEnabled = !disabled && !reducedMotion;

  useAnimationFrame((time) => {
    if (!animationEnabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }

    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }

    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;

    const cycleDuration = animationDuration + delayDuration;
    const cycleTime = elapsedRef.current % (yoyo ? cycleDuration * 2 : cycleDuration);
    const forward = cycleTime < animationDuration;
    const holdAtEnd = cycleTime < cycleDuration;
    const reverseTime = cycleTime - cycleDuration;
    const value = yoyo && !holdAtEnd
      ? reverseTime < animationDuration ? 100 - (reverseTime / animationDuration) * 100 : 0
      : forward ? (cycleTime / animationDuration) * 100 : 100;

    progress.set(direction === "left" ? value : 100 - value);
  });

  useEffect(() => {
    elapsedRef.current = 0;
    lastTimeRef.current = null;
    progress.set(direction === "left" ? 0 : 100);
  }, [direction, progress, yoyo, speed, delay]);

  const backgroundPosition = useTransform(progress, (value) => `${150 - value * 2}% center`);
  const pause = useCallback(() => pauseOnHover && setIsPaused(true), [pauseOnHover]);
  const resume = useCallback(() => setIsPaused(false), []);

  if (!animationEnabled) {
    return <span className={className} style={{ color }}>{text}</span>;
  }

  return (
    <motion.span
      className={`inline-block ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: "200% auto",
        backgroundPosition,
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {text}
    </motion.span>
  );
}
