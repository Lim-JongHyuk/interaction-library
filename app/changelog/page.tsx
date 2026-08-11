import Link from "next/link";
import { loadSpecs } from "@/lib/load-specs";

export const metadata = { title: "Changelog" };

function formatMonth(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(`${value}-01T00:00:00`));
}

function ComponentLinks({ items }: { items: ReturnType<typeof loadSpecs> }) {
  return <>{items.slice(0, 5).map((item, index) => <span key={`${item.category}/${item.slug}`}><Link href={`/docs/${item.category}/${item.slug}`} className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-accent hover:text-accent">{item.name}</Link>{index < Math.min(items.length, 5) - 1 ? ", " : ""}</span>)}{items.length > 5 ? `, and ${items.length - 5} more.` : "."}</>;
}

export default function ChangelogPage() {
  const specs = loadSpecs();
  const monthlyReleases = Array.from(specs.reduce((groups, spec) => {
    const month = spec.createdAt.slice(0, 7);
    const current = groups.get(month) ?? [];
    current.push(spec);
    groups.set(month, current);
    return groups;
  }, new Map<string, typeof specs>()).entries()).sort(([a], [b]) => b.localeCompare(a));
  const recentReleases = monthlyReleases.slice(0, 3);

  return <main className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8 sm:py-10 lg:px-6 lg:py-12">
    <header className="border-b border-border pb-8 sm:pb-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Library updates</p>
      <h1 className="mt-3 text-4xl font-semibold leading-none tracking-[-0.055em] sm:text-5xl">Changelog</h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">What changed in ORBIT, month by month.</p>
    </header>

    <section className="max-w-3xl py-8 text-sm leading-7 text-muted-foreground sm:py-10 sm:text-base">
      <p>New components, practical fixes, and documentation improvements are recorded here as the library grows. Every component page keeps its own installation details and usage notes.</p>
      <p className="mt-4">The most recent updates are shown below. Earlier releases remain available as a compact index for scanning.</p>
    </section>

    <section aria-labelledby="recent-releases" className="max-w-3xl">
      <h2 id="recent-releases" className="border-b border-border pb-3 text-2xl font-semibold tracking-[-0.04em]">Recent releases</h2>
      <div>{recentReleases.map(([month, items]) => <article key={month} className="border-b border-border py-7 sm:py-8"><h3 className="text-lg font-semibold tracking-[-0.03em]"><a href={`#${month}`} className="underline decoration-border underline-offset-4 hover:decoration-accent">{formatMonth(month)}</a></h3><p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base"><ComponentLinks items={items} /></p></article>)}</div>
    </section>

    <section aria-labelledby="all-releases" className="mt-12 max-w-3xl">
      <h2 id="all-releases" className="border-b border-border pb-3 text-2xl font-semibold tracking-[-0.04em]">All releases</h2>
      <div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-sm"><thead className="border-b border-border font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><tr><th className="w-36 py-3 font-medium">Month</th><th className="py-3 font-medium">Highlights</th></tr></thead><tbody>{monthlyReleases.map(([month, items]) => <tr id={month} key={month} className="border-b border-border align-top"><th scope="row" className="py-4 pr-5 font-medium text-foreground"><a href={`#${month}`} className="underline decoration-border underline-offset-4 hover:decoration-accent">{formatMonth(month)}</a></th><td className="py-4 leading-6 text-muted-foreground"><ComponentLinks items={items} /></td></tr>)}</tbody></table></div>
    </section>
  </main>;
}
