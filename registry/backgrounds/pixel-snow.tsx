"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Color, GLSL3, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from "three";

const vertexShader = `
void main() { gl_Position = vec4(position, 1.0); }`;

const fragmentShader = `
precision mediump float;
precision highp int;

uniform float uTime;
uniform vec2 uResolution;
uniform float uFlakeSize;
uniform float uMinFlakeSize;
uniform float uPixelResolution;
uniform float uSpeed;
uniform float uDepthFade;
uniform float uFarPlane;
uniform vec3 uColor;
uniform float uBrightness;
uniform float uGamma;
uniform float uDensity;
uniform float uVariant;
uniform float uDirection;
out vec4 outColor;

#define PI 3.14159265
#define PI_OVER_6 0.5235988
#define PI_OVER_3 1.0471976
#define M1 1597334677U
#define M2 3812015801U
#define M3 3299493293U
#define F0 2.3283064e-10
#define hash(n) (n * (n ^ (n >> 15)))
#define coord3(p) (uvec3(p).x * M1 ^ uvec3(p).y * M2 ^ uvec3(p).z * M3)

const vec3 camK = vec3(0.57735027);
const vec3 camI = vec3(0.70710678, 0.0, -0.70710678);
const vec3 camJ = vec3(-0.40824829, 0.81649658, -0.40824829);
const vec2 b1d = vec2(0.574, 0.819);

vec3 hash3(uint n) {
  uvec3 hashed = hash(n) * uvec3(1U, 511U, 262143U);
  return vec3(hashed) * F0;
}

float snowflakeDist(vec2 p) {
  float r = length(p);
  float a = atan(p.y, p.x);
  a = abs(mod(a + PI_OVER_6, PI_OVER_3) - PI_OVER_6);
  vec2 q = r * vec2(cos(a), sin(a));
  float dMain = max(abs(q.y), max(-q.x, q.x - 1.0));
  float b1t = clamp(dot(q - vec2(0.4, 0.0), b1d), 0.0, 0.4);
  float dB1 = length(q - vec2(0.4, 0.0) - b1t * b1d);
  float b2t = clamp(dot(q - vec2(0.7, 0.0), b1d), 0.0, 0.25);
  float dB2 = length(q - vec2(0.7, 0.0) - b2t * b1d);
  return min(dMain, min(dB1, dB2)) * 10.0;
}

void main() {
  float pixelSize = max(1.0, floor(0.5 + uResolution.x / max(uPixelResolution, 1.0)));
  vec2 fragCoord = floor(gl_FragCoord.xy / pixelSize);
  vec2 res = uResolution / pixelSize;
  float invResX = 1.0 / res.x;
  vec3 ray = normalize(vec3((fragCoord - res * 0.5) * invResX, 1.0));
  ray = ray.x * camI + ray.y * camJ + ray.z * camK;

  float timeSpeed = uTime * uSpeed;
  vec3 camPos = (cos(uDirection) * 0.4 * camI + sin(uDirection) * 0.4 * camJ + 0.1 * camK) * timeSpeed;
  vec3 pos = camPos;
  vec3 strides = 1.0 / max(abs(ray), vec3(0.001));
  vec3 raySign = step(ray, vec3(0.0));
  vec3 phase = fract(pos) * strides;
  phase = mix(strides - phase, phase, raySign);
  float rayDotCamK = dot(ray, camK);
  float invRayDotCamK = 1.0 / rayDotCamK;
  float invDepthFade = 1.0 / max(uDepthFade, 0.001);
  float halfInvResX = 0.5 * invResX;
  vec3 timeAnim = timeSpeed * 0.1 * vec3(7.0, 8.0, 5.0);

  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    if (t >= uFarPlane) break;
    vec3 fpos = floor(pos);
    uint cellCoord = coord3(fpos);
    if (hash3(cellCoord).x < uDensity) {
      vec3 h = hash3(cellCoord);
      vec3 flakePos = 0.5 - 0.5 * cos(4.0 * sin(fpos.yzx * 0.073) + 4.0 * sin(fpos.zxy * 0.27) + 2.0 * h + timeAnim);
      flakePos = flakePos * 0.8 + 0.1 + fpos;
      float toIntersection = dot(flakePos - pos, camK) * invRayDotCamK;
      if (toIntersection > 0.0) {
        vec3 testPos = pos + ray * toIntersection - flakePos;
        float testX = dot(testPos, camI);
        float testY = dot(testPos, camJ);
        vec2 testUV = abs(vec2(testX, testY));
        float depth = dot(flakePos - camPos, camK);
        float flakeSize = max(uFlakeSize, uMinFlakeSize * depth * halfInvResX);
        float dist = uVariant < 0.5 ? max(testUV.x, testUV.y) : (uVariant < 1.5 ? length(testUV) : snowflakeDist(vec2(testX, testY) / flakeSize) * flakeSize);
        if (dist < flakeSize) {
          float intensity = exp2(-(t + toIntersection) * invDepthFade) * min(1.0, pow(uFlakeSize / flakeSize, 2.0)) * uBrightness;
          outColor = vec4(uColor * pow(vec3(intensity), vec3(uGamma)), 1.0);
          return;
        }
      }
    }
    float nextStep = min(min(phase.x, phase.y), phase.z);
    vec3 selectAxis = step(phase, vec3(nextStep));
    phase = phase - nextStep + strides * selectAxis;
    t += nextStep;
    pos = mix(pos + ray * nextStep, floor(pos + ray * nextStep + 0.5), selectAxis);
  }
  outColor = vec4(0.0);
}`;

