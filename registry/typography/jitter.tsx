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

/** 시드 기반 의사난수(mulberry32). intensity/rotate로 시드를 고정해 서버 렌더와
 * 클라이언트 하이드레이션이 항상 같은 키프레임을 만들도록 한다
 * (Math.random()을 쓰면 렌더마다 값이 달라져 hydration mismatch가 난다). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeKeyframes(intensity: number, rotate: boolean): JitterKeyframes {
  const steps = 6;
  const rand = mulberry32(Math.round(intensity * 1000) * 2654435761 + (rotate ? 1 : 0) + 1);
  const x = Array.from({ length: steps }, () => (rand() - 0.5) * intensity * 2);
  const y = Array.from({ length: steps }, () => (rand() - 0.5) * intensity * 2);
  const rot = rotate ? Array.from({ length: steps }, () => (rand() - 0.5) * intensity) : undefined;
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
