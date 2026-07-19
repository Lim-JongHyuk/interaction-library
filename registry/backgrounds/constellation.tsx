"use client";

// deps: 없음 (Canvas 2D)
import { useEffect, useRef } from "react";

export interface ConstellationProps {
  /** 파티클 수 */
  count?: number;
  /** 파티클 연결 최대 거리(px) */
  linkDistance?: number;
  /** 표류 속도 */
  speed?: number;
  /** 선·점 색 */
  color?: string;
  /** 커서와 주변 파티클을 잇는 하이라이트 */
  cursorLink?: boolean;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * 표류하는 파티클들이 거리 기반으로 실처럼 이어지는 컨스텔레이션 배경.
 * 커서를 대면 주변 노드가 커서로 끌려와 거미줄처럼 연결된다.
 */
export function Constellation({
  count = 70,
  linkDistance = 110,
  speed = 1,
  color = "#818cf8",
  cursorLink = true,
}: ConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef({ linkDistance, speed, color, cursorLink });

  useEffect(() => {
    paramsRef.current = { linkDistance, speed, color, cursorLink };
  }, [linkDistance, speed, color, cursorLink]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    const pointer = { x: -9999, y: -9999 };

    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace("#", "");
      const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const n = parseInt(f, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function init() {
      width = Math.max(Math.floor(container!.clientWidth * dpr), 1);
      height = Math.max(Math.floor(container!.clientHeight * dpr), 1);
      canvas.width = width;
      canvas.height = height;
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 22 * dpr,
        vy: (Math.random() - 0.5) * 22 * dpr,
        r: (0.8 + Math.random() * 1.4) * dpr,
      }));
    }

    function draw(dt: number) {
      const p = paramsRef.current;
      const [cr, cg, cb] = hexToRgb(p.color);
      const link = p.linkDistance * dpr;
      const link2 = link * link;

      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx * p.speed * dt;
        n.y += n.vy * p.speed * dt;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // 커서 인력 (가까운 노드만 살짝 끌림)
        if (p.cursorLink) {
          const dx = pointer.x - n.x;
          const dy = pointer.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link2 * 2.2 && d2 > 1) {
            const d = Math.sqrt(d2);
            n.x += (dx / d) * 14 * dt * dpr;
            n.y += (dy / d) * 14 * dt * dpr;
          }
        }
      }

      // 노드 간 링크
      ctx.lineWidth = 1 * dpr * 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link2) {
            const alpha = (1 - d2 / link2) * 0.5;
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // 커서 링크 (더 밝게)
      if (p.cursorLink && pointer.x > -999) {
        for (const n of nodes) {
          const dx = n.x - pointer.x;
          const dy = n.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link2 * 1.8) {
            const alpha = (1 - d2 / (link2 * 1.8)) * 0.85;
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      // 노드 점
      ctx.fillStyle = `rgba(${cr},${cg},${cb},0.9)`;
      ctx.beginPath();
      for (const n of nodes) {
        ctx.moveTo(n.x + n.r, n.y);
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    let raf: number | null = null;
    let last = performance.now();
    function loop(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    }

    init();
    if (reduced) {
      draw(0); // 정적 한 프레임
    } else {
      raf = requestAnimationFrame(loop);
    }

    const ro = new ResizeObserver(() => {
      init();
      if (reduced) draw(0);
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        if (reduced) return;
        if (entries[0]?.isIntersecting) {
          if (raf === null) {
            last = performance.now();
            raf = requestAnimationFrame(loop);
          }
        } else if (raf !== null) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    function onMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) * dpr;
      pointer.y = (e.clientY - rect.top) * dpr;
    }
    function onLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      canvas.remove();
    };
  }, [count]);

  return <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-xl bg-zinc-950" />;
}
