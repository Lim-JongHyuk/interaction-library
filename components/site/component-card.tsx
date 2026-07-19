"use client";

import Link from "next/link";
import type { MotionSpec } from "@/lib/spec";
import { defaultParamValues } from "@/lib/codegen";
import { registryComponents } from "@/lib/registry-components";
import { LazyPreview } from "@/components/site/lazy-preview";

export function ComponentCard({ spec }: { spec: MotionSpec }) {
  const Preview = registryComponents[`${spec.category}/${spec.slug}`];
  const posterText =
    (spec.demo.text as string | undefined) ??
    (spec.params[0]?.control === "text" ? String(spec.params[0].default) : spec.name);

  return (
    <Link
      href={`/docs/${spec.category}/${spec.slug}`}
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 240px" }}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_8px_30px_-12px_var(--accent)]"
    >
      {/* 고정 높이 프리뷰 캔버스 — 뷰포트 근처에서만 라이브 마운트(LazyPreview), 넘치면 클립.
          카드 전체가 링크이므로 프리뷰 내부 버튼이 클릭을 가로채지 않도록 pointer-events 차단 */}
      <div className="pointer-events-none relative h-36 overflow-hidden rounded-lg bg-muted">
        <LazyPreview
          className="absolute inset-0 flex items-center justify-center p-3 [&>*]:max-h-full [&>*]:max-w-full"
          poster={<span className="text-sm text-muted-foreground">{posterText}</span>}
        >
          {Preview ? (
            <Preview {...spec.demo} {...defaultParamValues(spec)} />
          ) : (
            <span className="text-sm text-muted-foreground">{posterText}</span>
          )}
        </LazyPreview>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium tracking-tight">{spec.name}</span>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="rounded-full border border-border px-1.5 py-0.5 transition-colors group-hover:border-accent/50 group-hover:text-accent">
            {spec.trigger}
          </span>
          {spec.tags.slice(0, 2).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
