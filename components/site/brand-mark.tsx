import { cn } from "@/lib/cn";

export function BrandMark({ className, label = "ORBIT" }: { className?: string; label?: string }) {
  return <span className={cn("inline-flex items-center gap-2.5", className)}><span aria-hidden="true" className="size-7 shrink-0 rounded-sm bg-black bg-center bg-no-repeat invert dark:invert-0" style={{ backgroundImage: "url('/brand-logo.png')", backgroundSize: "250% auto" }} /><span className="font-bold tracking-[-0.05em]">{label}</span></span>;
}
