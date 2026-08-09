"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 뷰포트 근처에 들어왔을 때만 children(라이브 프리뷰)을 마운트하고,
 * 벗어나면 언마운트해 poster로 되돌린다.
 * 카탈로그 그리드에서 WebGL 컨텍스트·rAF 루프가 동시에 수십 개 살아있는 것을 방지한다.
 */
export function LazyPreview({
  poster,
  children,
  className,
  rootMargin = "80px",
}: {
  poster: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [intersecting, setIntersecting] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    function updatePageVisibility() {
      setPageVisible(document.visibilityState === "visible");
    }
    updatePageVisibility();
    document.addEventListener("visibilitychange", updatePageVisibility);
    return () => document.removeEventListener("visibilitychange", updatePageVisibility);
  }, []);

  return (
    <div ref={ref} className={className}>
      {intersecting && pageVisible ? children : poster}
    </div>
  );
}
