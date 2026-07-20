"use client";

// deps: motion
import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface GooeyMenuProps {
  /** 열렸을 때 아이템이 퍼지는 거리(px) */
  spread?: number;
  /** 아이템 간 등장 지연(s) */
  stagger?: number;
  /** 블롭·버튼 색 */
  color?: string;
  /** radial: 부채꼴로 퍼짐 / vertical: 위로 쌓임 */
  direction?: "radial" | "vertical";
}

const ITEMS = [
  { label: "Home", icon: HomeIcon },
  { label: "Search", icon: SearchIcon },
  { label: "Favorites", icon: HeartIcon },
  { label: "Alerts", icon: BellIcon },
  { label: "Settings", icon: GearIcon },
];

/**
 * SVG goo 필터로 블롭이 젤리처럼 붙었다 떨어지는 FAB 메뉴.
 * 필터 레이어(블롭)와 비필터 레이어(아이콘 버튼)를 같은 좌표로 이중 렌더링해
 * 아이콘 선명도를 유지하면서 액체 융합 효과를 낸다.
 */
export function GooeyMenu({
  spread = 130,
  stagger = 0.04,
  color = "#6366f1",
  direction = "radial",
}: GooeyMenuProps) {
  const reducedMotion = useReducedMotion();
  const filterId = useId().replace(/[:]/g, "");
  const [open, setOpen] = useState(false);

  // 각 아이템의 목표 오프셋. radial은 위쪽 반원(150° 부채꼴), vertical은 수직 스택.
  function offsetFor(index: number) {
    if (direction === "vertical") {
      return { x: 0, y: -(index + 1) * Math.max(56, spread / 2.2) };
    }
    const arc = Math.PI * 0.83; // 150°
    const start = Math.PI / 2 + arc / 2;
    const angle = start - (arc * index) / (ITEMS.length - 1);
    return { x: Math.cos(angle) * spread, y: -Math.sin(angle) * spread };
  }

  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 22 };

  return (
    <div className="relative flex h-72 w-full items-end justify-center pb-8">
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* 필터 레이어: 색 블롭만. 아이콘을 여기 두면 goo 블러에 뭉개진다. */}
      <div
        className="pointer-events-none absolute inset-0 flex items-end justify-center pb-8"
        style={{ filter: `url(#${filterId})` }}
        aria-hidden="true"
      >
        <div className="relative">
          <span
            className="block h-14 w-14 rounded-full"
            style={{ backgroundColor: color }}
          />
          {ITEMS.map((item, i) => {
            const target = offsetFor(i);
            return (
              <motion.span
                key={item.label}
                className="absolute left-1/2 top-1/2 -ml-[22px] -mt-[22px] h-11 w-11 rounded-full"
                style={{ backgroundColor: color }}
                initial={false}
                animate={open ? { x: target.x, y: target.y, scale: 1 } : { x: 0, y: 0, scale: 0.6 }}
                transition={{ ...spring, delay: reducedMotion ? 0 : (open ? i : ITEMS.length - 1 - i) * stagger }}
              />
            );
          })}
        </div>
      </div>

      {/* 비필터 레이어: 실제 버튼 + 아이콘 (선명, 포커스/클릭 대상) */}
      <div className="relative">
        <motion.button
          type="button"
          aria-expanded={open}
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setOpen((v) => !v)}
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          animate={{ rotate: open ? 45 : 0 }}
          transition={spring}
        >
          <PlusIcon className="h-6 w-6" />
        </motion.button>

        {ITEMS.map((item, i) => {
          const target = offsetFor(i);
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              type="button"
              aria-label={item.label}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="absolute left-1/2 top-1/2 -ml-[22px] -mt-[22px] flex h-11 w-11 items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              style={{ pointerEvents: open ? "auto" : "none" }}
              initial={false}
              animate={
                open
                  ? { x: target.x, y: target.y, scale: 1, opacity: 1 }
                  : { x: 0, y: 0, scale: 0.5, opacity: 0 }
              }
              transition={{ ...spring, delay: reducedMotion ? 0 : (open ? i : ITEMS.length - 1 - i) * stagger }}
            >
              <Icon className="h-5 w-5" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 21s-7.5-4.7-9.5-9C1 8.5 3 5 6.5 5c2.2 0 3.8 1.3 5.5 3.3C13.7 6.3 15.3 5 17.5 5 21 5 23 8.5 21.5 12c-2 4.3-9.5 9-9.5 9Z" />
    </svg>
  );
}
function BellIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}
function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.65 15 1.7 1.7 0 0 0 3.09 14H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.65 1.7 1.7 0 0 0 10.03 3.1V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87c.26.63.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09c-.68 0-1.3.4-1.51 1Z" />
    </svg>
  );
}
