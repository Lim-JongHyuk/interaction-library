"use client";

// deps: three
import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ParticleTextProps {
  /** 렌더링할 텍스트 */
  text?: string;
  /** 감싸는 시맨틱 태그 (SEO·문서 구조용, 시각적으로는 항상 block 처리) */
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  /** 폰트 스타일 */
  font?: "Sans Serif" | "Serif" | "Monospace" | "Rounded";
  /** 파티클 색상 */
  color?: string;
  /** 파티클 크기(px) */
  particleSize?: number;
  /** 정지 상태에서 파티클이 글자 주변으로 흔들리는 정도. 0이면 완전히 고정 */
  spread?: number;
  /** 파티클 밀도 (높을수록 촘촘하게 샘플링) */
  density?: number;
  /** 마우스 인터랙션 on/off */
  mouseInteraction?: boolean;
  /** 마우스 반발력 세기 */
  force?: number;
  /** 마우스 반응 반경(px) */
  mouseRadius?: number;
  /** 반응 곡선의 날카로움. 클수록 커서 중심부에서 더 격렬하게 튕겨나간다 */
  hitStrength?: number;
  /** 애니메이션(스프링 복귀·흔들림) 속도 배율 */
  speed?: number;
  /** 텍스트와 캔버스 가장자리 사이 여백(px) */
  padding?: number;
}

const FONT_STACKS: Record<NonNullable<ParticleTextProps["font"]>, string> = {
  "Sans Serif": "system-ui, -apple-system, 'Segoe UI', sans-serif",
  Serif: "Georgia, 'Times New Roman', serif",
  Monospace: "'JetBrains Mono', 'Courier New', monospace",
  Rounded: "'Arial Rounded MT Bold', 'Segoe UI', sans-serif",
};

const MAX_PARTICLES = 9000;
const JITTER_PX = 8;
const SPRING = 0.06;
const DAMPING = 0.86;
const FORCE_SCALE = 2.4;

interface SampledPoint {
  x: number;
  y: number;
}

/**
 * WebGL 기반 인터랙티브 파티클 텍스트. 오프스크린 캔버스에서 글자 형태를
 * 픽셀 샘플링해 원본 좌표로 삼고, three.js Points로 렌더링한다. 커서가
 * 가까워지면 반발력으로 흩어졌다가 스프링으로 원래 글자 위치로 복귀한다.
 */
