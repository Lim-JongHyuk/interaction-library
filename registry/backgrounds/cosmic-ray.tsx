"use client";

// deps: three
import { useEffect, useRef } from "react";
import * as THREE from "three";

export type CosmicRayCoreShape = "round" | "lensFlare" | "diamond" | "comet";

export interface CosmicRayProps {
  /** 광선이 뻗어나오는 코어의 모양 */
  coreShape?: CosmicRayCoreShape;
  /** 코어 위치 (0~1, 왼쪽/위 기준) */
  originX?: number;
  originY?: number;
  /** 광선 각도(deg). 0이면 오른쪽, 양수면 위로 */
  angle?: number;
  /** 광선이 퍼지는 정도 */
  spread?: number;
  /** 광선이 뻗는 길이 */
  beamLength?: number;
  /** 광선 결이 흐르는 속도 */
  speed?: number;
  /** 별밭 표시 여부 */
  showStars?: boolean;
  /** 별 밀도 */
  starDensity?: number;
  backgroundColor?: string;
  coreColor?: string;
  /** 광선을 감싸는 아우라 색 */
  auraColor?: string;
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform vec2  uRes;
  uniform float uTime;
  uniform vec2  uOrigin;
  uniform float uAngle;
  uniform float uSpread;
  uniform float uLength;
  uniform float uSpeed;
  uniform float uStars;
  uniform float uStarDensity;
  uniform int   uShape;
  uniform vec3  uBg;
  uniform vec3  uCore;
  uniform vec3  uAura;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * valueNoise(p);
      p *= 2.02;
      amp *= 0.5;
    }
    return v;
  }

  // 셀당 별 하나 — 3x3 이웃 탐색 없이도 충분히 조밀하고 훨씬 가볍다.
  float starLayer(vec2 uv, float scale, float t, float seed) {
    vec2 g = uv * scale;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float h = hash21(id + seed);
    if (h < 0.62) return 0.0;
    vec2 off = (vec2(hash21(id + seed + 3.1), hash21(id + seed + 8.7)) - 0.5) * 0.7;
    float d = length(f - off);
    float tw = 0.55 + 0.45 * sin(t * (1.2 + h * 2.5) + h * 40.0);
    return smoothstep(0.09, 0.0, d) * tw * (0.35 + 0.65 * h);
  }

  float coreShape(vec2 q, float d) {
    if (uShape == 0) {
      // Round — 단단한 점 + 부드러운 헤일로
      return exp(-pow(d / 0.016, 2.0)) + exp(-d / 0.045) * 0.55;
    } else if (uShape == 1) {
      // Lens Flare — 가로/세로 스파이크가 십자로 뻗는다
      float dot0 = exp(-pow(d / 0.014, 2.0));
      float hSpike = exp(-abs(q.y) / 0.0035) * exp(-abs(q.x) / 0.13);
      float vSpike = exp(-abs(q.x) / 0.0035) * exp(-abs(q.y) / 0.075);
      return dot0 + (hSpike + vSpike) * 0.85 + exp(-d / 0.05) * 0.4;
    } else if (uShape == 2) {
      // Diamond — 맨해튼 거리로 마름모
      float m = abs(q.x) + abs(q.y);
      return exp(-pow(m / 0.026, 1.6)) + exp(-m / 0.06) * 0.4;
    }
    // Comet — 둥근 머리 + 진행 반대편으로 끌리는 꼬리
    float head = exp(-pow(d / 0.018, 2.0));
    float tail = exp(-abs(q.y) / (0.012 + max(-q.x, 0.0) * 0.25)) * exp(-max(-q.x, 0.0) / 0.16) * step(q.x, 0.0);
    return head + tail * 0.7 + exp(-d / 0.05) * 0.35;
  }

  void main() {
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 uv = vUv;

    // 원점 기준 종횡비 보정 좌표
    vec2 p = vec2((uv.x - uOrigin.x) * aspect, uv.y - uOrigin.y);

    // 광선이 +x 를 향하도록 회전
    float ca = cos(-uAngle);
    float sa = sin(-uAngle);
    vec2 q = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);

    vec3 col = uBg;

    // 다층 별밭 — 층마다 다른 속도로 흘러 시차(parallax)가 생긴다
    if (uStars > 0.5) {
      vec2 suv = vec2(uv.x * aspect, uv.y);
      float s = 0.0;
      s += starLayer(suv + vec2(uTime * 0.004, 0.0), 26.0 * uStarDensity, uTime, 1.0) * 0.9;
      s += starLayer(suv + vec2(uTime * 0.009, 0.0), 46.0 * uStarDensity, uTime, 7.3) * 0.6;
      s += starLayer(suv + vec2(uTime * 0.016, 0.0), 78.0 * uStarDensity, uTime, 19.7) * 0.35;
      col += vec3(s);
    }

    float d = length(p);

    // 코어 주변 아우라
    col += uAura * exp(-d * 4.5) * 0.5;

    // 광선 본체 — 앞으로 갈수록 벌어지고 흐려지며, 결이 바깥으로 흐른다
    float beam = 0.0;
    if (q.x > 0.0) {
      float along = q.x;
      float w = uSpread * (0.015 + along * 0.55);
      float prof = exp(-(q.y * q.y) / max(w * w, 1e-6));
      float fade = exp(-along / max(uLength, 0.001));
      float streak = fbm(vec2(along * 7.0 - uTime * uSpeed * 1.3, q.y / max(w, 1e-4) * 2.6));
      beam = prof * fade * (0.5 + 0.85 * streak);
    }
    col += mix(uAura, uCore, clamp(beam * 1.6, 0.0, 1.0)) * beam * 2.3;

    // 코어
    col += uCore * coreShape(q, d);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const SHAPE_INDEX: Record<CosmicRayCoreShape, number> = { round: 0, lensFlare: 1, diamond: 2, comet: 3 };

