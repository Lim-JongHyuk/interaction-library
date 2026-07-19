"use client";

import { useState } from "react";
import type { MotionSpec } from "@/lib/spec";
import { defaultParamValues, generateUsageCode, type ParamValues } from "@/lib/codegen";
import { registryComponents } from "@/lib/registry-components";
import { ParamControls } from "@/components/studio/param-controls";
import { CopyButton } from "@/components/studio/copy-button";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/use-mounted";

type Tab = "usage" | "source" | "install";

export function DetailView({
  spec,
  source,
  sourceHtml,
}: {
  spec: MotionSpec;
  source: string;
  sourceHtml: string | null;
}) {
  const [values, setValues] = useState<ParamValues>(defaultParamValues(spec));
  const [replayKey, setReplayKey] = useState(0);
  const [gridBg, setGridBg] = useState(false);
  const [tab, setTab] = useState<Tab>("usage");

  const Preview = registryComponents[`${spec.category}/${spec.slug}`];
  const usageCode = generateUsageCode(spec, values);
  const mounted = useMounted();
  const origin = mounted ? window.location.origin : "<deployment-url>";
  const registryUrl = `${origin}/${spec.install.registryPath}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{spec.name}</h1>
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            trigger: {spec.trigger}
          </span>
        </div>
        <p className="text-muted-foreground">{spec.description}</p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {spec.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-2 py-0.5">
              {tag}
            </span>
          ))}
          <span>deps: {spec.dependencies.length > 0 ? spec.dependencies.join(", ") : "none"}</span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              "flex min-h-64 items-center justify-center rounded-lg border border-border p-8",
              gridBg &&
                "bg-[radial-gradient(circle,var(--border)_1px,transparent_1px)] [background-size:16px_16px]"
            )}
          >
            {Preview ? (
              spec.category === "backgrounds" ? (
                <div className="h-72 w-full">
                  <Preview key={replayKey} {...spec.demo} {...values} />
                </div>
              ) : (
                <Preview key={replayKey} {...spec.demo} {...values} />
              )
            ) : (
              <span className="text-sm text-muted-foreground">프리뷰 컴포넌트 준비 중.</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted"
            >
              ▶ Replay
            </button>
            <button
              type="button"
              onClick={() => setGridBg((v) => !v)}
              aria-pressed={gridBg}
              className={cn(
                "rounded-md border border-border px-3 py-1.5 text-sm hover:bg-muted",
                gridBg && "bg-muted"
              )}
            >
              ▦ Grid
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Param Studio</h2>
            <button
              type="button"
              onClick={() => setValues(defaultParamValues(spec))}
              disabled={JSON.stringify(values) === JSON.stringify(defaultParamValues(spec))}
              className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              ↺ Reset
            </button>
          </div>
          <ParamControls
            params={spec.params}
            values={values}
            onChange={(key, value) => setValues((v) => ({ ...v, [key]: value }))}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-1 border-b border-border">
          {(["usage", "source", "install"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-3 py-2 text-sm font-medium capitalize",
                tab === t
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "usage" && (
          <div className="relative">
            <CopyButton text={usageCode} className="absolute right-3 top-3" />
            <pre className="overflow-x-auto rounded-md border border-border bg-muted p-4 text-sm">
              {usageCode}
            </pre>
          </div>
        )}

        {tab === "source" && (
          <div className="relative">
            <CopyButton text={source} className="absolute right-3 top-3 z-10" />
            {sourceHtml ? (
              <div
                className="overflow-x-auto rounded-md border border-border p-4 text-sm [&_pre]:!bg-transparent"
                dangerouslySetInnerHTML={{ __html: sourceHtml }}
              />
            ) : (
              <pre className="overflow-x-auto rounded-md border border-border bg-muted p-4 text-sm">
                {source}
              </pre>
            )}
          </div>
        )}

        {tab === "install" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="mb-1 text-sm font-semibold">CLI</h3>
              <div className="relative">
                <CopyButton text={`pnpm dlx shadcn@latest add ${registryUrl}`} className="absolute right-3 top-3" />
                <pre className="overflow-x-auto rounded-md border border-border bg-muted p-4 text-sm">
                  pnpm dlx shadcn@latest add {registryUrl}
                </pre>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                현재 접속한 도메인 기준 레지스트리 URL입니다. 프로덕션 배포 도메인에서도 동일하게 동작합니다.
              </p>
            </div>
            <div>
              <h3 className="mb-1 text-sm font-semibold">Manual</h3>
              <p className="text-sm text-muted-foreground">
                Source 탭의 코드를 <code>components/motionkit/{spec.slug}.tsx</code>로 복사하세요.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Motion Spec</h2>
        <table className="w-full border-collapse text-sm">
          <tbody>
            <SpecRow label="Trigger">
              {spec.trigger}
              {spec.triggerNote ? ` — ${spec.triggerNote}` : ""}
            </SpecRow>
            <SpecRow label="Params">
              {spec.params.map((p) => p.key).join(", ") || "없음"}
            </SpecRow>
            <SpecRow label="Accessibility">{spec.a11y.reducedMotion}</SpecRow>
            {spec.credits && (
              <SpecRow label="Credits">
                {[spec.credits.author, spec.credits.inspiredBy, spec.credits.license]
                  .filter(Boolean)
                  .join(" · ")}
              </SpecRow>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpecRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t border-border">
      <td className="w-40 py-2 pr-4 align-top font-medium text-muted-foreground">{label}</td>
      <td className="py-2">{children}</td>
    </tr>
  );
}
