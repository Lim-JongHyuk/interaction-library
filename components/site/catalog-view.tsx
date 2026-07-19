"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { MotionSpec } from "@/lib/spec";
import { CATEGORIES } from "@/lib/categories";
import { ComponentCard } from "@/components/site/component-card";
import { cn } from "@/lib/cn";

function subscribeToLocation(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

/** useSearchParams()는 Suspense 경계를 요구한다 — 클라이언트 전용 카탈로그에는
 * 불필요한 스트리밍 지연을 만들므로, popstate 기반의 가벼운 대안을 사용한다. */
function useSearchParamsSafe() {
  const search = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.search,
    () => ""
  );
  return new URLSearchParams(search);
}

export function CatalogView({ specs }: { specs: MotionSpec[] }) {
  const router = useRouter();
  const searchParams = useSearchParamsSafe();
  const category = searchParams.get("category") ?? "all";
  const tag = searchParams.get("tag") ?? "";
  const [query, setQuery] = useState("");

  const allTags = useMemo(() => {
    const set = new Set<string>();
    specs.forEach((s) => s.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [specs]);

  const fuse = useMemo(
    () =>
      new Fuse(specs, {
        keys: ["name", "tags", "description"],
        threshold: 0.35,
      }),
    [specs]
  );

  function updateParams(next: { category?: string; tag?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.category !== undefined) {
      if (next.category === "all") params.delete("category");
      else params.set("category", next.category);
    }
    if (next.tag !== undefined) {
      if (!next.tag) params.delete("tag");
      else params.set("tag", next.tag);
    }
    router.push(`/components${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const filtered = useMemo(() => {
    let result = query.trim() ? fuse.search(query.trim()).map((r) => r.item) : specs;
    if (category !== "all") result = result.filter((s) => s.category === category);
    if (tag) result = result.filter((s) => s.tags.includes(tag));
    return result;
  }, [specs, fuse, query, category, tag]);

  return (
    <div className="flex flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={category}
            onChange={(e) => updateParams({ category: e.target.value })}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components…"
            className="ml-auto max-w-xs flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => updateParams({ tag: "" })}
            className={cn(
              "rounded-full border border-border px-2.5 py-1 text-xs",
              !tag ? "border-accent/50 bg-muted text-accent" : "text-muted-foreground hover:bg-muted"
            )}
          >
            All tags
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => updateParams({ tag: tag === t ? "" : t })}
              className={cn(
                "rounded-full border border-border px-2.5 py-1 text-xs",
                tag === t ? "border-accent/50 bg-muted text-accent" : "text-muted-foreground hover:bg-muted"
              )}
            >
              #{t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">조건에 맞는 컴포넌트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((spec) => (
            <ComponentCard key={`${spec.category}/${spec.slug}`} spec={spec} />
          ))}
        </div>
      )}
    </div>
  );
}
