"use client";

// deps: three, postprocessing
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Effect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

export type PixelBlastVariant = "square" | "circle" | "triangle" | "diamond";

export interface PixelBlastProps {
  variant?: PixelBlastVariant;
  pixelSize?: number;
  color?: string;
  patternScale?: number;
  patternDensity?: number;
  pixelSizeJitter?: number;
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  liquid?: boolean;
  liquidStrength?: number;
  liquidWobbleSpeed?: number;
  speed?: number;
  edgeFade?: number;
  noiseAmount?: number;
  transparent?: boolean;
}

const shapeIds: Record<PixelBlastVariant, number> = { square: 0, circle: 1, triangle: 2, diamond: 3 };

const vertexShader = /* glsl */ `void main() { gl_Position = vec4(position, 1.0); }`;
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 uResolution; uniform vec3 uColor; uniform float uTime; uniform float uPixelSize;
  uniform float uScale; uniform float uDensity; uniform float uJitter; uniform float uEdgeFade;
  uniform float uRippleSpeed; uniform float uRippleThickness; uniform float uRippleIntensity; uniform int uShape;
  uniform vec2 uClicks[8]; uniform float uClickTimes[8];
  out vec4 fragColor;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) { vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y); }
  float fbm(vec2 p) { float v=0., a=.5; for(int i=0;i<4;i++){v+=a*noise(p);p=p*1.9+8.;a*=.5;} return v; }
  void main() {
    vec2 res=max(uResolution, vec2(1.)); vec2 xy=gl_FragCoord.xy; float size=max(1.,uPixelSize);
    vec2 grid=floor(xy/size); vec2 cell=fract(xy/size); float pattern=fbm(grid/(32.0/max(uScale,.1))+uTime*.075);
    float level=smoothstep(.48-uDensity*.18, .78-uDensity*.12, pattern);
    for(int i=0;i<8;i++){ if(uClicks[i].x>=0.) { float age=max(0.,uTime-uClickTimes[i]); float d=distance(xy,uClicks[i])/min(res.x,res.y); float ring=exp(-pow((d-age*uRippleSpeed)/max(.001,uRippleThickness),2.)); level=max(level,ring*exp(-age*.75)*uRippleIntensity); } }
    float jitter=1.+(hash(grid)-.5)*uJitter; float mask=step(.5,level)*jitter;
    vec2 p=cell-.5; if(uShape==1) mask*=step(length(p), .48); else if(uShape==2) mask*=step(abs(p.x)+p.y, .45); else if(uShape==3) mask*=step(abs(p.x)+abs(p.y), .6);
    vec2 uv=xy/res; float edge=min(min(uv.x,uv.y),min(1.-uv.x,1.-uv.y)); mask*=smoothstep(0.,max(.001,uEdgeFade),edge);
    fragColor=vec4(uColor, mask);
  }
