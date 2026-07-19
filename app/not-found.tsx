import Link from "next/link";
import { GlitchText } from "@/registry/typography/glitch";

export const metadata = { title: "404" };

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="text-7xl font-semibold tracking-tight sm:text-8xl">
        <GlitchText text="404" interval={1400} />
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-lg font-medium">페이지를 찾을 수 없습니다.</p>
        <p className="text-sm text-muted-foreground">
          주소가 바뀌었거나, 아직 만들어지지 않은 컴포넌트일 수 있어요.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
        >
          홈으로
        </Link>
        <Link
          href="/components"
          className="rounded-lg border border-border bg-muted px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent/40"
        >
          컴포넌트 둘러보기
        </Link>
      </div>
    </div>
  );
}
