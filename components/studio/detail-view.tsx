"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { MotionSpec, ParamDef } from "@/lib/spec";
import { defaultParamValues, type ParamValues } from "@/lib/codegen";
import { ParamControls } from "@/components/studio/param-controls";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/use-mounted";

const tocIds = ["preview", "controls", "reference", "installation", "cli", "manual", "source"] as const;

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [Preview, setPreview] = useState<ComponentType<Record<string, unknown>> | null>(null);
  const [activeSection, setActiveSection] = useState<(typeof tocIds)[number]>("preview");
  const [tocIndicator, setTocIndicator] = useState({ top: 0, height: 0 });
  const tocNavRef = useRef<HTMLElement>(null);
  const tocLinkRefs = useRef(new Map<(typeof tocIds)[number], HTMLAnchorElement>());
  const mounted = useMounted();
  const registryUrl = `${mounted ? window.location.origin : "<deployment-url>"}/${spec.install.registryPath}`;
  const installCommand = `pnpm dlx shadcn@latest add ${registryUrl}`;
  async function copy(value: string, id: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1400);
  }

  useEffect(() => {
    let active = true;
    import(`../../registry/${spec.category}/${spec.slug}`)
      .then((module) => {
        const component = Object.values(module).find((value): value is ComponentType<Record<string, unknown>> => typeof value === "function");
        if (active && component) setPreview(() => component);
      })
      .catch(() => active && setPreview(null));
    return () => { active = false; };
  }, [spec.category, spec.slug]);

  useEffect(() => {
    const updateActiveSection = () => {
      const next = tocIds.reduce<(typeof tocIds)[number]>((current, id) => {
        const element = document.getElementById(id);
        return element && element.getBoundingClientRect().top <= 176 ? id : current;
      }, "preview");
      setActiveSection((current) => current === next ? current : next);
    };
    const frame = window.requestAnimationFrame(updateActiveSection);
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    let measurementFrame = 0;
    const frame = window.requestAnimationFrame(() => {
      measurementFrame = window.requestAnimationFrame(() => {
        const nav = tocNavRef.current;
        const link = tocLinkRefs.current.get(activeSection);
        if (!nav || !link) return;
        const navBounds = nav.getBoundingClientRect();
        const linkBounds = link.getBoundingClientRect();
        setTocIndicator({ top: linkBounds.top - navBounds.top, height: linkBounds.height });
      });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(measurementFrame);
    };
  }, [activeSection]);

  const registerTocLink = (id: (typeof tocIds)[number], element: HTMLAnchorElement | null) => {
    if (element) tocLinkRefs.current.set(id, element);
    else tocLinkRefs.current.delete(id);
  };

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,780px)_180px] lg:justify-center lg:px-6 lg:py-12">
        <article className="min-w-0">
          <header className="border-b border-border pb-8">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.16em] text-accent">
              Components / {spec.category} / {spec.trigger}
            </p>
            <h1 className="text-4xl font-semibold leading-[0.98] tracking-[-0.06em] text-foreground sm:text-5xl">{spec.name}</h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted-foreground">{spec.description}</p>
            <div className="mt-6 flex flex-wrap gap-2 font-mono text-[11px]">
              <span className="rounded-md border border-border px-2.5 py-1 text-foreground/80">{spec.trigger} trigger</span>
              <span className="rounded-md border border-border px-2.5 py-1 text-muted-foreground">{spec.status}</span>
              {spec.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-md border border-border px-2.5 py-1 text-muted-foreground">#{tag}</span>)}
            </div>
          </header>

          <section id="preview" className="scroll-mt-20 pt-10" aria-labelledby="preview-title">
            <SectionTitle eyebrow="Live preview" id="preview-title">See it in motion</SectionTitle>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">The preview is interactive. Adjust the values below to tune the component before adding it to your project.</p>
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-border bg-[#111116]">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                <span>ORBIT / playground</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setGridBg((value) => !value)} className={cn("rounded-md border border-border px-2 py-1 transition-colors hover:text-foreground", gridBg && "border-accent text-accent")}>Grid</button>
                  <button type="button" onClick={() => setReplayKey((key) => key + 1)} className="rounded-md border border-border px-2 py-1 transition-colors hover:text-foreground">Replay</button>
                </div>
              </div>
              <div className={cn("flex min-h-[320px] items-center justify-center overflow-hidden p-6 sm:min-h-[460px]", gridBg && "mk-preview-grid")}>
                {Preview ? (
                  spec.category === "backgrounds" ? <div className="h-[360px] w-full sm:h-[420px]"><Preview key={replayKey} {...spec.demo} {...values} /></div> : <Preview key={replayKey} {...spec.demo} {...values} />
                ) : <span className="text-sm text-muted-foreground">Preview unavailable</span>}
              </div>
            </div>
          </section>

          <section id="controls" className="scroll-mt-20 border-t border-border pt-10 mt-12" aria-labelledby="controls-title">
            <SectionTitle eyebrow="Properties" id="controls-title">Customize</SectionTitle>
            <div className="mt-6">
              <div className="mb-5 flex items-center justify-between gap-4"><p className="text-sm text-muted-foreground">Changes update the live preview immediately.</p><button type="button" onClick={() => setValues(defaultParamValues(spec))} className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">Reset values</button></div>
              {spec.params.length ? <ParamControls params={spec.params} values={values} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} grid /> : <p className="text-sm text-muted-foreground">This component has no adjustable properties.</p>}
            </div>
          </section>

          <section id="reference" className="scroll-mt-20 border-t border-border pt-10 mt-12" aria-labelledby="reference-title">
            <SectionTitle eyebrow="Reference" id="reference-title">Props</SectionTitle>
            <div className="mt-6 overflow-x-auto rounded-xl border border-border">
              <table className="min-w-[620px] w-full border-collapse text-left text-sm"><thead className="bg-muted text-xs uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="px-4 py-3 font-medium">Prop</th><th className="px-4 py-3 font-medium">Control</th><th className="px-4 py-3 font-medium">Default</th><th className="px-4 py-3 font-medium">Description</th></tr></thead><tbody>{spec.params.map((param) => <ParamRow key={param.key} param={param} />)}</tbody></table>
            </div>
          </section>

          <section id="installation" className="scroll-mt-20 border-t border-border pt-10 mt-12" aria-labelledby="installation-title">
            <SectionTitle eyebrow="Get started" id="installation-title">Installation</SectionTitle>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Install from the registry, or add the component source manually when you need complete control over the file structure.</p>

            <div id="cli" className="scroll-mt-20 mt-8"><h3 className="text-lg font-semibold text-foreground">CLI</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Run this command from the root of your project.</p><CodePanel label="terminal" value={installCommand} copied={copiedId === "cli"} onCopy={() => copy(installCommand, "cli")} /></div>

            <div id="manual" className="scroll-mt-20 mt-10"><h3 className="text-lg font-semibold text-foreground">Manual</h3><ol className="mt-6 space-y-7 border-l border-border pl-6"><DocStep number="01" title="Create the component file">Create <code className="rounded bg-muted px-1.5 py-1 font-mono text-xs">{`components/orbit/${spec.slug}.tsx`}</code> in your project.</DocStep><DocStep number="02" title="Paste the source"><span>Copy the source below into the new file, then install the listed dependencies if your package manager requests them.</span></DocStep><DocStep number="03" title="Import and place it"><code className="rounded bg-muted px-1.5 py-1 font-mono text-xs">{`<${spec.name} />`}</code> is ready to place in a page, section, or component shell.</DocStep></ol></div>

            <div id="source" className="scroll-mt-20 mt-8"><h3 className="text-lg font-semibold text-foreground">Source code</h3><CodePanel label={`${spec.slug}.tsx`} value={source} copied={copiedId === "source"} onCopy={() => copy(source, "source")} tall /></div>
          </section>
        </article>

        <aside className="hidden lg:block">
          <nav ref={tocNavRef} aria-label="On this page" className="relative sticky top-24 border-l border-border pl-5"><span aria-hidden="true" style={{ transform: `translateY(${tocIndicator.top}px)`, height: `${tocIndicator.height}px` }} className="absolute -left-px top-0 w-px bg-foreground transition-[transform,height] duration-300 ease-out motion-reduce:transition-none" /><p className="mb-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">On this page</p><div className="flex flex-col gap-3 text-sm"><TocLink id="preview" activeSection={activeSection} registerRef={registerTocLink}>Live preview</TocLink><TocLink id="controls" activeSection={activeSection} registerRef={registerTocLink}>Customize</TocLink><TocLink id="reference" activeSection={activeSection} registerRef={registerTocLink}>Props</TocLink><TocLink id="installation" activeSection={activeSection} registerRef={registerTocLink}>Installation</TocLink><div className="-mt-1 flex flex-col gap-2 border-l border-border pl-3 text-xs"><TocLink id="cli" activeSection={activeSection} registerRef={registerTocLink} nested>CLI</TocLink><TocLink id="manual" activeSection={activeSection} registerRef={registerTocLink} nested>Manual</TocLink><TocLink id="source" activeSection={activeSection} registerRef={registerTocLink} nested>Source code</TocLink></div></div><div className="mt-10 border-t border-border pt-5 font-mono text-[11px] leading-5 text-muted-foreground"><p>Dependencies</p><p className="mt-1 text-foreground">{spec.dependencies.length ? spec.dependencies.join(", ") : "None"}</p></div></nav>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, id, children }: { eyebrow: string; id: string; children: React.ReactNode }) { return <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{eyebrow}</p><h2 id={id} className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">{children}</h2></div>; }
function TocLink({ id, activeSection, registerRef, nested = false, children }: { id: (typeof tocIds)[number]; activeSection: (typeof tocIds)[number]; registerRef: (id: (typeof tocIds)[number], element: HTMLAnchorElement | null) => void; nested?: boolean; children: React.ReactNode }) { const active = id === activeSection; return <a ref={(element) => registerRef(id, element)} href={`#${id}`} aria-current={active ? "location" : undefined} className={cn("transition-colors", nested ? "text-muted-foreground" : "text-muted-foreground", active ? "font-medium text-foreground" : "hover:text-foreground")}>{children}</a>; }
function DocStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <li className="relative list-none"><span className="absolute -left-[2.45rem] top-0 grid size-7 place-items-center rounded-full border border-border bg-background font-mono text-[10px] text-muted-foreground">{number}</span><h3 className="font-medium text-foreground">{title}</h3><div className="mt-2 text-sm leading-6 text-muted-foreground">{children}</div></li>; }
function CodePanel({ label, value, copied, onCopy, tall = false }: { label: string; value: string; copied: boolean; onCopy: () => void; tall?: boolean }) { return <div className="mt-4 overflow-hidden rounded-xl border border-border bg-[#19191e]"><div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 font-mono text-[11px] text-muted-foreground"><span>{label}</span><button type="button" onClick={onCopy} className="rounded-md border border-border px-2.5 py-1 text-foreground transition-colors hover:border-accent hover:text-accent">{copied ? "Copied" : "Copy"}</button></div><pre className={cn("overflow-auto p-4 font-mono text-xs leading-6 text-[#d8d7df]", tall ? "max-h-[32rem]" : "max-h-40")}><code>{value}</code></pre></div>; }
function ParamRow({ param }: { param: ParamDef }) { return <tr className="border-t border-border text-muted-foreground"><td className="px-4 py-3 font-mono text-xs text-foreground">{param.key}</td><td className="px-4 py-3"><code className="rounded bg-muted px-1.5 py-1 text-xs">{param.control}</code></td><td className="px-4 py-3 font-mono text-xs">{String(param.default)}</td><td className="px-4 py-3 text-xs leading-5">{describe(param)}</td></tr>; }
function describe(param: ParamDef) { if (param.control === "slider") return `Adjust ${param.label.toLowerCase()} from ${param.min} to ${param.max}${param.unit ?? ""}.`; if (param.control === "toggle") return `Enable or disable ${param.label.toLowerCase()}.`; if (param.control === "select") return `Choose the ${param.label.toLowerCase()} option.`; return `Set the ${param.label.toLowerCase()} value.`; }
