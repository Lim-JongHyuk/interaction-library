import { cn } from "@/lib/cn";

export function BrandMark({ className, label = "Kinetiq" }: { className?: string; label?: string }) {
  return <span className={cn("inline-flex items-center gap-2.5", className)}><svg viewBox="0 0 32 32" aria-hidden="true" className="size-7 shrink-0"><rect width="32" height="32" rx="8" fill="#ff5a00"/><path d="M4.5 5.25h8.25v8.8c0 1.35.9 1.9 1.78.9L21.35 5.25h6.1L17.3 17.8c-5.75 6.4-12.8-1.2-12.8-7.45V5.25Z" fill="#fff"/><path d="M4.5 26.75h8.25v-8.8c0-1.35.9-1.9 1.78-.9l6.82 9.7h6.1L17.3 14.2c-5.75-6.4-12.8 1.2-12.8 7.45v5.1Z" fill="#fff"/></svg><span className="font-bold tracking-[-0.05em]">{label}</span></span>;
}
