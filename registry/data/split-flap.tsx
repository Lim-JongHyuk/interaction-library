"use client";

// deps: motion
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface SplitFlapProps {
  /** 순환할 단어들. 길이가 다르면 공백으로 패딩된다 */
  words?: string[];
  /** 글자 하나가 한 칸 플립하는 시간(ms) */
  speed?: number;
  /** 열(column) 사이 시작 지연(s) */
  stagger?: number;
  /** 단어가 완성된 뒤 유지되는 시간(s) */
  hold?: number;
}

const CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.!?&";

function normalize(words: string[]): string[] {
  const upper = words.map((w) =>
    w
      .toUpperCase()
      .split("")
      .map((ch) => (CHARSET.includes(ch) ? ch : " "))
      .join("")
  );
  const len = Math.max(...upper.map((w) => w.length), 1);
  return upper.map((w) => w.padEnd(len, " "));
}

/**
 * 공항 출발 안내판식 스플릿 플랩 디스플레이.
 * 각 셀은 실제 기계처럼 위 반쪽이 접혀 내려오고(-90°) 아래 반쪽이
 * 펼쳐지는(90°→0°) 2단 플립으로 문자표를 순차 통과해 목표 글자에 도착한다.
 */
export function SplitFlap({
  words = ["MOTIONKIT", "SPLIT FLAP", "NOW BOARDING"],
  speed = 70,
  stagger = 0.06,
  hold = 2.6,
}: SplitFlapProps) {
  const reducedMotion = useReducedMotion();
  const padded = useMemo(() => normalize(words), [words]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || padded.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % padded.length), hold * 1000);
    return () => clearInterval(id);
  }, [reducedMotion, padded.length, hold]);

  const target = padded[index];

  return (
    <div className="flex w-full items-center justify-center py-10">
      <div
        role="img"
        aria-label={words[index]?.trim() ?? ""}
        className="flex gap-[3px] rounded-xl bg-zinc-950 p-3 ring-1 ring-white/10"
      >
        {target.split("").map((ch, i) => (
          <FlapCell
            key={i}
            target={ch}
            speed={speed}
            delay={i * stagger}
            reducedMotion={!!reducedMotion}
          />
        ))}
      </div>
    </div>
  );
}

function FlapCell({
  target,
  speed,
  delay,
  reducedMotion,
}: {
  target: string;
  speed: number;
  delay: number;
  reducedMotion: boolean;
}) {
  const [flip, setFlip] = useState({ prev: " ", curr: " ", count: 0 });
  const currRef = useRef(" ");

  useEffect(() => {
    if (reducedMotion) {
      currRef.current = target;
      setFlip({ prev: target, curr: target, count: 0 });
      return;
    }
    let interval: ReturnType<typeof setInterval> | undefined;
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        const prev = currRef.current;
        // 남은 전방 거리. 거리가 멀면 여러 글자씩 건너뛰어
        // 최대 ~12플립 안에 도착시킨다 (hold보다 이동이 길어지는 것 방지)
        const dist =
          (CHARSET.indexOf(target) - CHARSET.indexOf(prev) + CHARSET.length) % CHARSET.length;
        if (dist === 0) {
          clearInterval(interval);
          return;
        }
        const stride = Math.max(1, Math.round(dist / 12));
        const next = CHARSET[(CHARSET.indexOf(prev) + stride) % CHARSET.length];
        currRef.current = next;
        setFlip((f) => ({ prev, curr: next, count: f.count + 1 }));
      }, speed);
    }, delay * 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [target, speed, delay, reducedMotion]);

  const { prev, curr, count } = flip;
  const half = speed / 2000; // 반쪽 플립 시간(s)

  return (
    <span
      className="relative inline-block h-14 w-9 rounded-md bg-zinc-900 font-mono text-3xl font-semibold text-zinc-100"
      style={{ perspective: 320 }}
      aria-hidden="true"
    >
      {/* 정적 레이어: 위 = 다음 글자(플립이 열리며 드러남), 아래 = 이전 글자 */}
      <Half char={curr} pos="top" />
      <Half char={prev} pos="bottom" />

      {count > 0 && (
        <>
          {/* 이전 글자 위 반쪽이 접혀 내려온다 */}
          <motion.span
            key={`t${count}`}
            className="absolute inset-x-0 top-0 z-10 h-1/2 origin-bottom [backface-visibility:hidden]"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -90 }}
            transition={{ duration: half, ease: "easeIn" }}
          >
            <Half char={prev} pos="top" full />
          </motion.span>
          {/* 새 글자 아래 반쪽이 펼쳐진다 */}
          <motion.span
            key={`b${count}`}
            className="absolute inset-x-0 bottom-0 z-10 h-1/2 origin-top [backface-visibility:hidden]"
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{ duration: half, delay: half, ease: "easeOut" }}
          >
            <Half char={curr} pos="bottom" full />
          </motion.span>
        </>
      )}

      {/* 힌지 라인 */}
      <span className="absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-black/70" />
    </span>
  );
}

function Half({ char, pos, full }: { char: string; pos: "top" | "bottom"; full?: boolean }) {
  return (
    <span
      className={`absolute inset-x-0 overflow-hidden ${
        full ? "inset-y-0" : pos === "top" ? "top-0 h-1/2" : "bottom-0 h-1/2"
      } ${pos === "top" ? "rounded-t-md bg-gradient-to-b from-zinc-800 to-zinc-900" : "rounded-b-md bg-gradient-to-b from-zinc-900 to-zinc-800"}`}
    >
      <span
        className={`absolute inset-x-0 flex h-14 items-center justify-center ${
          pos === "top" ? "top-0" : "bottom-0"
        }`}
      >
        {char === " " ? " " : char}
      </span>
    </span>
  );
}