export type PixelSnowVariant = "square" | "round" | "snowflake";
export interface PixelSnowProps {
  color?: string; flakeSize?: number; minFlakeSize?: number; pixelResolution?: number; speed?: number; depthFade?: number; farPlane?: number; brightness?: number; gamma?: number; density?: number; variant?: PixelSnowVariant; direction?: number; className?: string; style?: CSSProperties;
}

type PixelSnowConfig = Required<Omit<PixelSnowProps, "className" | "style">>;
const variantValue = (variant: PixelSnowVariant) => variant === "round" ? 1 : variant === "snowflake" ? 2 : 0;

export function PixelSnow({ color = "#ffffff", flakeSize = 0.01, minFlakeSize = 1.25, pixelResolution = 200, speed = 1.25, depthFade = 8, farPlane = 20, brightness = 1, gamma = 0.4545, density = 0.3, variant = "square", direction = 125, className = "", style }: PixelSnowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<PixelSnowConfig>({ color, flakeSize, minFlakeSize, pixelResolution, speed, depthFade, farPlane, brightness, gamma, density, variant, direction });

  useEffect(() => {
    configRef.current = { color, flakeSize, minFlakeSize, pixelResolution, speed, depthFade, farPlane, brightness, gamma, density, variant, direction };
  }, [brightness, color, density, depthFade, direction, farPlane, flakeSize, gamma, minFlakeSize, pixelResolution, speed, variant]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const initial = configRef.current;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance", stencil: false, depth: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "block h-full w-full transform-gpu";
    container.appendChild(renderer.domElement);

    const uniforms = {
      uTime: { value: 0 }, uResolution: { value: new Vector2(1, 1) }, uFlakeSize: { value: initial.flakeSize }, uMinFlakeSize: { value: initial.minFlakeSize }, uPixelResolution: { value: initial.pixelResolution }, uSpeed: { value: initial.speed }, uDepthFade: { value: initial.depthFade }, uFarPlane: { value: initial.farPlane }, uColor: { value: new Vector3(new Color(initial.color).r, new Color(initial.color).g, new Color(initial.color).b) }, uBrightness: { value: initial.brightness }, uGamma: { value: initial.gamma }, uDensity: { value: initial.density }, uVariant: { value: variantValue(initial.variant) }, uDirection: { value: initial.direction * Math.PI / 180 },
    };
    const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, glslVersion: GLSL3, depthTest: false, depthWrite: false });
    const geometry = new PlaneGeometry(2, 2);
    scene.add(new Mesh(geometry, material));

    const resize = () => { const width = Math.max(1, container.clientWidth); const height = Math.max(1, container.clientHeight); renderer.setSize(width, height, false); uniforms.uResolution.value.set(renderer.domElement.width, renderer.domElement.height); };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container); resize();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0; let inView = true; let pageVisible = !document.hidden; const startedAt = performance.now();
    const render = (time: number) => {
      const config = configRef.current;
      uniforms.uTime.value = reducedMotion ? 0 : (time - startedAt) * 0.001;
      uniforms.uFlakeSize.value = config.flakeSize; uniforms.uMinFlakeSize.value = config.minFlakeSize; uniforms.uPixelResolution.value = config.pixelResolution; uniforms.uSpeed.value = config.speed; uniforms.uDepthFade.value = config.depthFade; uniforms.uFarPlane.value = config.farPlane; uniforms.uBrightness.value = config.brightness; uniforms.uGamma.value = config.gamma; uniforms.uDensity.value = config.density; uniforms.uVariant.value = variantValue(config.variant); uniforms.uDirection.value = config.direction * Math.PI / 180;
      const threeColor = new Color(config.color); uniforms.uColor.value.set(threeColor.r, threeColor.g, threeColor.b);
      renderer.render(scene, camera);
      if (!reducedMotion) frame = requestAnimationFrame(render);
    };
    const start = () => { if (reducedMotion) { render(startedAt); return; } if (inView && pageVisible && frame === 0) frame = requestAnimationFrame(render); };
    const stop = () => { if (frame) { cancelAnimationFrame(frame); frame = 0; } };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView) start(); else stop(); }, { threshold: 0 }); observer.observe(container);
    const onVisibilityChange = () => { pageVisible = !document.hidden; if (pageVisible) start(); else stop(); }; document.addEventListener("visibilitychange", onVisibilityChange); start();

    return () => { stop(); observer.disconnect(); resizeObserver.disconnect(); document.removeEventListener("visibilitychange", onVisibilityChange); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
  }, []);

  return <div ref={containerRef} role="img" aria-label="Animated pixel snow background" className={`relative h-full w-full overflow-hidden [contain:layout_style_paint] ${className}`.trim()} style={style} />;
}