export function ParticleText({
  text = "Particle",
  tag = "h2",
  font = "Sans Serif",
  color = "#ffffff",
  particleSize = 2,
  spread = 1,
  density = 6,
  mouseInteraction = true,
  force = 2,
  mouseRadius = 120,
  hitStrength = 1,
  speed = 1,
  padding = 24,
}: ParticleTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);
  const paramsRef = useRef({
    color,
    particleSize,
    spread,
    mouseInteraction,
    force,
    mouseRadius,
    hitStrength,
    speed,
  });

  // 자주 바뀌는 물리 파라미터는 ref로만 반영 — 렌더러/지오메트리 재생성 없이 rAF 루프가 읽는다.
  useEffect(() => {
    paramsRef.current = { color, particleSize, spread, mouseInteraction, force, mouseRadius, hitStrength, speed };
    if (materialRef.current) {
      materialRef.current.color.set(color);
      materialRef.current.size = particleSize * Math.min(window.devicePixelRatio || 1, 2);
    }
  }, [color, particleSize, spread, mouseInteraction, force, mouseRadius, hitStrength, speed]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });
    renderer.domElement.setAttribute("aria-hidden", "true");

    // 부드러운 원형 스프라이트 (사각 포인트 방지)
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const sctx = spriteCanvas.getContext("2d")!;
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.65)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(paramsRef.current.color),
      size: paramsRef.current.particleSize * dpr,
      map: sprite,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    });
    materialRef.current = material;

    const points = new THREE.Points(new THREE.BufferGeometry(), material);
    scene.add(points);

    const offscreen = document.createElement("canvas");
    const octx = offscreen.getContext("2d", { willReadFrequently: true })!;

    /** 텍스트를 오프스크린에 그려 알파 픽셀을 샘플링 → 파티클 원점 좌표 목록 */
    function sampleText(width: number, height: number): SampledPoint[] {
      offscreen.width = width;
      offscreen.height = height;
      octx.clearRect(0, 0, width, height);

      const pad = padding * dpr;
      const maxWidth = Math.max(width - pad * 2, 1);
      const maxHeight = Math.max(height - pad * 2, 1);
      const stack = FONT_STACKS[font] ?? FONT_STACKS["Sans Serif"];

      let fontSize = maxHeight * 0.7;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      octx.font = `700 ${fontSize}px ${stack}`;
      const measured = octx.measureText(text).width;
      if (measured > maxWidth) {
        fontSize *= maxWidth / measured;
        octx.font = `700 ${fontSize}px ${stack}`;
      }
      octx.fillText(text, width / 2, height / 2);

      const data = octx.getImageData(0, 0, width, height).data;
      const gapCss = Math.max(2, 12 - density);
      const step = Math.max(2, Math.round(gapCss * dpr));
      const out: SampledPoint[] = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4 + 3] > 128) out.push({ x, y });
        }
      }
      if (out.length > MAX_PARTICLES) {
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [out[i], out[j]] = [out[j], out[i]];
        }
        out.length = MAX_PARTICLES;
      }
      return out;
    }

    let originX = new Float32Array(0);
    let originY = new Float32Array(0);
    let velX = new Float32Array(0);
    let velY = new Float32Array(0);
    let phase = new Float32Array(0);
    let count = 0;
    let hasBuiltOnce = false;

    function rebuild() {
      const width = Math.max(Math.floor(container!.clientWidth * dpr), 1);
      const height = Math.max(Math.floor(container!.clientHeight * dpr), 1);

      camera.right = width;
      camera.bottom = height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      const sampled = sampleText(width, height);
      count = sampled.length;

      const positions = new Float32Array(count * 3);
      originX = new Float32Array(count);
      originY = new Float32Array(count);
      velX = new Float32Array(count);
      velY = new Float32Array(count);
      phase = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        originX[i] = sampled[i].x;
        originY[i] = sampled[i].y;
        phase[i] = Math.random() * Math.PI * 2;

        if (!hasBuiltOnce && !reduced) {
          // 첫 마운트: 화면 전역에서 모여드는 진입 연출
          positions[i * 3] = Math.random() * width;
          positions[i * 3 + 1] = Math.random() * height;
        } else {
          positions[i * 3] = sampled[i].x;
          positions[i * 3 + 1] = sampled[i].y;
        }
        positions[i * 3 + 2] = 0;
      }

      points.geometry.dispose();
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      points.geometry = geometry;

      hasBuiltOnce = true;

      if (reduced) renderer.render(scene, camera);
    }

    const pointer = { x: -99999, y: -99999, active: false };
    let frameId: number | null = null;
    let elapsed = 0;
    const clock = new THREE.Clock();

    function frame() {
      const p = paramsRef.current;
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt * p.speed;
      const k = Math.min(dt * 60 * p.speed, 3);

      const pos = points.geometry.attributes.position.array as Float32Array;
      const radiusPx = p.mouseRadius * dpr;
      const radius2 = radiusPx * radiusPx;
      const exponent = 1 / Math.max(p.hitStrength, 0.05);

      for (let i = 0; i < count; i++) {
        const jitterX = p.spread > 0 ? Math.sin(elapsed * 1.6 + phase[i]) * JITTER_PX * p.spread * dpr : 0;
        const jitterY = p.spread > 0 ? Math.cos(elapsed * 1.3 + phase[i] * 1.7) * JITTER_PX * p.spread * dpr : 0;
        const tx = originX[i] + jitterX;
        const ty = originY[i] + jitterY;

        const x = pos[i * 3];
        const y = pos[i * 3 + 1];

        velX[i] += (tx - x) * SPRING * k;
        velY[i] += (ty - y) * SPRING * k;

        if (p.mouseInteraction && pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius2 && d2 > 1) {
            const d = Math.sqrt(d2);
            const proximity = 1 - d / radiusPx;
            const pushMag = Math.pow(proximity, exponent) * p.force * FORCE_SCALE * dpr;
            velX[i] += (dx / d) * pushMag * k;
            velY[i] += (dy / d) * pushMag * k;
          }
        }

        const damping = Math.pow(DAMPING, k);
        velX[i] *= damping;
        velY[i] *= damping;

        pos[i * 3] = x + velX[i] * k;
        pos[i * 3 + 1] = y + velY[i] * k;
      }
      points.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(frame);
    }

    rebuild();
    if (!reduced) {
      frameId = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => rebuild());
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        if (reduced) return;
        if (entries[0]?.isIntersecting) {
          if (frameId === null) {
            clock.getDelta();
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
      pointer.active = true;
    }
    function onPointerLeave() {
      pointer.active = false;
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      points.geometry.dispose();
      material.dispose();
      sprite.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
      materialRef.current = null;
    };
  }, [text, font, density, padding]);

  const Tag = tag as keyof React.JSX.IntrinsicElements;

  return (
    <Tag className="relative m-0 block h-full min-h-64 w-full overflow-hidden rounded-xl bg-black font-normal">
      <span className="sr-only">{text}</span>
      <div ref={containerRef} className="absolute inset-0" />
    </Tag>
  );
}
