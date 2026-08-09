"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

const MAX_DETAIL = 8;

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uScale;
uniform float uDetail;
uniform float uGlow;
uniform float uCoreSize;
uniform float uSwirl;
uniform float uFold;
uniform float uBlackPoint;
uniform float uBrightness;
uniform float uColorMode;
uniform float uGrain;
uniform float uGrainIntensity;
uniform float uOpacity;
uniform vec2 uMouse;
uniform float uMouseStrength;
uniform float uEnableMouse;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float time = iTime * uSpeed;
  vec2 p = uScale * ((gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y) - 0.5;
  if (uEnableMouse > 0.5) p += (uMouse - 0.5) * uMouseStrength * 2.0;

  vec2 i = p;
  float c = 0.0;
  float r = length(p + vec2(sin(time), sin(time * 0.3 + 5.0)) * 0.5);
  float d = length(p);
  float rot = d + time + p.x * uSwirl;
  float cosRot = cos(rot);
  mat2 warp = mat2(cos(rot - sin(time / 5.0)), sin(rot), -sin(cosRot - time), cosRot) * uFold;
  float glowCore = uGlow * max(uCoreSize, 0.001);

  for (float n = 0.0; n < 8.0; n++) {
    if (n >= uDetail) break;
    p *= warp;
    float t = r - time / (n + 3.0);
    i -= p + vec2(cos(t - i.x - r) + sin(t + i.y), sin(t - i.y) + cos(t + i.x) + r);
    c += glowCore / max(length(vec2(sin(i.x + t), cos(i.y + t))), 0.001);
  }

  float intensity = max(c / 6.0 - uBlackPoint, 0.0) * uBrightness;
  float g = clamp(intensity, 0.0, 1.0);
  float mid = uColorMode > 1.5 ? 0.65 : (uColorMode > 0.5 ? 0.35 : 0.5);
  vec3 color = mix(uColor1, uColor2, smoothstep(0.0, mid, g));
  color = mix(color, uColor3, smoothstep(mid, 1.0, g));

  float alpha = g;
  if (uGrain > 0.5) alpha += (hash(gl_FragCoord.xy + iTime) - 0.5) * uGrainIntensity;
  alpha = clamp(alpha, 0.0, 1.0) * uOpacity;
  fragColor = vec4(color * alpha, alpha);
}`;

type ColorMode = "molten" | "ember" | "frost";

export interface MoltenMetalProps {
  color1?: string;
  color2?: string;
  color3?: string;
  speed?: number;
  scale?: number;
  detail?: number;
  glow?: number;
  coreSize?: number;
  swirl?: number;
  fold?: number;
  blackPoint?: number;
  brightness?: number;
  colorMode?: ColorMode;
  grain?: boolean;
  grainIntensity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  opacity?: number;
  className?: string;
}

type MoltenConfig = Required<Omit<MoltenMetalProps, "className">>;

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return [1, 1, 1];
  return [Number.parseInt(match[1], 16) / 255, Number.parseInt(match[2], 16) / 255, Number.parseInt(match[3], 16) / 255];
};

const colorModeToFloat = (mode: ColorMode) => (mode === "ember" ? 1 : mode === "frost" ? 2 : 0);

export function MoltenMetal({
  color1 = "#5227FF",
  color2 = "#FF9FFC",
  color3 = "#FFFFFF",
  speed = 0.35,
  scale = 4,
  detail = 3,
  glow = 1.6,
  coreSize = 0.1,
  swirl = 1,
  fold = -0.2,
  blackPoint = 0.05,
  brightness = 1.3,
  colorMode = "molten",
  grain = true,
  grainIntensity = 0.05,
  mouseInteraction = true,
  mouseStrength = 0.3,
  opacity = 1,
  className = "",
}: MoltenMetalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<MoltenConfig>({ color1, color2, color3, speed, scale, detail, glow, coreSize, swirl, fold, blackPoint, brightness, colorMode, grain, grainIntensity, mouseInteraction, mouseStrength, opacity });

  useEffect(() => {
    configRef.current = { color1, color2, color3, speed, scale, detail, glow, coreSize, swirl, fold, blackPoint, brightness, colorMode, grain, grainIntensity, mouseInteraction, mouseStrength, opacity };
  }, [blackPoint, brightness, color1, color2, color3, colorMode, coreSize, detail, fold, glow, grain, grainIntensity, mouseInteraction, mouseStrength, opacity, scale, speed, swirl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const initial = configRef.current;

    const renderer = new Renderer({ webgl: 2, alpha: true, premultipliedAlpha: true, antialias: false, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.className = "block h-full w-full";
    container.appendChild(canvas);

    const uniforms = {
      iTime: { value: 0 }, iResolution: { value: new Float32Array([1, 1]) }, uSpeed: { value: initial.speed }, uScale: { value: initial.scale }, uDetail: { value: initial.detail }, uGlow: { value: initial.glow }, uCoreSize: { value: initial.coreSize }, uSwirl: { value: initial.swirl }, uFold: { value: initial.fold }, uBlackPoint: { value: initial.blackPoint }, uBrightness: { value: initial.brightness }, uColorMode: { value: colorModeToFloat(initial.colorMode) }, uGrain: { value: initial.grain ? 1 : 0 }, uGrainIntensity: { value: initial.grainIntensity }, uOpacity: { value: initial.opacity }, uMouse: { value: new Float32Array([0.5, 0.5]) }, uMouseStrength: { value: initial.mouseStrength }, uEnableMouse: { value: initial.mouseInteraction ? 1 : 0 }, uColor1: { value: new Float32Array(hexToRgb(initial.color1)) }, uColor2: { value: new Float32Array(hexToRgb(initial.color2)) }, uColor3: { value: new Float32Array(hexToRgb(initial.color3)) },
    };
    const program = new Program(gl, { vertex, fragment, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(Math.max(1, Math.floor(container.clientWidth)), Math.max(1, Math.floor(container.clientHeight)));
      uniforms.iResolution.value[0] = gl.drawingBufferWidth;
      uniforms.iResolution.value[1] = gl.drawingBufferHeight;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const targetMouse = [0.5, 0.5];
    const currentMouse = [0.5, 0.5];
    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouse[0] = (event.clientX - rect.left) / rect.width;
      targetMouse[1] = 1 - (event.clientY - rect.top) / rect.height;
    };
    const leave = () => { targetMouse[0] = 0.5; targetMouse[1] = 0.5; };
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerleave", leave);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let inView = true;
    let pageVisible = !document.hidden;
    const startTime = performance.now();
    const render = (time: number) => {
      const config = configRef.current;
      uniforms.iTime.value = reducedMotion ? 0 : (time - startTime) * 0.001;
      uniforms.uSpeed.value = config.speed;
      uniforms.uScale.value = config.scale;
      uniforms.uDetail.value = Math.max(1, Math.min(MAX_DETAIL, Math.round(config.detail)));
      uniforms.uGlow.value = config.glow;
      uniforms.uCoreSize.value = config.coreSize;
      uniforms.uSwirl.value = config.swirl;
      uniforms.uFold.value = config.fold;
      uniforms.uBlackPoint.value = config.blackPoint;
      uniforms.uBrightness.value = config.brightness;
      uniforms.uColorMode.value = colorModeToFloat(config.colorMode);
      uniforms.uGrain.value = config.grain ? 1 : 0;
      uniforms.uGrainIntensity.value = config.grainIntensity;
      uniforms.uOpacity.value = config.opacity;
      uniforms.uMouseStrength.value = config.mouseStrength;
      uniforms.uEnableMouse.value = config.mouseInteraction && !reducedMotion ? 1 : 0;
      const colors = [hexToRgb(config.color1), hexToRgb(config.color2), hexToRgb(config.color3)];
      uniforms.uColor1.value.set(colors[0]); uniforms.uColor2.value.set(colors[1]); uniforms.uColor3.value.set(colors[2]);
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      uniforms.uMouse.value[0] = currentMouse[0]; uniforms.uMouse.value[1] = currentMouse[1];
      renderer.render({ scene: mesh });
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };
    const start = () => { if (inView && pageVisible && frame === 0) frame = requestAnimationFrame(render); };
    const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = 0; } };
    const visibilityObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) start(); else stop(); }, { threshold: 0 });
    visibilityObserver.observe(container);
    const onVisibilityChange = () => { pageVisible = !document.hidden; if (pageVisible) start(); else stop(); };
    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop(); resizeObserver.disconnect(); visibilityObserver.disconnect(); document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave); canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`.trim()} aria-label="Animated molten metal background" />;
}
