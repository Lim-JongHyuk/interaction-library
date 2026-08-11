"use client";

// deps: three, @react-three/fiber, @react-three/drei
import { useMemo } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { useReducedMotion } from "motion/react";

const vertexShader = `
  uniform float uTime; uniform float uSpeed; uniform float uScale;
  varying vec2 vUv;
  float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
  float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
  void main(){vUv=uv;vec3 transformed=position;transformed.z+=(noise(vec3(position.x*.15,position.y-uv.y,uTime*uSpeed*3.)*uScale)-.5)*1.4;gl_Position=projectionMatrix*modelViewMatrix*vec4(transformed,1.);}
`;

const fragmentShader = `
  uniform vec3 uColor; uniform float uNoiseIntensity; varying vec2 vUv;
  float random(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  void main(){float edge=smoothstep(0.,.18,vUv.x)*smoothstep(0.,.18,1.-vUv.x);float grain=(random(gl_FragCoord.xy)-.5)*uNoiseIntensity*.13;vec3 color=max(uColor+grain,0.);gl_FragColor=vec4(color,edge*.82);}
`;

function createGeometry(count: number, width: number, height: number) {
  const segments = 100;
  const verticesPerBeam = (segments + 1) * 2;
  const positions = new Float32Array(count * verticesPerBeam * 3);
  const uvs = new Float32Array(count * verticesPerBeam * 2);
  const indices = new Uint32Array(count * segments * 6);
  const totalWidth = count * width;
  let vertex = 0, index = 0;
  for (let beam = 0; beam < count; beam++) {
    const x = -totalWidth / 2 + beam * width;
    const offsetX = Math.random() * 300;
    for (let row = 0; row <= segments; row++) {
      const y = height * (row / segments - .5);
      positions.set([x, y, 0, x + width, y, 0], vertex * 3);
      uvs.set([offsetX, row / segments, offsetX + 1, row / segments], vertex * 2);
      if (row < segments) indices.set([vertex, vertex + 1, vertex + 2, vertex + 2, vertex + 1, vertex + 3], index), index += 6;
      vertex += 2;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  return geometry;
}

export interface BeamsProps { beamWidth?: number; beamHeight?: number; beamNumber?: number; lightColor?: string; speed?: number; noiseIntensity?: number; scale?: number; rotation?: number; className?: string; }

function BeamField({ beamWidth, beamHeight, beamNumber, lightColor, speed, noiseIntensity, scale, rotation }: Required<Omit<BeamsProps, "className">>) {
  const reducedMotion = useReducedMotion();
  const geometry = useMemo(() => createGeometry(Math.max(1, Math.round(beamNumber)), beamWidth, beamHeight), [beamNumber, beamWidth, beamHeight]);
  const material = useMemo(() => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uTime:{value:0},uSpeed:{value:speed},uScale:{value:scale},uNoiseIntensity:{value:noiseIntensity},uColor:{value:new THREE.Color(lightColor)} }, vertexShader, fragmentShader }), [speed, noiseIntensity, scale, lightColor]);
  useFrame(({ clock }) => { material.uniforms.uTime.value = reducedMotion ? 0 : clock.elapsedTime; material.uniforms.uSpeed.value = speed; material.uniforms.uScale.value = scale; material.uniforms.uNoiseIntensity.value = noiseIntensity; material.uniforms.uColor.value.set(lightColor); });
  return <group rotation={[0, 0, THREE.MathUtils.degToRad(rotation)]}><mesh geometry={geometry} material={material} /></group>;
}

export function Beams({ beamWidth = 2, beamHeight = 15, beamNumber = 12, lightColor = "#ffffff", speed = 2, noiseIntensity = 1.75, scale = .2, rotation = 0, className = "" }: BeamsProps) {
  return <div role="img" aria-label="Animated radiant beams background" className={`relative h-full w-full overflow-hidden bg-black ${className}`.trim()}><Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}><color attach="background" args={["#000000"]} /><ambientLight intensity={1} /><BeamField beamWidth={beamWidth} beamHeight={beamHeight} beamNumber={beamNumber} lightColor={lightColor} speed={speed} noiseIntensity={noiseIntensity} scale={scale} rotation={rotation} /><PerspectiveCamera makeDefault position={[0, 0, 20]} fov={30} /></Canvas></div>;
}
