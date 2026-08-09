"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { Geometry, Mesh, Program, RenderTarget, Renderer, Triangle } from "ogl";

const MAX_PARTICLES = 120;

const fieldVertex = `
precision highp float; attribute vec2 position; attribute vec2 aLocal; attribute float aWeight;
uniform vec2 uRes; varying vec2 vLocal; varying float vWeight;
void main() { vLocal = aLocal; vWeight = aWeight; vec2 clip = (position / uRes) * 2.0 - 1.0; gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0); }
`;
const fieldFragment = `
precision highp float; varying vec2 vLocal; varying float vWeight;
void main() { float a = exp(-dot(vLocal, vLocal) * 3.6) * vWeight; gl_FragColor = vec4(a, a, a, a); }
`;
const screenVertex = `
precision highp float; attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 0.0, 1.0); }
`;
const compositeFragment = `
precision highp float; uniform sampler2D tField; uniform vec3 uColor; uniform vec3 uAccent;
uniform float uMerge; uniform float uGlow; uniform float uOpacity; varying vec2 vUv;
void main() {
  float f = texture2D(tField, vUv).r; float edge = uMerge * 0.3;
  float core = smoothstep(uMerge - edge, uMerge + edge, f); float halo = smoothstep(uMerge * 0.12, uMerge, f);
  vec3 col = mix(uColor, uAccent, clamp(f / max(uMerge * 2.4, 0.001), 0.0, 1.0));
  float alpha = (core + halo * uGlow * (1.0 - core)) * uOpacity; if (alpha <= 0.002) discard;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

const hexToRgb = (hex: string): [number, number, number] => {
  let value = hex.replace("#", "").trim();
  if (value.length === 3) value = value.split("").map((part) => part + part).join("");
  const parsed = Number.parseInt(value || "000000", 16);
  return [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255];
};

export interface SwarmCursorProps {
  color?: string;
  accentColor?: string;
  count?: number;
  size?: number;
  merge?: number;
  glow?: number;
  opacity?: number;
  spread?: number;
  separation?: number;
  speed?: number;
  wander?: number;
  trail?: number;
  scatterOnClick?: boolean;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SwarmCursor({ color = "#ffffff", accentColor = "#ffffff", count = 10, size = 10, merge = 0.77, glow = 0.75, opacity = 1, spread = 100, separation = 0.15, speed = 2.5, wander = 0.25, trail = 0.75, scatterOnClick = true, enabled = true, children, className = "", style }: SwarmCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ color, accentColor, count, size, merge, glow, opacity, spread, separation, speed, wander, trail, scatterOnClick, enabled });
  propsRef.current = { color, accentColor, count, size, merge, glow, opacity, spread, separation, wander, speed, trail, scatterOnClick, enabled };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const renderer = new Renderer({ alpha: true, dpr: Math.min(window.devicePixelRatio || 1, 1.75) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    const canvas = gl.canvas;
    canvas.className = "pointer-events-none absolute inset-0 block h-full w-full select-none";
    container.appendChild(canvas);

    const maxQuads = MAX_PARTICLES * 3;
    const positions = new Float32Array(maxQuads * 8);
    const locals = new Float32Array(maxQuads * 8);
    const weights = new Float32Array(maxQuads * 4);
    const index = new Uint16Array(maxQuads * 6);
    for (let quad = 0; quad < maxQuads; quad++) {
      const vertex = quad * 4;
      locals.set([-1, -1, 1, -1, 1, 1, -1, 1], vertex * 2);
      index.set([vertex, vertex + 1, vertex + 2, vertex, vertex + 2, vertex + 3], quad * 6);
    }
    const geometry = new Geometry(gl, { position: { size: 2, data: positions, usage: gl.DYNAMIC_DRAW }, aLocal: { size: 2, data: locals }, aWeight: { size: 1, data: weights, usage: gl.DYNAMIC_DRAW }, index: { data: index } });
    const fieldProgram = new Program(gl, { vertex: fieldVertex, fragment: fieldFragment, uniforms: { uRes: { value: [1, 1] } }, transparent: true, depthTest: false, depthWrite: false, cullFace: false });
    fieldProgram.setBlendFunc(gl.ONE, gl.ONE);
    const fieldMesh = new Mesh(gl, { geometry, program: fieldProgram });
    const compositeProgram = new Program(gl, { vertex: screenVertex, fragment: compositeFragment, uniforms: { tField: { value: null }, uColor: { value: hexToRgb(color) }, uAccent: { value: hexToRgb(accentColor) }, uMerge: { value: merge }, uGlow: { value: glow }, uOpacity: { value: opacity } }, transparent: true, depthTest: false, depthWrite: false, cullFace: false });
    const compositeMesh = new Mesh(gl, { geometry: new Triangle(gl), program: compositeProgram });

    let target: RenderTarget | null = null;
    let width = 1, height = 1;
    const resize = () => {
      width = container.clientWidth || 1; height = container.clientHeight || 1;
      renderer.setSize(width, height); fieldProgram.uniforms.uRes.value = [width, height];
      target = new RenderTarget(gl, { width: Math.max(1, gl.drawingBufferWidth), height: Math.max(1, gl.drawingBufferHeight), depth: false });
    };
    const observer = new ResizeObserver(resize); observer.observe(container); resize();

    const px = new Float32Array(MAX_PARTICLES), py = new Float32Array(MAX_PARTICLES), vx = new Float32Array(MAX_PARTICLES), vy = new Float32Array(MAX_PARTICLES), scale = new Float32Array(MAX_PARTICLES), phase = new Float32Array(MAX_PARTICLES);
    const cursor = { x: width / 2, y: height / 2, active: false };
    const spawn = (particle: number, originX: number, originY: number) => { const angle = Math.random() * Math.PI * 2, radius = 25 + Math.random() * 120; px[particle] = originX + Math.cos(angle) * radius; py[particle] = originY + Math.sin(angle) * radius; vx[particle] = Math.cos(angle) * 60; vy[particle] = Math.sin(angle) * 60; scale[particle] = 0.65 + Math.random() * 0.6; phase[particle] = Math.random() * Math.PI * 2; };
    for (let particle = 0; particle < MAX_PARTICLES; particle++) spawn(particle, width / 2, height / 2);
    let activeCount = Math.max(1, Math.min(MAX_PARTICLES, Math.round(count))), burst = 0, animationFrame = 0, previous = performance.now();
    const updateCursor = (event: PointerEvent) => { const rect = container.getBoundingClientRect(); cursor.x = event.clientX - rect.left; cursor.y = event.clientY - rect.top; cursor.active = true; };
    const scatter = (event: PointerEvent) => { if (!propsRef.current.scatterOnClick || !propsRef.current.enabled) return; updateCursor(event); for (let particle = 0; particle < activeCount; particle++) { let dx = px[particle] - cursor.x, dy = py[particle] - cursor.y, distance = Math.hypot(dx, dy); if (distance < 0.01) { dx = Math.cos(Math.random() * Math.PI * 2); dy = Math.sin(Math.random() * Math.PI * 2); distance = 1; } const kick = 620 + propsRef.current.speed * 130; vx[particle] = dx / distance * kick; vy[particle] = dy / distance * kick; } burst = 1; };
    const deactivate = () => { cursor.active = false; };
    container.addEventListener("pointermove", updateCursor, { passive: true }); container.addEventListener("pointerenter", updateCursor, { passive: true }); container.addEventListener("pointerleave", deactivate); container.addEventListener("pointerdown", scatter);

    const frame = (now: number) => {
      animationFrame = requestAnimationFrame(frame);
      const props = propsRef.current, dt = Math.min((now - previous) / 1000, 0.05); previous = now;
      if (!props.enabled || reduceMotion || !target) { renderer.render({ scene: compositeMesh }); return; }
      const nextCount = Math.max(1, Math.min(MAX_PARTICLES, Math.round(props.count))), anchorX = cursor.active ? cursor.x : width / 2, anchorY = cursor.active ? cursor.y : height / 2;
      for (let particle = activeCount; particle < nextCount; particle++) spawn(particle, anchorX, anchorY);
      activeCount = nextCount; burst = Math.max(0, burst - dt / 0.5);
      const maxSpeed = 110 + Math.max(0.1, props.speed) * 165, steering = 4.5 + Math.max(0.1, props.speed) * 1.15, band = Math.max(20, props.spread * 0.55), separationDistance = Math.max(1, props.spread * 0.42 * (0.35 + props.separation));
      for (let particle = 0; particle < activeCount; particle++) {
        const dx = anchorX - px[particle], dy = anchorY - py[particle], distance = Math.hypot(dx, dy) || 0.0001, ux = dx / distance, uy = dy / distance;
        const orbit = band * (0.55 + 0.45 * Math.sin(now * 0.0013 + phase[particle]));
        const radial = Math.max(-1, Math.min(1, (distance - orbit) / (band * 0.85))), swirl = Math.sqrt(Math.max(0, 1 - radial * radial)) * (particle % 2 ? 1 : -1);
        let wishX = ux * radial - uy * swirl + Math.cos(now * 0.001 + phase[particle]) * props.wander, wishY = uy * radial + ux * swirl + Math.sin(now * 0.0013 + phase[particle]) * props.wander;
        const wishLength = Math.hypot(wishX, wishY) || 1; wishX /= wishLength; wishY /= wishLength;
        let ax = (wishX * maxSpeed - vx[particle]) * steering, ay = (wishY * maxSpeed - vy[particle]) * steering;
        for (let other = 0; other < activeCount; other++) { if (other === particle) continue; const sx = px[particle] - px[other], sy = py[particle] - py[other], distanceSquared = sx * sx + sy * sy; if (distanceSquared > 0.0001 && distanceSquared < separationDistance * separationDistance) { const otherDistance = Math.sqrt(distanceSquared), force = (1 - otherDistance / separationDistance) * maxSpeed * 3.2 * props.separation; ax += sx / otherDistance * force; ay += sy / otherDistance * force; } }
        vx[particle] += ax * dt; vy[particle] += ay * dt;
        const currentSpeed = Math.hypot(vx[particle], vy[particle]), limit = maxSpeed * (1 + burst * 3.5); if (currentSpeed > limit) { vx[particle] = vx[particle] / currentSpeed * limit; vy[particle] = vy[particle] / currentSpeed * limit; }
        px[particle] += vx[particle] * dt; py[particle] += vy[particle] * dt;
      }
      let quad = 0;
      const pushQuad = (x: number, y: number, radius: number, weight: number) => { const offset = quad * 8; positions.set([x-radius,y-radius,x+radius,y-radius,x+radius,y+radius,x-radius,y+radius], offset); const weightOffset = quad * 4; weights.fill(weight, weightOffset, weightOffset + 4); quad++; };
      for (let particle = 0; particle < activeCount; particle++) { const radius = props.size * scale[particle] * 2.1; pushQuad(px[particle], py[particle], radius, 1.1); if (props.trail > 0.05) pushQuad(px[particle] - vx[particle] * props.trail * 0.03, py[particle] - vy[particle] * props.trail * 0.03, radius * 0.7, 0.4); }
      geometry.attributes.position.needsUpdate = true; geometry.attributes.aWeight.needsUpdate = true; geometry.setDrawRange(0, quad * 6);
      compositeProgram.uniforms.uColor.value = hexToRgb(props.color); compositeProgram.uniforms.uAccent.value = hexToRgb(props.accentColor); compositeProgram.uniforms.uMerge.value = props.merge; compositeProgram.uniforms.uGlow.value = props.glow; compositeProgram.uniforms.uOpacity.value = props.opacity;
      renderer.render({ scene: fieldMesh, target, clear: true }); compositeProgram.uniforms.tField.value = target.texture; renderer.render({ scene: compositeMesh });
    };
    animationFrame = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(animationFrame); observer.disconnect(); container.removeEventListener("pointermove", updateCursor); container.removeEventListener("pointerenter", updateCursor); container.removeEventListener("pointerleave", deactivate); container.removeEventListener("pointerdown", scatter); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, []);

  return <div ref={containerRef} className={`relative h-[380px] w-full overflow-hidden rounded-2xl bg-slate-950 ${className}`.trim()} style={style}>{children && <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">{children}</div>}</div>;
}
