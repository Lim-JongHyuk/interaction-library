"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { loadSpecs } from "@/lib/load-specs";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/cn";

const OPEN_SEARCH_EVENT = "orbit:open-search";
const NAVIGATE_EVENT = "orbit:navigate";

/** Lightweight trigger. The searchable index and dialog are mounted once in SiteShell. */
export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SEARCH_EVENT))}
      className={cn(
        "hidden flex-1 max-w-sm items-center gap-2 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground sm:flex",
        "hover:border-accent/50"
      )}
    >
      <SearchIcon className="h-4 w-4" />
      <span>Search components…</span>
      <kbd className="ml-auto rounded border border-border px-1.5 py-0.5 text-xs">⌘K</kbd>
    </button>
  );
}

/** One global dialog prevents duplicate Fuse indexes/listeners and escapes sidebar clipping. */
export function SearchDialog() {
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
    return (q ? fuse.search(q).map((result) => result.item) : specs).slice(0, 8);
  }, [query, fuse, specs]);

  function close() {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }

  useEffect(() => {
    function showSearch() {
      setOpen(true);
    }
    function handleGlobalKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      } else if (event.key === "Escape") {
        close();
      }
    }

    window.addEventListener(OPEN_SEARCH_EVENT, showSearch);
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, showSearch);
      window.removeEventListener("keydown", handleGlobalKeydown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function go(index: number) {
    const target = results[index];
    if (!target) return;
    window.dispatchEvent(new Event(NAVIGATE_EVENT));
    router.push(`/docs/${target.category}/${target.slug}`);
    close();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(activeIndex);
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 px-4 pt-[15vh] backdrop-blur-sm" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search components"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
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
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">No components found.</p>
          ) : (
            results.map((spec, index) => {
              const category = CATEGORIES.find((item) => item.slug === spec.category);
              return (
                <button
                  key={`${spec.category}/${spec.slug}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => go(index)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left text-sm",
                    index === activeIndex ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <span className="rounded-full border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
                    {category?.label ?? spec.category}
                  </span>
                  <span className="font-medium">{spec.name}</span>
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {spec.tags.slice(0, 2).map((tag) => `#${tag}`).join(" ")}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
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