`;

export function PixelBlast({
  variant = "circle", pixelSize = 6, color = "#b497cf", patternScale = 3, patternDensity = 1.2,
  pixelSizeJitter = 0.5, enableRipples = true, rippleSpeed = 0.4, rippleThickness = 0.12,
  rippleIntensityScale = 1.5, liquid = false, liquidStrength = 0.12, liquidWobbleSpeed = 5,
  speed = 0.6, edgeFade = 0.25, noiseAmount = 0, transparent = true,
}: PixelBlastProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ variant, pixelSize, color, patternScale, patternDensity, pixelSizeJitter, enableRipples, rippleSpeed, rippleThickness, rippleIntensityScale, liquid, liquidStrength, liquidWobbleSpeed, speed, edgeFade, noiseAmount, transparent });
  useEffect(() => {
    propsRef.current = { variant, pixelSize, color, patternScale, patternDensity, pixelSizeJitter, enableRipples, rippleSpeed, rippleThickness, rippleIntensityScale, liquid, liquidStrength, liquidWobbleSpeed, speed, edgeFade, noiseAmount, transparent };
  }, [variant, pixelSize, color, patternScale, patternDensity, pixelSizeJitter, enableRipples, rippleSpeed, rippleThickness, rippleIntensityScale, liquid, liquidStrength, liquidWobbleSpeed, speed, edgeFade, noiseAmount, transparent]);

  // The renderer is intentionally created once; props are synchronized from propsRef in each frame.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = "block h-full w-full";
    host.appendChild(renderer.domElement);
    const uniforms = { uResolution: { value: new THREE.Vector2(1, 1) }, uColor: { value: new THREE.Color(color) }, uTime: { value: 0 }, uPixelSize: { value: pixelSize }, uScale: { value: patternScale }, uDensity: { value: patternDensity }, uJitter: { value: pixelSizeJitter }, uEdgeFade: { value: edgeFade }, uRippleSpeed: { value: rippleSpeed }, uRippleThickness: { value: rippleThickness }, uRippleIntensity: { value: rippleIntensityScale }, uShape: { value: shapeIds[variant] }, uClicks: { value: Array.from({ length: 8 }, () => new THREE.Vector2(-1, -1)) }, uClickTimes: { value: new Float32Array(8) } };
    const scene = new THREE.Scene(); const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthTest: false, depthWrite: false, glslVersion: THREE.GLSL3 });
    scene.add(new THREE.Mesh(geometry, material));
    const composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera));
    const postEffect = new Effect("PixelBlastPost", `uniform float uTime; uniform float uLiquid; uniform float uFrequency; uniform float uNoise; void mainUv(inout vec2 uv) { uv += sin((uv.yx+uTime*.03)*uFrequency)*uLiquid*.003; } void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor) { float n=fract(sin(dot(uv+uTime,vec2(12.9898,78.233)))*43758.5453)-.5; outputColor=inputColor+vec4(vec3(n*uNoise),0.); }`, { uniforms: new Map([["uTime", new THREE.Uniform(0)], ["uLiquid", new THREE.Uniform(liquid ? liquidStrength : 0)], ["uFrequency", new THREE.Uniform(liquidWobbleSpeed)], ["uNoise", new THREE.Uniform(noiseAmount)]]) });
    composer.addPass(new EffectPass(camera, postEffect));
    const resize = () => { const w=Math.max(1,host.clientWidth), h=Math.max(1,host.clientHeight); renderer.setSize(w,h,false); composer.setSize(w,h); uniforms.uResolution.value.set(renderer.domElement.width,renderer.domElement.height); };
    resize(); const ro = new ResizeObserver(resize); ro.observe(host);
    let clickIndex=0; const onPointerDown=(event: PointerEvent)=>{ if(!propsRef.current.enableRipples)return; const rect=renderer.domElement.getBoundingClientRect(); const x=(event.clientX-rect.left)*renderer.domElement.width/rect.width; const y=(rect.bottom-event.clientY)*renderer.domElement.height/rect.height; uniforms.uClicks.value[clickIndex].set(x,y); uniforms.uClickTimes.value[clickIndex]=uniforms.uTime.value; clickIndex=(clickIndex+1)%8; };
    renderer.domElement.addEventListener("pointerdown",onPointerDown,{passive:true});
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches; let raf=0; const started=performance.now();
    const frame=()=>{ const p=propsRef.current; uniforms.uTime.value=(performance.now()-started)/1000*p.speed; uniforms.uColor.value.set(p.color); uniforms.uPixelSize.value=p.pixelSize*renderer.getPixelRatio(); uniforms.uScale.value=p.patternScale; uniforms.uDensity.value=p.patternDensity; uniforms.uJitter.value=p.pixelSizeJitter; uniforms.uEdgeFade.value=p.edgeFade; uniforms.uRippleSpeed.value=p.rippleSpeed; uniforms.uRippleThickness.value=p.rippleThickness; uniforms.uRippleIntensity.value=p.rippleIntensityScale; uniforms.uShape.value=shapeIds[p.variant]; renderer.setClearAlpha(p.transparent?0:1); postEffect.uniforms.get("uTime")!.value=uniforms.uTime.value; postEffect.uniforms.get("uLiquid")!.value=p.liquid?p.liquidStrength:0; postEffect.uniforms.get("uFrequency")!.value=p.liquidWobbleSpeed; postEffect.uniforms.get("uNoise")!.value=p.noiseAmount; composer.render(); if(!reduced) raf=requestAnimationFrame(frame); };
    frame();
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); renderer.domElement.removeEventListener("pointerdown",onPointerDown); geometry.dispose(); material.dispose(); composer.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={hostRef} role="img" aria-label="Interactive pixel pattern background" className="h-full w-full overflow-hidden rounded-xl" />;
}
