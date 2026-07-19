"use client";

// deps: none
import { useEffect, useRef } from "react";

export interface ThermalHeatmapProps {
  intensity?: number;
  decay?: number;
  radius?: number;
}

// 열화상 팔레트: 검정→남색→보라→빨강→주황→노랑→흰색 (256단계 LUT)
function buildPalette(): Uint8ClampedArray {
  const stops: [number, [number, number, number]][] = [
    [0.0, [4, 2, 12]],
    [0.2, [28, 16, 88]],
    [0.4, [120, 28, 130]],
    [0.6, [216, 54, 50]],
    [0.78, [246, 144, 30]],
    [0.9, [252, 224, 88]],
    [1.0, [255, 255, 255]],
  ];
  const lut = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let k = 0;
    while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [t0, c0] = stops[k];
    const [t1, c1] = stops[k + 1];
    const f = Math.min(1, Math.max(0, (t - t0) / (t1 - t0 || 1)));
    lut[i * 3] = c0[0] + (c1[0] - c0[0]) * f;
    lut[i * 3 + 1] = c0[1] + (c1[1] - c0[1]) * f;
    lut[i * 3 + 2] = c0[2] + (c1[2] - c0[2]) * f;
  }
  return lut;
}

/**
 * 커서가 지나간 자리에 열이 쌓이고 서서히 확산·냉각되는
 * 애플 열화상 스타일 히트맵. 저해상도 열 버퍼를 시뮬레이션한 뒤
 * 업스케일해 부드러운 그라디언트를 얻는다.
 */
export function ThermalHeatmap({ intensity = 1, decay = 0.965, radius = 5 }: ThermalHeatmapProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = buildPalette();

    // 저해상도 시뮬레이션 그리드
    const GW = 120;
    let GH = 60;
    let heat = new Float32Array(GW * GH);
    let next = new Float32Array(GW * GH);

    // 표시용 저해상도 캔버스 (업스케일 소스)
    const simCanvas = document.createElement("canvas");
    simCanvas.width = GW;
    const simCtx = simCanvas.getContext("2d")!;
    let image: ImageData;

    function resize() {
      const rect = wrapper!.getBoundingClientRect();
      canvas!.width = Math.max(1, Math.round(rect.width));
      canvas!.height = Math.max(1, Math.round(rect.height));
      GH = Math.max(20, Math.round((GW * rect.height) / Math.max(1, rect.width)));
      heat = new Float32Array(GW * GH);
      next = new Float32Array(GW * GH);
      simCanvas.height = GH;
      image = simCtx.createImageData(GW, GH);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    function addHeat(gx: number, gy: number) {
      const r = radius;
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = Math.round(gx + dx);
          const y = Math.round(gy + dy);
          if (x < 0 || x >= GW || y < 0 || y >= GH) continue;
          const d2 = dx * dx + dy * dy;
          const add = Math.exp(-d2 / (r * r * 0.5)) * 0.55 * intensity;
          const idx = y * GW + x;
          heat[idx] = Math.min(1.6, heat[idx] + add);
        }
      }
    }

    function stepSim() {
      // 4방향 확산 + 감쇠
      for (let y = 0; y < GH; y++) {
        for (let x = 0; x < GW; x++) {
          const i = y * GW + x;
          const l = x > 0 ? heat[i - 1] : 0;
          const r = x < GW - 1 ? heat[i + 1] : 0;
          const u = y > 0 ? heat[i - GW] : 0;
          const d = y < GH - 1 ? heat[i + GW] : 0;
          next[i] = (heat[i] + (l + r + u + d - 4 * heat[i]) * 0.18) * decay;
        }
      }
      [heat, next] = [next, heat];
    }

    function render() {
      const data = image.data;
      for (let i = 0; i < GW * GH; i++) {
        const v = Math.min(255, Math.round(Math.min(1, heat[i]) * 255));
        data[i * 4] = palette[v * 3];
        data[i * 4 + 1] = palette[v * 3 + 1];
        data[i * 4 + 2] = palette[v * 3 + 2];
        data[i * 4 + 3] = 255;
      }
      simCtx.putImageData(image, 0, 0);
      ctx!.imageSmoothingEnabled = true;
      ctx!.drawImage(simCanvas, 0, 0, canvas!.width, canvas!.height);
    }

    function loop() {
      stepSim();
      render();
      rafRef.current = requestAnimationFrame(loop);
    }

    if (!reduced) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      render();
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      const gx = ((e.clientX - rect.left) / rect.width) * GW;
      const gy = ((e.clientY - rect.top) / rect.height) * GH;
      addHeat(gx, gy);
      if (reduced) render();
    }
    wrapper.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      wrapper.removeEventListener("pointermove", onPointerMove);
    };
  }, [intensity, decay, radius]);

  return (
    <div ref={wrapperRef} className="relative h-full w-full overflow-hidden rounded-xl bg-black">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-widest text-white/40">
        thermal · move cursor
      </p>
    </div>
  );
}
