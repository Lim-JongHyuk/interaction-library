"use client";

// deps: motion
import { useId, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const SPRING_PRESETS = {
  smooth: { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.9 },
  snappy: { type: "spring" as const, stiffness: 520, damping: 38, mass: 0.7 },
  bouncy: { type: "spring" as const, stiffness: 320, damping: 16, mass: 0.9 },
};

interface FAQItem {
  question: string;
  answer: string;
}

const DEFAULT_ITEMS: FAQItem[] = [
  {
    question: "How do I install this component?",
    answer: "Copy the source from the Install tab and drop it into your project — no extra config required.",
  },
  {
    question: "Can I search across both questions and answers?",
    answer: "Yes. The filter matches text in both fields in real time, so visitors find what they need faster.",
  },
  {
    question: "Does the accordion support opening multiple items at once?",
    answer: "Toggle Multiple Open to allow several answers to stay expanded simultaneously.",
  },
  {
    question: "Is the animation customizable?",
    answer: "Choose between Smooth, Snappy, or Bouncy spring presets to match your site's personality.",
  },
];

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string) {
  const q = query.trim();
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(q)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase() ? (
      <mark key={i} className="rounded bg-accent/25 text-inherit">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export interface FAQAccordionProps {
  items?: FAQItem[];
  showSearch?: boolean;
  allowMultipleOpen?: boolean;
  defaultOpenIndex?: number;
  animationSpeed?: keyof typeof SPRING_PRESETS;
}

export function FAQAccordion({
  items = DEFAULT_ITEMS,
  showSearch = true,
  allowMultipleOpen = false,
  defaultOpenIndex = 0,
  animationSpeed = "smooth",
}: FAQAccordionProps) {
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<number>>(
    () => new Set(defaultOpenIndex >= 0 ? [defaultOpenIndex] : [])
  );

  const transition = reducedMotion ? { duration: 0 } : SPRING_PRESETS[animationSpeed];

  const filtered = useMemo(() => {
    const list = items.map((item, index) => ({ ...item, __index: index }));
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [items, query]);

  function toggleItem(id: number) {
    setOpenIds((prev) => {
      const isOpen = prev.has(id);
      if (allowMultipleOpen) {
        const next = new Set(prev);
        if (isOpen) next.delete(id);
        else next.add(id);
        return next;
      }
      return isOpen ? new Set<number>() : new Set<number>([id]);
    });
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-2.5">
      {showSearch && (
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Search FAQs"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQs…"
            className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <EmptyIcon className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No results found</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different search term</p>
          </div>
        ) : (
          filtered.map((item) => {
            const isOpen = openIds.has(item.__index);
            const triggerId = `${baseId}-trigger-${item.__index}`;
            const panelId = `${baseId}-panel-${item.__index}`;
            return (
              <div
                key={item.__index}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.__index)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold"
                >
                  <span>{highlightMatch(item.question, query)}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={transition}
                    className="shrink-0 text-muted-foreground"
                  >
                    <ChevronIcon className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={panelId}
                      role="region"
                      aria-labelledby={triggerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={transition}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                        {highlightMatch(item.answer, query)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ChevronIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="11" cy="11" r="7" />
      <line x1="8" y1="8" x2="14" y2="14" strokeLinecap="round" />
      <line x1="14" y1="8" x2="8" y2="14" strokeLinecap="round" />
    </svg>
  );
}
