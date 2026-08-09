"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

const DEFAULT_SRC = "https://picsum.photos/seed/halftone-reveal/1200/800";
const MODES = { mono: 0, duotone: 1, color: 2 } as const;
const SHAPES = { circle: 0, square: 1, diamond: 2, line: 3 } as const;
const TRIGGERS = { off: 0, hover: 1, always: 2 } as const;

const vertex = `precision highp float; attribute vec2 position; attribute vec2 uv; varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float; varying vec2 vUv;
uniform sampler2D tMap; uniform vec2 iResolution; uniform vec2 uImageSize; uniform vec2 uMouse; uniform float uActivity;
uniform float uDotSize,uDensity,uAngle,uContrast,uInvert,uRevealRadius,uEdge,uIdleReveal; uniform int uShape,uMode,uTrigger; uniform vec3 uInk,uPaper;
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec2 cover(vec2 uv){float ia=uImageSize.x/max(uImageSize.y,1.),pa=iResolution.x/max(iResolution.y,1.);vec2 s=pa>ia?vec2(1.,ia/pa):vec2(pa/ia,1.);return(uv-.5)*s+.5;}
float distShape(vec2 p){if(uShape==1)return max(abs(p.x),abs(p.y));if(uShape==2)return abs(p.x)+abs(p.y);if(uShape==3)return abs(p.y);return length(p);}
float dots(vec2 st,float density,float angle,float tone){vec2 grid=rot(angle)*st*density;vec2 cell=floor(grid)+.5;vec2 sampleUv=rot(-angle)*(cell/density);vec3 c=texture2D(tMap,clamp(cover(sampleUv),0.,1.)).rgb;c=clamp((c-.5)*uContrast+.5,0.,1.);c=mix(c,1.-c,uInvert);float ink=1.-dot(c,vec3(.299,.587,.114));float radius=sqrt(clamp(ink*tone,0.,1.))*.72*uDotSize;float d=distShape(fract(grid)-.5);float aa=fwidth(grid.x)*.65+.001;return smoothstep(radius+aa,radius-aa,d);}
void main(){
  vec2 aspect=vec2(iResolution.x/max(iResolution.y,1.),1.);vec2 st=vUv*aspect;float a=radians(uAngle);float density=uDensity;
  float mono=dots(st,density,a,1.);vec3 printed=mix(uPaper,uInk,mono);
  if(uMode==1){float second=dots(st,density,a+radians(38.),.8);vec3 ink2=mix(uInk.gbr,vec3(.90,.24,.30),.7);printed=mix(printed,ink2,second*.8);}
  if(uMode==2){float c=dots(st,density,a+radians(15.),.78),m=dots(st,density,a+radians(75.),.78),y=dots(st,density,a,.78),k=dots(st,density,a+radians(45.),.72);printed=uPaper;printed=mix(printed,printed*vec3(.1,.72,.9),c);printed=mix(printed,printed*vec3(.92,.1,.52),m);printed=mix(printed,printed*vec3(.98,.86,.1),y);printed=mix(printed,printed*vec3(.08),k);}
  vec2 delta=(vUv-uMouse)*aspect;float distance=length(delta);float activity=uTrigger==2?1.:(uTrigger==0?0.:uActivity);float radius=max(uRevealRadius,.0001)*mix(.4,1.,activity);float band=max(1.4/iResolution.y,radius*(1.-clamp(uEdge,0.,1.))*.45);float loupe=1.-smoothstep(radius-band,radius+band,distance);float focus=clamp(max(loupe*activity,uIdleReveal),0.,1.);vec3 sharp=texture2D(tMap,clamp(cover(vUv),0.,1.)).rgb;sharp=clamp((sharp-.5)*uContrast+.5,0.,1.);sharp=mix(sharp,1.-sharp,uInvert);gl_FragColor=vec4(mix(printed,sharp,focus),1.);
}`;

const hexToRgb = (hex: string): [number, number, number] => { const value = hex.replace("#", ""); const expanded = value.length === 3 ? value.split("").map((part) => part + part).join("") : value; const parsed = Number.parseInt(expanded, 16); return Number.isNaN(parsed) ? [0, 0, 0] : [((parsed >> 16) & 255) / 255, ((parsed >> 8) & 255) / 255, (parsed & 255) / 255]; };

export interface HalftoneRevealProps { src?: string; inkColor?: string; paperColor?: string; mode?: keyof typeof MODES; dotSize?: number; dotDensity?: number; angle?: number; shape?: keyof typeof SHAPES; contrast?: number; invert?: boolean; revealRadius?: number; edge?: number; follow?: number; idleReveal?: number; trigger?: keyof typeof TRIGGERS; borderRadius?: string; className?: string; style?: CSSProperties; }

