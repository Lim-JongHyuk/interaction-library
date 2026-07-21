"use client";

// deps: motion
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export interface CommandItem {
  label: string;
  hint?: string;
  group?: string;
  /** 아이콘 대체용 단일 글리프/이모지 */
  icon?: string;
}

export interface CommandPaletteProps {
  items?: CommandItem[];
  /** 검색 입력 placeholder */
  placeholder?: string;
  /** 선택 하이라이트 액센트 색 */
  accent?: string;
  /** 여는 방법을 알리는 ⌘K 힌트 버튼 표시 */
  showHint?: boolean;
}

const DEFAULT_ITEMS: CommandItem[] = [
  { label: "Search documentation", hint: "↵", group: "General", icon: "⌕" },
  { label: "Create new project", hint: "⌘N", group: "General", icon: "＋" },
  { label: "Invite teammate", hint: "⌘I", group: "General", icon: "☺" },
  { label: "Toggle theme", hint: "⌘⇧L", group: "Preferences", icon: "◐" },
  { label: "Open settings", hint: "⌘,", group: "Preferences", icon: "⚙" },
  { label: "Billing & plans", group: "Preferences", icon: "▤" },
  { label: "View changelog", group: "Resources", icon: "✦" },
  { label: "Contact support", group: "Resources", icon: "✉" },
];

/**
 * ⌘K 커맨드 팔레트. 부분 일치 필터 + 방향키/Enter 키보드 내비게이션,
 * 열림/닫힘 스프링 전환, 그룹 헤더를 갖춘다. 실제 앱의 스포트라이트 검색 패턴.
 */
export function CommandPalette({
  items = DEFAULT_ITEMS,
  placeholder = "Type a command or search…",
  accent = "#6366f1",
  showHint = true,
}: CommandPaletteProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.label.toLowerCase().includes(q) || it.group?.toLowerCase().includes(q));
  }, [items, query]);

  function openPalette() {
    setQuery("");
    setActive(0);
    setOpen(true);
  }

  // ⌘K / Ctrl+K 로 토글
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            setQuery("");
            setActive(0);
          }
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 오버레이 페인트 후 입력에 포커스 (외부 DOM 동기화)
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  function onQueryChange(value: string) {
    setQuery(value);
    setActive(0);
  }

  // 활성 항목을 스크롤 뷰로
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="flex min-h-[360px] w-full items-center justify-center">
      {showHint && (
        <button
          type="button"
          onClick={openPalette}
          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-400 outline-none transition-colors hover:border-white/20 hover:text-zinc-200 focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <span className="opacity-60">⌕</span>
          <span>Search…</span>
          <kbd className="ml-6 rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-zinc-300">⌘K</kbd>
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-label="커맨드 팔레트"
              className="mt-[12%] w-[min(92%,520px)] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 shadow-2xl"
              initial={reducedMotion ? { scale: 1, y: 0 } : { scale: 0.96, y: -8 }}
              animate={{ scale: 1, y: 0 }}
              exit={reducedMotion ? { scale: 1, y: 0 } : { scale: 0.97, y: -6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={onListKey}
            >
              <div className="flex items-center gap-3 border-b border-white/8 px-4">
                <span className="text-lg text-zinc-500">⌕</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-transparent py-4 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-500"
                  aria-label="명령 검색"
                />
                <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">esc</kbd>
              </div>

              <div ref={listRef} className="max-h-72 overflow-y-auto p-2" role="listbox" aria-label="명령 목록">
                {filtered.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-zinc-500">No results for “{query}”.</p>
                )}
                {filtered.map((it, i) => {
                  // 앞 항목과 그룹이 다를 때만 그룹 헤더를 삽입
                  const header = it.group && it.group !== filtered[i - 1]?.group ? it.group : null;
                  const isActive = i === active;
                  return (
                    <div key={it.label}>
                      {header && (
                        <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                          {header}
                        </p>
                      )}
                      <div
                        data-idx={i}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => setOpen(false)}
                        className="relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
                      >
                        {isActive && (
                          <motion.span
                            layoutId={reducedMotion ? undefined : "cmd-active"}
                            className="absolute inset-0 rounded-lg"
                            style={{ backgroundColor: `${accent}22`, boxShadow: `inset 0 0 0 1px ${accent}55` }}
                            transition={{ type: "spring", stiffness: 600, damping: 40 }}
                          />
                        )}
                        <span className="relative w-5 text-center text-zinc-400">{it.icon ?? "•"}</span>
                        <span className="relative flex-1 text-zinc-200">{it.label}</span>
                        {it.hint && (
                          <kbd className="relative rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                            {it.hint}
                          </kbd>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
