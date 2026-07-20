"use client";

// deps: 없음 (타이핑 엔진은 순수 setTimeout 시퀀서)
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCED_QUERY).matches, () => false);
}

export interface TerminalLine {
  /** cmd: 프롬프트 뒤에 타이핑 / out: 출력으로 한 줄씩 즉시 표시 */
  type: "cmd" | "out";
  text: string;
  /** 출력 줄 색상 오버라이드 (성공/경고 표현용) */
  tone?: "default" | "success" | "dim";
}

export interface TerminalFrameProps {
  /** 재생할 스크립트. 생략 시 데모 스크립트 */
  lines?: TerminalLine[];
  /** 타이핑 속도 (chars/s) */
  typingSpeed?: number;
  /** 타이틀바 텍스트 */
  title?: string;
  /** 프롬프트·커서 색 */
  accentColor?: string;
  /** 끝나면 지우고 처음부터 반복 */
  loop?: boolean;
}

const DEMO_SCRIPT: TerminalLine[] = [
  { type: "cmd", text: "pnpm dlx shadcn@latest add motionkit/r/gooey-menu.json" },
  { type: "out", text: "✔ Checking registry.", tone: "dim" },
  { type: "out", text: "✔ Installing dependencies.", tone: "dim" },
  { type: "out", text: "✔ Created components/motionkit/gooey-menu.tsx", tone: "success" },
  { type: "cmd", text: "pnpm dev" },
  { type: "out", text: "▲ Next.js — ready in 1.2s", tone: "success" },
];

/**
 * 명령을 실제로 타이핑하고 출력을 순서대로 흘려보내는 macOS 스타일 터미널.
 * 뷰포트 진입 시 1회 시작하고, reduced-motion에서는 전체 스크립트를 즉시 렌더한다.
 */
export function TerminalFrame({
  lines = DEMO_SCRIPT,
  typingSpeed = 40,
  title = "motionkit — zsh",
  accentColor = "#34d399",
  loop = true,
}: TerminalFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  // 완료된 줄 목록 + 현재 타이핑 중인 부분 문자열
  const [done, setDone] = useState<TerminalLine[]>([]);
  const [typing, setTyping] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const reduced = usePrefersReducedMotion();

  // in-view 1회 시작
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    // reduced-motion에서는 엔진을 돌리지 않는다 — 렌더 단계에서 전체 스크립트를 그대로 보여준다
    if (!started || reduced) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    async function run() {
      const charDelay = 1000 / Math.max(typingSpeed, 1);
      do {
        await wait(80);
        setDone([]);
        setTyping(null);
        await wait(320);
        for (const line of lines) {
          if (cancelled) return;
          if (line.type === "cmd") {
            for (let i = 1; i <= line.text.length; i++) {
              if (cancelled) return;
              setTyping(line.text.slice(0, i));
              await wait(charDelay);
            }
            await wait(260);
            setTyping(null);
            setDone((prev) => [...prev, line]);
          } else {
            setDone((prev) => [...prev, line]);
            await wait(140);
          }
        }
        await wait(2600);
      } while (loop && !cancelled);
    }

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [started, reduced, lines, typingSpeed, loop]);

  // 새 줄이 붙을 때 아래로 따라 스크롤
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [done, typing]);

  // reduced-motion이면 상태와 무관하게 전체 스크립트를 최종 상태로 렌더
  const shown = reduced ? lines : done;

  return (
    <div
      ref={containerRef}
      className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl"
      role="log"
      aria-label="터미널 데모"
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-900 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
        <span className="ml-2 truncate text-xs text-zinc-400">{title}</span>
      </div>

      <div ref={scrollRef} className="h-56 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
        {shown.map((line, i) =>
          line.type === "cmd" ? (
            <div key={i} className="text-zinc-100">
              <span style={{ color: accentColor }}>❯ </span>
              {line.text}
            </div>
          ) : (
            <div
              key={i}
              className={
                line.tone === "success"
                  ? "text-emerald-400"
                  : line.tone === "dim"
                    ? "text-zinc-500"
                    : "text-zinc-300"
              }
            >
              {line.text}
            </div>
          )
        )}
        {typing !== null && (
          <div className="text-zinc-100">
            <span style={{ color: accentColor }}>❯ </span>
            {typing}
            <span
              className="ml-0.5 inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-pulse"
              style={{ backgroundColor: accentColor }}
              aria-hidden="true"
            />
          </div>
        )}
        {typing === null && !reduced && started && (
          <div className="text-zinc-100">
            <span style={{ color: accentColor }}>❯ </span>
            <span
              className="ml-0.5 inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-pulse"
              style={{ backgroundColor: accentColor }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
    </div>
  );
}
