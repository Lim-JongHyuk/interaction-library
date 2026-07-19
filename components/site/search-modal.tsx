"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { loadSpecs } from "@/lib/load-specs";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/cn";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const specs = useMemo(() => loadSpecs(), []);
  const fuse = useMemo(
    () => new Fuse(specs, { keys: ["name", "tags", "description", "category"], threshold: 0.35 }),
    [specs]
  );

  const results = useMemo(() => {
    const q = query.trim();
    return (q ? fuse.search(q).map((r) => r.item) : specs).slice(0, 8);
  }, [query, fuse, specs]);

  // 닫을 때 검색 상태를 함께 리셋한다 (effect 내 setState 대신 이벤트 시점에 처리)
  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  useEffect(() => {
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => {
          if (v) {
            setQuery("");
            setActiveIndex(0);
          }
          return !v;
        });
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setActiveIndex(0);
      }
    }
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function go(index: number) {
    const target = results[index];
    if (!target) return;
    router.push(`/docs/${target.category}/${target.slug}`);
    close();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(activeIndex);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden flex-1 max-w-sm items-center gap-2 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground sm:flex",
          "hover:border-accent/50"
        )}
      >
        <SearchIcon className="h-4 w-4" />
        <span>Search components…</span>
        <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-xs">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[15vh]" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <SearchIcon className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search components…"
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">Esc</kbd>
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">결과가 없습니다.</p>
              ) : (
                results.map((spec, i) => {
                  const category = CATEGORIES.find((c) => c.slug === spec.category);
                  return (
                    <button
                      key={`${spec.category}/${spec.slug}`}
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => go(i)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-2 text-left text-sm",
                        i === activeIndex ? "bg-muted" : "hover:bg-muted"
                      )}
                    >
                      <span className="rounded-full border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                        {category?.label ?? spec.category}
                      </span>
                      <span className="font-medium">{spec.name}</span>
                      <span className="ml-auto truncate text-xs text-muted-foreground">
                        {spec.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
