"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface JitterTextProps {
  text: string;
  duration?: number;
  intensity?: number;
  rotate?: boolean;
}

interface JitterKeyframes {
  x: number[];
  y: number[];
  rot?: number[];
}

function makeKeyframes(intensity: number, rotate: boolean): JitterKeyframes {
  const steps = 6;
  const x = Array.from({ length: steps }, () => (Math.random() - 0.5) * intensity * 2);
  const y = Array.from({ length: steps }, () => (Math.random() - 0.5) * intensity * 2);
  const rot = rotate ? Array.from({ length: steps }, () => (Math.random() - 0.5) * intensity) : undefined;
  x.push(0);
  y.push(0);
  rot?.push(0);
  return { x, y, rot };
}

export function JitterText({ text, duration = 0.3, intensity = 2, rotate = false }: JitterTextProps) {
  const reducedMotion = useReducedMotion();

  // 랜덤 키프레임은 렌더 순수성을 지키기 위해 state로 보관하고,
  // 파라미터가 바뀔 때만 렌더 중 조정(adjust-during-render 패턴)으로 재생성한다.
  const [keyframes, setKeyframes] = useState<JitterKeyframes>(() => makeKeyframes(intensity, rotate));
  const [prevParams, setPrevParams] = useState({ intensity, rotate });

  if (prevParams.intensity !== intensity || prevParams.rotate !== rotate) {
    setPrevParams({ intensity, rotate });
    setKeyframes(makeKeyframes(intensity, rotate));
  }

  if (reducedMotion) {
    return <span>{text}</span>;
  }

  return (
    <motion.span
      animate={{ x: keyframes.x, y: keyframes.y, rotate: keyframes.rot }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block" }}
    >
      {text}
    </motion.span>
  );
}
