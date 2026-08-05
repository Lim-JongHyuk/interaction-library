"use client";

import { useEffect, useState } from "react";
import type { MotionSpec, ParamDef } from "@/lib/spec";
import { defaultParamValues, type ParamValues } from "@/lib/codegen";
import { registryComponents } from "@/lib/registry-components";
import { ParamControls } from "@/components/studio/param-controls";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/use-mounted";
import { PanelResizeHandle } from "@/components/site/panel-resize-handle";

type InstallMethod = "cli" | "code" | "prompt";

export function DetailView({
  spec,
  source,
}: {
  spec: MotionSpec;
  source: string;
  sourceHtml: string | null;
}) {
  const [values, setValues] = useState<ParamValues>(defaultParamValues(spec));
  const [replayKey, setReplayKey] = useState(0);
  const [gridBg, setGridBg] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [method, setMethod] = useState<InstallMethod>("code");
  const [copied, setCopied] = useState(false);
  const [studioWidth, setStudioWidth] = useState(360);
  const mounted = useMounted();
  const Preview = registryComponents[`${spec.category}/${spec.slug}`];
  const registryUrl = `${mounted ? window.location.origin : "<deployment-url>"}/${spec.install.registryPath}`;

  useEffect(() => {
    if (!fullscreen && !installOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreen(false);
        setInstallOpen(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fullscreen, installOpen]);

  const copyText = method === "cli" ? `pnpm dlx shadcn@latest add ${registryUrl}` : method === "prompt" ? buildPrompt(spec) : source;
  async function copyInstall() {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  const reset = () => setValues(defaultParamValues(spec));

  return (
    <div className="min-h-full bg-background font-mono text-sm">
      <div style={{ gridTemplateColumns: `minmax(0, 1fr) ${studioWidth}px` }} className="grid min-h-screen max-lg:block">
        <main className="min-w-0 px-4 py-7 md:px-6 lg:px-8">
          <header className="mb-5 flex flex-wrap items-start justify-between gap-5 border-b border-border pb-5">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-accent">{spec.category}</span><span>/</span><span>{spec.trigger}</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{spec.name}</h1>
              <p className="mt-2 max-w-2xl leading-6 text-muted-foreground">{spec.description}</p>
            </div>
            <button type="button" onClick={() => setInstallOpen(true)} className="inline-flex items-center gap-2 border border-foreground bg-foreground px-4 py-2.5 font-semibold text-background transition-opacity hover:opacity-85">
              <CopyIcon className="size-4" /> Copy <ChevronIcon className="size-3" />
            </button>
          </header>

          <section className="relative mx-auto w-full max-w-[1120px] border border-border bg-black" aria-label={`${spec.name} interactive preview`}>
            <div className="absolute right-3 top-3 z-10 flex gap-1.5">
              <ToolButton label="Toggle grid" active={gridBg} onClick={() => setGridBg((value) => !value)}><GridIcon /></ToolButton>
              <ToolButton label="Replay preview" onClick={() => setReplayKey((key) => key + 1)}><ReplayIcon /></ToolButton>
              <ToolButton label="Open full screen" onClick={() => setFullscreen(true)}><MaximizeIcon /></ToolButton>
            </div>
            <div className={cn("flex min-h-[340px] items-center justify-center overflow-hidden p-6 sm:min-h-[500px] sm:p-7", gridBg && "mk-preview-grid")}>
              {Preview ? (
                spec.category === "backgrounds" ? <div className="h-[420px] w-full sm:h-[460px]"><Preview key={replayKey} {...spec.demo} {...values} /></div> : <Preview key={replayKey} {...spec.demo} {...values} />
              ) : <span className="text-muted-foreground">Preview unavailable</span>}
            </div>
          </section>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-lg font-bold text-foreground">{spec.name}</h2>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{spec.description}</p>
            <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <InfoList title="KEY FEATURES" items={featureLines(spec)} />
              <InfoList title="ACCESSIBILITY" items={[spec.a11y.reducedMotion, ...(spec.a11y.notes ?? [])]} />
            </div>
          </section>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-lg font-bold text-foreground">API Reference</h2>
            <p className="mt-2 text-muted-foreground">Every prop maps directly to the studio controls.</p>
            <div className="mt-5 overflow-x-auto border border-border">
              <table className="min-w-[680px] w-full border-collapse text-left text-xs">
                <thead className="bg-muted text-muted-foreground"><tr><th className="px-4 py-3 font-medium">PROP</th><th className="px-4 py-3 font-medium">TYPE</th><th className="px-4 py-3 font-medium">DEFAULT</th><th className="px-4 py-3 font-medium">DESCRIPTION</th></tr></thead>
                <tbody>{spec.params.map((param) => <ParamRow key={param.key} param={param} />)}</tbody>
              </table>
            </div>
          </section>
        </main>

        <aside className="relative border-t border-border bg-[#1c1c1e] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-l lg:border-t-0">
          <PanelResizeHandle label="Resize studio panel" className="-left-1 top-0 h-full" onResize={(delta) => setStudioWidth((width) => Math.min(560, Math.max(280, width - delta)))} />
          <div className="border-b border-border px-5 py-5">
            <div className="flex items-center justify-between"><span className="font-semibold text-foreground">◈ Studio</span><span className="border border-border px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">{spec.status}</span></div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Adjust values and see the preview update immediately.</p>
          </div>
          <div className="p-5">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold text-foreground">Controls</h2><button type="button" onClick={reset} className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Reset all</button></div>
            {spec.params.length ? <ParamControls params={spec.params} values={values} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} dense /> : <p className="text-xs text-muted-foreground">This component has no adjustable props.</p>}
          </div>
          <div className="border-t border-border px-5 py-5 text-xs leading-6 text-muted-foreground"><div className="flex justify-between"><span>DEPENDENCIES</span><span className="text-foreground">{spec.dependencies.length ? spec.dependencies.join(", ") : "none"}</span></div><div className="mt-2 flex justify-between"><span>TRIGGER</span><span className="text-foreground">{spec.trigger}</span></div></div>
        </aside>
      </div>

      {fullscreen && <FullscreenPreview spec={spec} Preview={Preview} values={values} replayKey={replayKey} onClose={() => setFullscreen(false)} />}
      {installOpen && <InstallModal name={spec.name} method={method} setMethod={setMethod} copied={copied} onCopy={copyInstall} onClose={() => setInstallOpen(false)} />}
    </div>
  );
}

function featureLines(spec: MotionSpec) { return [`${spec.trigger} trigger with live parameter updates.`, `${spec.params.length || "No"} configurable ${spec.params.length === 1 ? "property" : "properties"} in the studio panel.`, `Ready to copy as a standalone ${spec.variants[0]} component.`]; }
function describe(param: ParamDef) { if (param.control === "slider") return `Adjust ${param.label.toLowerCase()} from ${param.min} to ${param.max}${param.unit ?? ""}.`; if (param.control === "toggle") return `Enable or disable ${param.label.toLowerCase()}.`; if (param.control === "select") return `Choose the ${param.label.toLowerCase()} option.`; return `Set the ${param.label.toLowerCase()} value.`; }
function ParamRow({ param }: { param: ParamDef }) { return <tr className="border-t border-border text-muted-foreground"><td className="px-4 py-3 font-semibold text-foreground">{param.key}</td><td className="px-4 py-3"><code className="bg-muted px-1.5 py-1 text-accent">{param.control}</code></td><td className="px-4 py-3">{String(param.default)}</td><td className="px-4 py-3">{describe(param)}</td></tr>; }
function InfoList({ title, items }: { title: string; items: string[] }) { return <div><h3 className="border-b border-border pb-3 text-xs font-semibold tracking-wider text-foreground">{title}</h3><ul className="mt-3 space-y-2.5 text-sm leading-6 text-muted-foreground">{items.map((item) => <li key={item}>— {item}</li>)}</ul></div>; }
function ToolButton({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) { return <button type="button" aria-label={label} title={label} onClick={onClick} className={cn("grid size-8 place-items-center border border-border bg-background/90 text-muted-foreground transition-colors hover:text-foreground", active && "border-accent text-accent")}>{children}</button>; }

function FullscreenPreview({ spec, Preview, values, replayKey, onClose }: { spec: MotionSpec; Preview: React.ComponentType<Record<string, unknown>> | undefined; values: ParamValues; replayKey: number; onClose: () => void }) { return <div role="dialog" aria-modal="true" aria-label={`${spec.name} full screen preview`} className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0b]"><div className="flex items-center justify-between border-b border-border px-5 py-4 font-mono"><span>{spec.name}</span><button type="button" onClick={onClose} className="border border-border px-3 py-1.5 text-xs hover:bg-muted">Close ×</button></div><div className="flex flex-1 items-center justify-center overflow-auto p-8">{Preview && (spec.category === "backgrounds" ? <div className="h-full w-full"><Preview key={`full-${replayKey}`} {...spec.demo} {...values} /></div> : <Preview key={`full-${replayKey}`} {...spec.demo} {...values} />)}</div></div>; }
function InstallModal({ name, method, setMethod, copied, onCopy, onClose }: { name: string; method: InstallMethod; setMethod: (value: InstallMethod) => void; copied: boolean; onCopy: () => void; onClose: () => void }) { const methods: { id: InstallMethod; label: string; note: string }[] = [{ id: "cli", label: "CLI", note: "Install with the registry command." }, { id: "code", label: "Code", note: "Copy the complete component source." }, { id: "prompt", label: "AI Prompt", note: "Copy a concise build prompt." }]; return <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={onClose}><div role="dialog" aria-modal="true" aria-label="Get this component" className="w-full max-w-lg border border-border bg-[#18181a] font-mono shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="text-lg font-bold">Get this component</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="text-muted-foreground hover:text-foreground">×</button></div><div className="p-5"><p className="mb-5 text-xs text-muted-foreground">{name} <span className="mx-1">›</span> React + Tailwind</p><h3 className="mb-3 font-semibold">Installation method</h3><div className="border border-border">{methods.map((item) => <button key={item.id} type="button" onClick={() => setMethod(item.id)} className={cn("flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left last:border-0", method === item.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60")}><span className={cn("grid size-4 place-items-center rounded-full border", method === item.id && "border-foreground bg-foreground text-background")}>{method === item.id && "•"}</span><span className="font-semibold">{item.label}</span><span className="ml-auto text-[10px]">{item.note}</span></button>)}</div><div className="mt-5 border border-border p-4"><h3 className="font-semibold">{method === "code" ? "Copy source code" : method === "cli" ? "Run installation command" : "Copy AI prompt"}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">{methods.find((item) => item.id === method)?.note}</p><button type="button" onClick={onCopy} className="mt-4 w-full bg-foreground px-4 py-3 font-semibold text-background hover:opacity-85">{copied ? "Copied!" : method === "cli" ? "Copy command" : method === "prompt" ? "Copy prompt" : "Copy code"}</button></div></div></div></div>; }
function buildPrompt(spec: MotionSpec) { return `Build a React + Tailwind component named ${spec.name}. ${spec.description} Include controls for: ${spec.params.map((param) => param.key).join(", ") || "no props"}.`; }
function CopyIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="9" y="9" width="11" height="11"/><path d="M15 9V4H4v11h5"/></svg>; }
function ChevronIcon({ className }: { className?: string }) { return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 10 5 5 5-5"/></svg>; }
function GridIcon() { return <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M3 3h18v18H3zM3 9h18M9 3v18"/></svg>; }
function ReplayIcon() { return <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 11a8 8 0 1 0 2 5.3M20 4v7h-7"/></svg>; }
function MaximizeIcon() { return <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>; }
