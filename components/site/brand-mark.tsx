import { cn } from "@/lib/cn";

export function BrandMark({ className, label = "Kinetiq" }: { className?: string; label?: string }) {
  return <span className={cn("inline-flex items-center gap-2.5", className)}><svg viewBox="0 0 32 32" aria-hidden="true" className="size-7 shrink-0"><path d="M4 4h5.2v7.55L15.25 4h6.35l-7.7 9.05L22.4 28h-6.25l-7-10.05V28H4V4Z" fill="#1ed760"/></svg><span className="font-bold tracking-[-0.05em]">{label}</span></span>;
}
