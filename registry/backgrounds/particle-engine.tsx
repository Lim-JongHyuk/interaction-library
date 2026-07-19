"use client";

// deps: three
import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ParticleEngineProps {
  count?: number;
  color?: string;
  speed?: number;
  parallax?: boolean;
}

/**
 * 수천 개의 파티클이 구형 클라우드로 떠다니는 몰입형 3D 파티클 엔진.
 * 마우스 패럴랙스로 카메라가 부드럽게 따라오고, 파티클은 개별 위상으로 맥동한다.
 */
export function ParticleEngine({ count = 4000, color = "#818cf8", speed = 1, parallax = true }: ParticleEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef({ speed, parallax });

  useEffect(() => {
    paramsRef.current = { speed, parallax };
  }, [speed, parallax]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.12);
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });

    // 구형 셸 분포로 파티클 배치 + 개별 맥동 위상 저장
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.pow(Math.random(), 0.6) * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      phases[i] = Math.random() * Math.PI * 2;
    }
    const basePositions = positions.slice();

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    // 원형 스프라이트 텍스처 (사각 포인트 방지)
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const sctx = spriteCanvas.getContext("2d")!;
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.055,
      map: sprite,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = { x: 0, y: 0 };
    let frameId: number | null = null;
    let elapsed = 0;
    const clock = new THREE.Clock();

    function updateSize() {
      const width = Math.max(container!.clientWidth, 1);
      const height = Math.max(container!.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function frame() {
      const p = paramsRef.current;
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt * p.speed;

      points.rotation.y = elapsed * 0.08;
      points.rotation.x = Math.sin(elapsed * 0.05) * 0.15;

      // 파티클 맥동 (반경 방향 미세 진동)
      const pos = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const pulse = 1 + Math.sin(elapsed * 1.4 + phases[i]) * 0.035;
        pos[i * 3] = basePositions[i * 3] * pulse;
        pos[i * 3 + 1] = basePositions[i * 3 + 1] * pulse;
        pos[i * 3 + 2] = basePositions[i * 3 + 2] * pulse;
      }
      geometry.attributes.position.needsUpdate = true;

      // 마우스 패럴랙스
      if (p.parallax) {
        camera.position.x += (pointer.x * 1.4 - camera.position.x) * 0.04;
        camera.position.y += (-pointer.y * 1.4 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(frame);
    }

    updateSize();
    if (reduced) {
      renderer.render(scene, camera);
    } else {
      frameId = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      updateSize();
      if (reduced) renderer.render(scene, camera);
    });
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
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    }
    container.addEventListener("pointermove", onPointerMove);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      geometry.dispose();
      material.dispose();
      sprite.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    };
  }, [count, color]);

  return <div ref={containerRef} className="relative h-full w-full overflow-hidden rounded-xl bg-black" />;
}