/**
 * GLSL 셰이더로 그리는 심우주 배경 — 반짝이는 다층 별밭 위로
 * 코어 별에서 광선이 뻗어나간다. 화면 밖으로 나가면 렌더 루프를 멈춘다.
 */
export function CosmicRay({
  coreShape = "round",
  originX = 0.52,
  originY = 0.62,
  angle = 28,
  spread = 0.5,
  beamLength = 0.9,
  speed = 1,
  showStars = true,
  starDensity = 1,
  backgroundColor = "#0a0620",
  coreColor = "#ffffff",
  auraColor = "#a855f7",
}: CosmicRayProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // 매 프레임 바뀌는 값은 ref로 넘겨 셰이더 재생성 없이 uniform만 갱신한다
  const propsRef = useRef({
    coreShape, originX, originY, angle, spread, beamLength, speed, showStars, starDensity,
    backgroundColor, coreColor, auraColor,
  });
  useEffect(() => {
    propsRef.current = {
      coreShape, originX, originY, angle, spread, beamLength, speed, showStars, starDensity,
      backgroundColor, coreColor, auraColor,
    };
  }, [
    coreShape, originX, originY, angle, spread, beamLength, speed, showStars, starDensity,
    backgroundColor, coreColor, auraColor,
  ]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uOrigin: { value: new THREE.Vector2(originX, 1 - originY) },
      uAngle: { value: (angle * Math.PI) / 180 },
      uSpread: { value: spread },
      uLength: { value: beamLength },
      uSpeed: { value: speed },
      uStars: { value: showStars ? 1 : 0 },
      uStarDensity: { value: starDensity },
      uShape: { value: SHAPE_INDEX[coreShape] },
      uBg: { value: new THREE.Color(backgroundColor) },
      uCore: { value: new THREE.Color(coreColor) },
      uAura: { value: new THREE.Color(auraColor) },
    };

    const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
    scene.add(new THREE.Mesh(geometry, material));

    function resize() {
      const w = Math.max(1, host!.clientWidth);
      const h = Math.max(1, host!.clientHeight);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
    }

    function syncUniforms() {
      const p = propsRef.current;
      uniforms.uOrigin.value.set(p.originX, 1 - p.originY);
      uniforms.uAngle.value = (p.angle * Math.PI) / 180;
      uniforms.uSpread.value = p.spread;
      uniforms.uLength.value = p.beamLength;
      uniforms.uSpeed.value = p.speed;
      uniforms.uStars.value = p.showStars ? 1 : 0;
      uniforms.uStarDensity.value = p.starDensity;
      uniforms.uShape.value = SHAPE_INDEX[p.coreShape];
      uniforms.uBg.value.set(p.backgroundColor);
      uniforms.uCore.value.set(p.coreColor);
      uniforms.uAura.value.set(p.auraColor);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let raf = 0;
    let running = false;
    const start = performance.now();

    function frame() {
      uniforms.uTime.value = (performance.now() - start) / 1000;
      syncUniforms();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    function play() {
      if (running || reduced) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function pause() {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    }

    // 화면 밖이면 GPU 작업을 멈춰 배터리·CPU를 아낀다
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) play();
        else pause();
      },
      { threshold: 0.01 }
    );
    io.observe(host);

    if (reduced) {
      // 정지 화면 한 장만 그린다
      syncUniforms();
      renderer.render(scene, camera);
    }

    return () => {
      pause();
      io.disconnect();
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // 초기화는 한 번만 — 이후 프롭 변경은 propsRef를 통해 uniform으로 반영된다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      role="img"
      aria-label="별이 반짝이는 우주 배경과 코어에서 뻗어나오는 광선"
      className="h-full w-full overflow-hidden rounded-xl"
      style={{ background: backgroundColor }}
    />
  );
}