export function HalftoneReveal({ src = DEFAULT_SRC, inkColor = "#141414", paperColor = "#fff7e6", mode = "mono", dotSize = 1, dotDensity = 71, angle = 45, shape = "circle", contrast = 1.15, invert = false, revealRadius = 0.4, edge = 0.8, follow = 0.37, idleReveal = 0, trigger = "hover", borderRadius = "16px", className = "", style }: HalftoneRevealProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ inkColor, paperColor, mode, dotSize, dotDensity, angle, shape, contrast, invert, revealRadius, edge, follow, idleReveal, trigger });
  propsRef.current = { inkColor, paperColor, mode, dotSize, dotDensity, angle, shape, contrast, invert, revealRadius, edge, follow, idleReveal, trigger };
  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio || 1, 2), alpha: false, antialias: true }); const gl = renderer.gl; const canvas = gl.canvas; canvas.className = "block h-full w-full"; mount.appendChild(canvas);
    const texture = new Texture(gl, { generateMipmaps: false });
    const uniforms = { tMap: { value: texture }, iResolution: { value: [1, 1] }, uImageSize: { value: [1, 1] }, uMouse: { value: [0.5, 0.5] }, uActivity: { value: 0 }, uDotSize: { value: dotSize }, uDensity: { value: dotDensity }, uAngle: { value: angle }, uShape: { value: SHAPES[shape] }, uInk: { value: hexToRgb(inkColor) }, uPaper: { value: hexToRgb(paperColor) }, uMode: { value: MODES[mode] }, uContrast: { value: contrast }, uInvert: { value: invert ? 1 : 0 }, uRevealRadius: { value: revealRadius }, uEdge: { value: edge }, uIdleReveal: { value: idleReveal }, uTrigger: { value: TRIGGERS[trigger] } };
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex, fragment, uniforms }) });
    const image = new window.Image(); image.crossOrigin = "anonymous"; image.onload = () => { texture.image = image; uniforms.uImageSize.value = [image.naturalWidth || 1, image.naturalHeight || 1]; }; image.src = src;
    const resize = () => { renderer.setSize(Math.max(1, mount.clientWidth), Math.max(1, mount.clientHeight)); uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height]; }; const observer = new ResizeObserver(resize); observer.observe(mount); resize();
    const pointer = { x: .5, y: .5, sx: .5, sy: .5, active: 0, target: 0 }; const onMove = (event: PointerEvent) => { const rect = mount.getBoundingClientRect(); pointer.x = (event.clientX - rect.left) / rect.width; pointer.y = 1 - (event.clientY - rect.top) / rect.height; pointer.target = reducedMotion ? 0 : 1; }; const onLeave = () => { pointer.target = 0; };
    mount.addEventListener("pointermove", onMove, { passive: true }); mount.addEventListener("pointerenter", onMove, { passive: true }); mount.addEventListener("pointerleave", onLeave);
    let frame = 0, previous = performance.now(); const loop = (now: number) => { frame = requestAnimationFrame(loop); const dt = Math.min(.05, Math.max(.001, (now - previous) / 1000)); previous = now; const current = propsRef.current; const followAmount = 1 - Math.exp(-dt / Math.max(.001, current.follow)); pointer.sx += (pointer.x - pointer.sx) * followAmount; pointer.sy += (pointer.y - pointer.sy) * followAmount; pointer.active += (pointer.target - pointer.active) * (1 - Math.exp(-dt / .18)); uniforms.uMouse.value = [pointer.sx, pointer.sy]; uniforms.uActivity.value = pointer.active; uniforms.uDotSize.value = current.dotSize; uniforms.uDensity.value = current.dotDensity; uniforms.uAngle.value = current.angle; uniforms.uShape.value = SHAPES[current.shape]; uniforms.uInk.value = hexToRgb(current.inkColor); uniforms.uPaper.value = hexToRgb(current.paperColor); uniforms.uMode.value = MODES[current.mode]; uniforms.uContrast.value = current.contrast; uniforms.uInvert.value = current.invert ? 1 : 0; uniforms.uRevealRadius.value = current.revealRadius; uniforms.uEdge.value = current.edge; uniforms.uIdleReveal.value = current.idleReveal; uniforms.uTrigger.value = TRIGGERS[current.trigger]; renderer.render({ scene: mesh }); }; frame = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); mount.removeEventListener("pointermove", onMove); mount.removeEventListener("pointerenter", onMove); mount.removeEventListener("pointerleave", onLeave); canvas.remove(); gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, [src]);
  return <div ref={mountRef} className={`relative h-[380px] w-full cursor-crosshair overflow-hidden ${className}`.trim()} style={{ borderRadius, ...style }} aria-label="Interactive halftone image reveal" />;
}
