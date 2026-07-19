"use client";

// deps: motion
import { useEffect, useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export interface MorphNavbarProps {
  /** `,` 로 구분한 링크 라벨 */
  links?: string;
  /** 브랜드 라벨 */
  brand?: string;
  /** 활성 필 액센트 색 */
  accent?: string;
  /** 스크롤 시 컴팩트 필로 수축 */
  shrinkOnScroll?: boolean;
}

/**
 * 스크롤하면 글래스 필로 수축하는 모던 내비게이션 바.
 * 활성 링크 필이 layout 애니메이션으로 미끄러진다.
 */
export function MorphNavbar({
  links = "Home, Work, About, Contact",
  brand = "Studio®",
  accent = "#6366f1",
  shrinkOnScroll = true,
}: MorphNavbarProps) {
  const reducedMotion = useReducedMotion();
  const layoutId = useId();
  const items = links.split(",").map((l) => l.trim()).filter(Boolean);
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!shrinkOnScroll) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shrinkOnScroll]);

  const compact = shrinkOnScroll && scrolled;

  return (
    <motion.nav
      aria-label="주 내비게이션"
      animate={{
        paddingLeft: compact ? 14 : 22,
        paddingRight: compact ? 8 : 12,
        paddingTop: compact ? 6 : 10,
        paddingBottom: compact ? 6 : 10,
        gap: compact ? 16 : 28,
      }}
      transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
      className="inline-flex items-center rounded-full bg-zinc-900/80 shadow-xl backdrop-blur-md"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.09), 0 12px 32px -12px rgba(0,0,0,0.45)" }}
    >
      <span className="text-sm font-semibold tracking-tight text-white">{brand}</span>

      <ul className="flex items-center gap-1">
        {items.map((label, i) => (
          <li key={i} className="relative">
            {active === i && (
              <motion.span
                layoutId={`mk-nav-pill-${layoutId}`}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${accent} 28%, transparent)` }}
                transition={
                  reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 32 }
                }
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-current={active === i ? "page" : undefined}
              className="relative z-10 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200"
              style={{ color: active === i ? "#fff" : "rgba(255,255,255,0.55)" }}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      <motion.button
        type="button"
        whileHover={reducedMotion ? undefined : { scale: 1.05 }}
        whileTap={reducedMotion ? undefined : { scale: 0.95 }}
        className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
        style={{ backgroundColor: accent }}
      >
        Hire us
      </motion.button>
    </motion.nav>
  );
}
