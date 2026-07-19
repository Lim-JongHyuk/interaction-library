"use client";

// deps: 없음 (Canvas 2D)
import { useEffect, useRef } from "react";

export interface ParticleMorphProps {
  /** `|` 로 구분한 단어 목록. 순서대로 모핑하며 순환한다 */
  words?: string;
  /** 픽셀 샘플링 간격(px). 작을수록 파티클이 촘촘하고 무거움 */
  gap?: number;
  /** 파티클 반지름(px) */
  particleSize?: number;
  /** 단어당 유지 시간(초) */
  interval?: number;
  /** 커서 반발 반경(px). 0이면 반발 없음 */
  repelRadius?: number;
  /** 파티클 색 */
  color?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  size: number;
}

/**
 * 텍스트를 수천 개의 파티클로 분해해 단어 사이를 유기적으로 모핑하는
 * 타이포그래피. 스프링 물리 + 커서 반발 필드를 Canvas 2D로 시뮬레이션한다.
 */
export function ParticleMorph({
  words = "MOTION|MORPH|KIT",
  gap = 4,
  particleSize = 1.4,
  interval = 3,
  repelRadius = 90,
  color = "#a5b4fc",
}: ParticleMorphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef({ particleSize, interval, repelRadius, color });

  useEffect(() => {
    paramsRef.current = { particleSize, interval, repelRadius, color };
  }, [particleSize, interval, repelRadius, color]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wordList = words.split("|").map((w) => w.trim()).filter(Boolean);
    if (wordList.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });
    container.appendChild(canvas);
    const ctx = canvas.getContext("2d")!;

    const offscreen = document.createElement("canvas");
    const octx = offscreen.getContext("2d", { willReadFrequently: true })!;

    let width = 0;
    let height = 0;

    /** 단어를 오프스크린에 그려 알파 픽셀을 샘플링 → 타깃 좌표 목록 */
    function sampleWord(word: string): { x: number; y: number }[] {
      offscreen.width = width;
      offscreen.height = height;
      octx.clearRect(0, 0, width, height);
      // 컨테이너 폭에 맞춰 폰트 크기 이진 탐색 없이 measure 기반 축소
      let fontSize = height * 0.6;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.font = `800 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      const maxWidth = width * 0.88;
      const measured = octx.measureText(word).width;
      if (measured > maxWidth) {
        fontSize *= maxWidth / measured;
        octx.font = `800 ${fontSize}px ui-sans-serif, system-ui, sans-serif`;
      }
      octx.fillText(word, width / 2, height / 2);

      const data = octx.getImageData(0, 0, width, height).data;
      const step = Math.max(2, Math.round(gap * dpr));
      const points: { x: number; y: number }[] = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4 + 3] > 128) points.push({ x, y });
        }
      }
      return points;
    }

    let particles: Particle[] = [];
    let wordIndex = 0;

    function shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    function morphTo(index: number) {
      const targets = shuffle(sampleWord(wordList[index]));
      if (targets.length === 0) return;

      // 파티클 수를 타깃 수에 맞춘다: 부족분은 기존 파티클 근처에서 분열, 초과분은 제거
      while (particles.length < targets.length) {
        const src = particles.length > 0
          ? particles[Math.floor(Math.random() * particles.length)]
          : { x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0 };
        particles.push({
          x: src.x + (Math.random() - 0.5) * 40,
          y: src.y + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          tx: 0,
          ty: 0,
          size: 0.6 + Math.random() * 0.8,
        });
      }
      if (particles.length > targets.length) particles.length = targets.length;

      for (let i = 0; i < particles.length; i++) {
        particles[i].tx = targets[i].x;
        particles[i].ty = targets[i].y;
      }
    }

    const pointer = { x: -9999, y: -9999 };
    let frameId: number | null = null;
    let morphTimer = 0;
    let lastTime = performance.now();

    function physics(dt: number) {
      const p = paramsRef.current;
      const repelR = p.repelRadius * dpr;
      const repelR2 = repelR * repelR;
      // 60fps 기준 계수를 dt로 스케일
      const k = Math.min(dt * 60, 2);
      for (const pt of particles) {
        // 스프링
        pt.vx += (pt.tx - pt.x) * 0.045 * k;
        pt.vy += (pt.ty - pt.y) * 0.045 * k;
        // 커서 반발
        if (repelR > 0) {
          const dx = pt.x - pointer.x;
          const dy = pt.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < repelR2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            const force = ((repelR - d) / repelR) * 6 * k;
            pt.vx += (dx / d) * force;
            pt.vy += (dy / d) * force;
          }
        }
        // 감쇠
        const damping = Math.pow(0.82, k);
        pt.vx *= damping;
        pt.vy *= damping;
        pt.x += pt.vx * k;
        pt.y += pt.vy * k;
      }
    }

    function draw() {
      const p = paramsRef.current;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = p.color;
      const r = p.particleSize * dpr;
      ctx.beginPath();
      for (const pt of particles) {
        const size = r * pt.size;
        ctx.moveTo(pt.x + size, pt.y);
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    function frame(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 1 / 20);
      lastTime = now;

      if (wordList.length > 1) {
        morphTimer += dt;
        if (morphTimer >= paramsRef.current.interval) {
          morphTimer = 0;
          wordIndex = (wordIndex + 1) % wordList.length;
          morphTo(wordIndex);
        }
      }

      physics(dt);
      draw();
      frameId = requestAnimationFrame(frame);
    }

    function updateSize() {
      width = Math.max(Math.floor(container!.clientWidth * dpr), 1);
      height = Math.max(Math.floor(container!.clientHeight * dpr), 1);
      canvas.width = width;
      canvas.height = height;
      morphTo(wordIndex);
      if (reduced) {
        // 애니메이션 없이 타깃 위치에 즉시 배치
        for (const pt of particles) {
          pt.x = pt.tx;
          pt.y = pt.ty;
          pt.vx = 0;
          pt.vy = 0;
        }
        draw();
      }
    }

    updateSize();
    // 초기 진입: 화면 전역에서 모여드는 연출
    if (!reduced) {
      for (const pt of particles) {
        pt.x = Math.random() * width;
        pt.y = Math.random() * height;
      }
      frameId = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(updateSize);
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        if (reduced) return;
        if (entries[0]?.isIntersecting) {
          if (frameId === null) {
            lastTime = performance.now();
            frameId = requestAnimationFrame(frame);
          }
        } else if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    function onPointerMove(e: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) * dpr;
      pointer.y = (e.clientY - rect.top) * dpr;
    }
    function onPointerLeave() {
      pointer.x = -9999;
      pointer.y = -9999;
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      canvas.remove();
      particles = [];
    };
  }, [words, gap]);

  const firstWord = words.split("|")[0]?.trim() ?? "";

  return (
    <div ref={containerRef} className="relative h-full min-h-40 w-full overflow-hidden" role="img" aria-label={firstWord}>
      <span className="sr-only">{words.split("|").map((w) => w.trim()).join(", ")}</span>
    </div>
  );
}
