"use client";

// deps: motion
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface FolderDoc {
  /** 문서 카드에 표시할 제목 */
  title: string;
  /** 문서 카드 이미지 URL (없으면 목업 서류 렌더) */
  image?: string;
}

export interface ConfidentialFolderProps {
  /** 폴더 탭 라벨 */
  label?: string;
  /** 폴더 색 */
  color?: string;
  /** 열렸을 때 서류가 솟아오르는 높이(px) */
  lift?: number;
  /** CONFIDENTIAL 스탬프 표시 */
  stamp?: boolean;
  /** 서류 카드 (최대 3장 권장) */
  docs?: FolderDoc[];
}

const DEFAULT_DOCS: FolderDoc[] = [
  { title: "Q3 Strategy.pdf" },
  { title: "Payroll_final.xlsx" },
  { title: "Roadmap_v7.fig" },
];

/**
 * 호버하면 폴더가 열리며 기밀 서류가 펼쳐져 솟아오르는 인터랙션.
 * 3D 원근 + 스프링 스태거로 실제 서류철을 넘기는 듯한 질감을 낸다.
 */
export function ConfidentialFolder({
  label = "Confidential",
  color = "#d4a763",
  lift = 60,
  stamp = true,
  docs = DEFAULT_DOCS,
}: ConfidentialFolderProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const shown = docs.slice(0, 3);

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 320, damping: 26 };

  return (
    <motion.button
      type="button"
      aria-expanded={open}
      aria-label={`${label} 폴더 ${open ? "닫기" : "열기"}`}
      onHoverStart={() => setOpen(true)}
      onHoverEnd={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
      className="relative block h-48 w-64 cursor-pointer outline-none"
      style={{ perspective: 900 }}
      initial={false}
    >
      {/* 뒷판 + 탭 */}
      <div
        className="absolute inset-x-0 bottom-0 top-5 rounded-xl"
        style={{ backgroundColor: shade(color, -18) }}
      >
        <div
          className="absolute -top-4 left-4 flex h-6 items-center rounded-t-lg px-3"
          style={{ backgroundColor: shade(color, -18) }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest text-black/45">
            {label}
          </span>
        </div>
      </div>

      {/* 서류 3장 — 스태거로 솟아오르며 부채꼴로 펼쳐진다 */}
      {shown.map((doc, i) => {
        const centered = i - (shown.length - 1) / 2;
        return (
          <motion.div
            key={i}
            animate={
              open
                ? {
                    y: -lift - i * 10,
                    x: centered * 34,
                    rotate: centered * 9,
                    transition: { ...spring, delay: reducedMotion ? 0 : i * 0.045 },
                  }
                : { y: 14 - i * 5, x: 0, rotate: centered * 1.5, transition: spring }
            }
            className="absolute inset-x-7 bottom-4 top-8 origin-bottom rounded-md bg-white shadow-md ring-1 ring-black/10"
            style={{ zIndex: i + 1 }}
          >
            {doc.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doc.image} alt="" className="h-full w-full rounded-md object-cover" />
            ) : (
              <div className="flex h-full flex-col gap-1.5 p-3">
                <span className="truncate text-[10px] font-semibold text-zinc-700">{doc.title}</span>
                <span className="mt-1 h-1.5 w-4/5 rounded-full bg-zinc-200" />
                <span className="h-1.5 w-3/5 rounded-full bg-zinc-200" />
                <span className="h-1.5 w-2/3 rounded-full bg-zinc-100" />
              </div>
            )}
          </motion.div>
        );
      })}

      {/* 앞판 — 열리면 앞으로 기울어진다 */}
      <motion.div
        animate={open ? { rotateX: -32 } : { rotateX: 0 }}
        transition={spring}
        className="absolute inset-x-0 bottom-0 h-[62%] origin-bottom rounded-xl shadow-lg"
        style={{
          zIndex: 10,
          background: `linear-gradient(180deg, ${shade(color, 8)}, ${color})`,
          transformStyle: "preserve-3d",
        }}
      >
        {stamp && (
          <span
            className="absolute right-4 top-4 -rotate-12 rounded border-2 border-red-600/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-red-600/70"
            aria-hidden="true"
          >
            Confidential
          </span>
        )}
        <span
          className="absolute bottom-3 left-4 text-[10px] font-medium uppercase tracking-widest text-black/35"
          aria-hidden="true"
        >
          {shown.length} files
        </span>
      </motion.div>
    </motion.button>
  );
}

/** hex 색을 밝게/어둡게 (percent: -100~100) */
function shade(hex: string, percent: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const amt = Math.round(2.55 * percent);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((n >> 16) + amt);
  const g = clamp(((n >> 8) & 255) + amt);
  const b = clamp((n & 255) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
