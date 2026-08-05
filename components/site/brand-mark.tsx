import { cn } from "@/lib/cn";

export function BrandMark({ className, label = "Kinetiq" }: { className?: string; label?: string }) {
  return <span className={cn("inline-flex items-center gap-2.5", className)}><svg viewBox="0 0 32 32" aria-hidden="true" className="size-7 shrink-0"><path d="M3.5 4h10v9.65c0 1.15.75 1.7 1.5.8L21.6 4H29L17.2 17.05c-3.05 3.4-7.7 2.55-10.6-.5-2-2.1-3.1-4.65-3.1-7.65V4Z" fill="#fff"/><path d="M3.5 28h10v-9.65c0-1.15.75-1.7 1.5-.8L21.6 28H29L17.2 14.95c-3.05-3.4-7.7-2.55-10.6.5-2 2.1-3.1 4.65-3.1 7.65V28Z" fill="#fff"/></svg><span className="font-bold tracking-[-0.05em]">{label}</span></span>;
}
