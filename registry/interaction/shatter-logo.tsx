"use client";

// deps: three
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

// MotionKit 브랜드 마크 — 세 개의 겹치는 쐐기꼴로 이뤄진 M 모노그램.
const DEFAULT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M0 88 L20 10 L40 88 Z" fill="#EAF2FF"/><path d="M30 88 L50 10 L70 88 Z" fill="#EAF2FF"/><path d="M60 88 L80 10 L100 88 Z" fill="#EAF2FF"/></svg>`;
const DEFAULT_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_LOGO_SVG)}`;

const MAX_ROTATION = THREE.MathUtils.degToRad(78);

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** 시드 기반 의사난수(mulberry32). 프래그먼트 경계·회전축을 결정적으로 생성해
 * 서버 렌더와 클라이언트 하이드레이션이 항상 같은 지오메트리를 만들도록 한다. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 프래그먼트 메시들은 material 인스턴스 하나를 공유하고, 그 material은 컴포넌트가
// 직접 소유·dispose한다 — 여기서는 절대 dispose하지 않고 geometry만 정리한다.
function disposeFragmentGeometries(object: THREE.Object3D | null) {
  if (!object) return;
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) mesh.geometry?.dispose();
  });
}

function getSvgDimensions(xml: SVGElement | undefined) {
  const viewBox = xml?.getAttribute?.("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/\s+/).map(Number);
    if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3])) {
      return { width: parts[2] || 100, height: parts[3] || 100 };
    }
  }
  const width = parseFloat(xml?.getAttribute?.("width") ?? "") || 100;
  const height = parseFloat(xml?.getAttribute?.("height") ?? "") || 100;
  return { width, height };
}

function isFullBleedShape(points: THREE.Vector2[], width: number, height: number) {
  if (!points.length) return false;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const marginX = width * 0.03;
  const marginY = height * 0.03;
  return minX <= marginX && minY <= marginY && maxX >= width - marginX && maxY >= height - marginY;
}

function buildEnvironmentScene() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, "#DCEBFF");
  gradient.addColorStop(0.4, "#8FB3E8");
  gradient.addColorStop(0.75, "#2A3550");
  gradient.addColorStop(1, "#05060A");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const geometry = new THREE.SphereGeometry(50, 32, 32);
  const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
  scene.add(new THREE.Mesh(geometry, material));

  return { scene, texture, geometry, material };
}

function applyGlassConfig(
  material: THREE.MeshPhysicalMaterial,
  { tint, transmission, frost }: { tint: string; transmission: number; frost: number }
) {
  material.color.set(tint);
  material.transmission = clamp(transmission, 0, 1);
  material.roughness = 0.04 + clamp(frost, 0, 1) * 0.55;
  material.metalness = 0;
  material.ior = 1.5;
  material.thickness = 0.6;
  material.clearcoat = 1;
  material.clearcoatRoughness = 0.12;
  material.iridescence = 0.35;
  material.iridescenceIOR = 1.3;
  material.iridescenceThicknessRange = [120, 420];
  material.attenuationColor = new THREE.Color(tint);
  material.attenuationDistance = 1.2;
  material.envMapIntensity = 1.35;
  material.needsUpdate = true;
}

function buildJitteredBounds(min: number, max: number, segments: number, rand: () => number) {
  const span = max - min;
  const bounds = [min];
  for (let i = 1; i < segments; i++) {
    const base = min + (span * i) / segments;
    const jitter = (rand() - 0.5) * (span / segments) * 0.5;
    bounds.push(base + jitter);
  }
  bounds.push(max);
  for (let i = 1; i < bounds.length; i++) {
    if (bounds[i] <= bounds[i - 1]) bounds[i] = bounds[i - 1] + 0.0001;
  }
  return bounds;
}
function findBucket(value: number, bounds: number[]) {
  for (let i = 0; i < bounds.length - 1; i++) {
    if (value >= bounds[i] && value <= bounds[i + 1]) return i;
  }
  return bounds.length - 2;
}

interface FragmentState {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshPhysicalMaterial>;
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  rotAxis: THREE.Vector3;
  phase: number;
  offset: THREE.Vector3;
  velocity: THREE.Vector3;
}

/**
 * SVG 로고를 압출해 전체 지오메트리를 만든 뒤, 삼각형을 지터가 섞인 격자
 * 버킷으로 묶어 "유리 파편" 조각 메시들을 만든다. 각 파편의 로컬 원점은
 * 자기 중심(centroid)이라 개별 회전/이동이 자연스럽다. 파편은 하나의 유리
 * 재질을 공유한다.
 */
async function buildFragmentGroup({
  url,
  depthRatio,
  bevelRatio,
  fragmentCount,
  material,
}: {
  url: string;
  depthRatio: number;
  bevelRatio: number;
  fragmentCount: number;
  material: THREE.MeshPhysicalMaterial;
}): Promise<{ group: THREE.Group; fragments: FragmentState[] }> {
  type SVGLoadResult = Awaited<ReturnType<SVGLoader["loadAsync"]>> & { xml?: SVGElement };
  const data = (await new SVGLoader().loadAsync(url)) as SVGLoadResult;
  const { paths, xml } = data;
  const dims = getSvgDimensions(xml);
  const size = Math.max(dims.width, dims.height);
  const depth = Math.max(size * depthRatio, 0.001);
  const bevelSize = depth * 0.4 * clamp(bevelRatio, 0, 1);
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth,
    bevelEnabled: bevelSize > 0.0005,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 3,
    curveSegments: 12,
  };

  const candidates: { shape: THREE.Shape; isBackground: boolean }[] = [];
  for (const path of paths) {
    const style = path.userData?.style as { fill?: string } | undefined;
    if (style?.fill === "none") continue;
    for (const shape of SVGLoader.createShapes(path)) {
      candidates.push({ shape, isBackground: isFullBleedShape(shape.getPoints(), dims.width, dims.height) });
    }
  }
  const filtered = candidates.filter((c) => !c.isBackground);
  const finalShapes = (filtered.length > 0 ? filtered : candidates).map((c) => c.shape);
  if (finalShapes.length === 0) throw new Error("No fillable paths found in SVG");

  const nonIndexedGeos: THREE.BufferGeometry[] = [];
  const box = new THREE.Box3();
  for (const shape of finalShapes) {
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.computeVertexNormals();
    const nonIndexed = geo.index ? geo.toNonIndexed() : geo;
    if (nonIndexed !== geo) geo.dispose();
    nonIndexed.computeBoundingBox();
    if (nonIndexed.boundingBox) box.union(nonIndexed.boundingBox);
    nonIndexedGeos.push(nonIndexed);
  }

  const center = box.getCenter(new THREE.Vector3());
  const sizeVec = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
  const scale = 2.4 / maxDim;
  const halfW = (sizeVec.x * scale) / 2;
  const halfH = (sizeVec.y * scale) / 2;

  const cols = Math.max(2, Math.round(Math.sqrt(fragmentCount)));
  const rows = Math.max(2, Math.round(fragmentCount / cols));
  const boundsRand = mulberry32(fragmentCount * 2654435761 + 17);
  const xBounds = buildJitteredBounds(-halfW, halfW, cols, boundsRand);
  const yBounds = buildJitteredBounds(-halfH, halfH, rows, boundsRand);

  const buckets = new Map<string, { pos: number[]; norm: number[] }>();
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  const na = new THREE.Vector3();
  const nb = new THREE.Vector3();
  const nc = new THREE.Vector3();

  function place(v: THREE.Vector3) {
    v.sub(center);
    v.x *= scale;
    v.y *= -scale; // SVG는 Y-down → 3D 뷰의 Y-up으로 미러
    v.z *= scale;
  }
  function placeNormal(v: THREE.Vector3) {
    v.y *= -1;
  }

  for (const geo of nonIndexedGeos) {
    const posAttr = geo.getAttribute("position");
    const normAttr = geo.getAttribute("normal");
    const triCount = Math.floor(posAttr.count / 3);
    for (let t = 0; t < triCount; t++) {
      const i0 = t * 3, i1 = t * 3 + 1, i2 = t * 3 + 2;
      va.fromBufferAttribute(posAttr, i0); place(va);
      vb.fromBufferAttribute(posAttr, i1); place(vb);
      vc.fromBufferAttribute(posAttr, i2); place(vc);
      na.fromBufferAttribute(normAttr, i0); placeNormal(na);
      nb.fromBufferAttribute(normAttr, i1); placeNormal(nb);
      nc.fromBufferAttribute(normAttr, i2); placeNormal(nc);

      const ccx = (va.x + vb.x + vc.x) / 3;
      const ccy = (va.y + vb.y + vc.y) / 3;
      const col = findBucket(ccx, xBounds);
      const row = findBucket(ccy, yBounds);
      const key = `${col}_${row}`;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { pos: [], norm: [] };
        buckets.set(key, bucket);
      }
      // Y 미러로 손대칭이 뒤집혔으므로 b/c 순서를 바꿔 와인딩을 다시 정면향으로 되돌린다.
      bucket.pos.push(va.x, va.y, va.z, vc.x, vc.y, vc.z, vb.x, vb.y, vb.z);
      bucket.norm.push(na.x, na.y, na.z, nc.x, nc.y, nc.z, nb.x, nb.y, nb.z);
    }
    geo.dispose();
  }

  const group = new THREE.Group();
  const fragments: FragmentState[] = [];
  const fragRand = mulberry32(fragmentCount * 2654435761 + 991);

  for (const bucket of buckets.values()) {
    if (bucket.pos.length === 0) continue;
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute("position", new THREE.Float32BufferAttribute(bucket.pos, 3));
    fgeo.setAttribute("normal", new THREE.Float32BufferAttribute(bucket.norm, 3));
    fgeo.computeBoundingBox();
    const fCenter = fgeo.boundingBox!.getCenter(new THREE.Vector3());
    fgeo.translate(-fCenter.x, -fCenter.y, -fCenter.z);

    const mesh = new THREE.Mesh(fgeo, material);
    mesh.position.copy(fCenter);

    const dir = fCenter.clone();
    if (dir.lengthSq() < 0.0004) dir.set(fragRand() - 0.5, fragRand() - 0.5, fragRand() - 0.5);
    dir.normalize();
    const rotAxis = new THREE.Vector3(fragRand() - 0.5, fragRand() - 0.5, fragRand() - 0.5).normalize();

    group.add(mesh);
    fragments.push({
      mesh,
      origin: fCenter.clone(),
      dir,
      rotAxis,
      phase: fragRand() * Math.PI * 2,
      offset: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
    });
  }

  if (fragments.length === 0) throw new Error("Failed to build shatter fragments");
  return { group, fragments };
}

export interface ShatterLogoProps {
  /** SVG data URL 또는 원본 SVG 마크업 */
  logo?: string;
  /** 파편 개수 (근사치 — 격자 버킷 기준) */
  fragments?: number;
  /** 압출 깊이 비율 */
  depth?: number;
  /** 베벨 두께 비율 (0~1) */
  bevel?: number;
  /** 유리 틴트 색상 */
  tint?: string;
  /** 투과율 (0~1) — 클수록 유리처럼 투명 */
  transmission?: number;
  /** 프로스트(서리) 강도 (0~1) — 클수록 표면이 뿌옇게 흐려짐 */
  frost?: number;
  /** 커서 반응 반경(월드 유닛) */
  radius?: number;
  /** 파편이 흩어지는 최대 거리(월드 유닛) */
  spread?: number;
  /** 파편이 반응하는 속도(스프링 강성) */
  shatterSpeed?: number;
  /** 복원 시 감쇠율 — 클수록 통통 튀며 복원 */
  restoreDamping?: number;
  /** 유휴 상태 부유 모션 on/off */
  idleFloat?: boolean;
  /** 유휴 부유 모션 속도 */
  idleFloatSpeed?: number;
  /** 시네마틱 키 라이트 색상 */
  lightColor?: string;
}

/**
 * 마우스 근접도에 반응해 유리 파편이 3D 공간으로 흩어졌다가 스프링으로
 * 복원되는 인터랙티브 글래스 로고. SVG를 압출해 전체 지오메트리를 만든 뒤
 * 지터 격자로 삼각형을 파편 단위로 묶는다. 커서가 멀면 파편이 완벽히
 * 결합해 하나의 로고로 보이고, 가까워질수록 반경 내 파편이 바깥·카메라
 * 방향으로 회전하며 튀어나온다. MeshPhysicalMaterial의 transmission·
 * clearcoat·iridescence로 서리 낀 유리 질감과 가장자리 하이라이트를 낸다.
 */
export function ShatterLogo({
  logo = DEFAULT_LOGO_DATA_URL,
  fragments = 60,
  depth = 0.22,
  bevel = 0.5,
  tint = "#eaf2ff",
  transmission = 0.85,
  frost = 0.35,
  radius = 1.4,
  spread = 1.1,
  shatterSpeed = 14,
  restoreDamping = 0.88,
  idleFloat = true,
  idleFloatSpeed = 0.6,
  lightColor = "#eef3ff",
}: ShatterLogoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const fragmentsRef = useRef<FragmentState[]>([]);
  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);
  const pointerRef = useRef({ world: new THREE.Vector3(9999, 9999, 9999), ndcX: 0, ndcY: 0 });
  const paramsRef = useRef({ radius, spread, shatterSpeed, restoreDamping, idleFloat, idleFloatSpeed });

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    paramsRef.current = { radius, spread, shatterSpeed, restoreDamping, idleFloat, idleFloatSpeed };
  }, [radius, spread, shatterSpeed, restoreDamping, idleFloat, idleFloatSpeed]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const handler = () => {
      reducedMotionRef.current = mq.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: "block", width: "100%", height: "100%" });

    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(new THREE.Color(lightColor), 1.3);
    key.position.set(3, 4, 5);
    scene.add(key);
    keyLightRef.current = key;
    const rim = new THREE.PointLight(new THREE.Color(lightColor), 0.9, 12);
    rim.position.set(-2.4, -1.6, 3);
    scene.add(rim);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = buildEnvironmentScene();
    const envRT = pmrem.fromScene(env.scene, 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();
    env.texture.dispose();
    env.geometry.dispose();
    env.material.dispose();

    const material = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide });
    materialRef.current = material;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    clockRef.current = new THREE.Clock();

    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const ndc = new THREE.Vector2();
    const rayHit = new THREE.Vector3();
    const pointerLocal = new THREE.Vector3();
    const tmpQuat = new THREE.Quaternion();

    function updateSize() {
      const width = Math.max(container!.clientWidth, 1);
      const height = Math.max(container!.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    function renderOnce() {
      updateSize();
      renderer.render(scene, camera);
    }

    function tick() {
      frameIdRef.current = requestAnimationFrame(tick);
      const dt = Math.min(clockRef.current!.getDelta(), 0.1);
      const elapsed = clockRef.current!.elapsedTime;
      const p = paramsRef.current;
      const reduced = reducedMotionRef.current;
      const group = groupRef.current;

      if (group) {
        if (!reduced && p.idleFloat) {
          const ease = Math.min(dt * 2, 1);
          const targetRotY = Math.sin(elapsed * p.idleFloatSpeed * 0.3) * 0.22;
          const targetRotX = Math.cos(elapsed * p.idleFloatSpeed * 0.22) * 0.09;
          group.rotation.y += (targetRotY - group.rotation.y) * ease;
          group.rotation.x += (targetRotX - group.rotation.x) * ease;
          const targetY = Math.sin(elapsed * p.idleFloatSpeed * 0.6) * 0.07;
          group.position.y += (targetY - group.position.y) * ease;
        }
        group.updateMatrixWorld();

        if (!reduced) {
          pointerLocal.copy(pointerRef.current.world);
          group.worldToLocal(pointerLocal);
        } else {
          pointerLocal.set(9999, 9999, 9999);
        }

        const radiusVal = Math.max(p.radius, 0.001);
        const radiusSq = radiusVal * radiusVal;
        const k = Math.min(dt * 60, 3);
        const damp = Math.pow(clamp(p.restoreDamping, 0.5, 0.995), k);
        const stiffness = p.shatterSpeed;

        for (const frag of fragmentsRef.current) {
          const dx = frag.origin.x - pointerLocal.x;
          const dy = frag.origin.y - pointerLocal.y;
          const dz = frag.origin.z - pointerLocal.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          let t = 0;
          if (!reduced && distSq < radiusSq) {
            const dist = Math.sqrt(distSq);
            const raw = 1 - dist / radiusVal;
            t = raw * raw * (3 - 2 * raw);
          }

          const tx = frag.dir.x * p.spread * t;
          const ty = frag.dir.y * p.spread * t;
          const tz = frag.dir.z * p.spread * t + t * p.spread * 0.4;

          frag.velocity.x += (tx - frag.offset.x) * stiffness * dt;
          frag.velocity.y += (ty - frag.offset.y) * stiffness * dt;
          frag.velocity.z += (tz - frag.offset.z) * stiffness * dt;
          frag.velocity.multiplyScalar(damp);
          frag.offset.x += frag.velocity.x * dt;
          frag.offset.y += frag.velocity.y * dt;
          frag.offset.z += frag.velocity.z * dt;

          let py = frag.origin.y + frag.offset.y;
          if (!reduced && p.idleFloat) {
            py += Math.sin(elapsed * p.idleFloatSpeed + frag.phase) * 0.012 * (1 - t);
          }
          frag.mesh.position.set(frag.origin.x + frag.offset.x, py, frag.origin.z + frag.offset.z);

          tmpQuat.setFromAxisAngle(frag.rotAxis, t * MAX_ROTATION);
          frag.mesh.quaternion.slerp(tmpQuat, reduced ? 1 : Math.min(dt * stiffness * 0.5, 1));
        }

        if (!reduced && keyLightRef.current) {
          const targetX = 3 + pointerRef.current.ndcX * 1.6;
          const targetY = 4 + pointerRef.current.ndcY * 1.2;
          keyLightRef.current.position.x += (targetX - keyLightRef.current.position.x) * Math.min(dt * 3, 1);
          keyLightRef.current.position.y += (targetY - keyLightRef.current.position.y) * Math.min(dt * 3, 1);
        }
      }

      renderer.render(scene, camera);
    }

    renderOnce();
    if (!reducedMotionRef.current) frameIdRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => renderOnce());
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        if (reducedMotionRef.current) return;
        if (entries[0]?.isIntersecting) {
          if (frameIdRef.current === null) {
            clockRef.current!.getDelta();
            tick();
          }
        } else if (frameIdRef.current !== null) {
          cancelAnimationFrame(frameIdRef.current);
          frameIdRef.current = null;
        }
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    function updatePointerFromEvent(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.ndcX = nx;
      pointerRef.current.ndcY = ny;
      ndc.set(nx, ny);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.ray.intersectPlane(plane, rayHit);
      if (hit) pointerRef.current.world.copy(hit);
    }
    function onPointerMove(e: PointerEvent) {
      updatePointerFromEvent(e.clientX, e.clientY);
    }
    function onPointerLeave() {
      pointerRef.current.world.set(9999, 9999, 9999);
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("pointercancel", onPointerLeave);

    return () => {
      if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("pointercancel", onPointerLeave);
      disposeFragmentGeometries(scene);
      material.dispose();
      envRT.texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !materialRef.current) return;
    let ignore = false;
    setIsLoading(true);
    setHasError(false);

    buildFragmentGroup({ url: logo, depthRatio: depth, bevelRatio: bevel, fragmentCount: fragments, material: materialRef.current })
      .then(({ group, fragments: built }) => {
        if (ignore) {
          disposeFragmentGeometries(group);
          return;
        }
        const scene = sceneRef.current!;
        const old = groupRef.current;
        if (old) {
          scene.remove(old);
          disposeFragmentGeometries(old);
        }
        scene.add(group);
        groupRef.current = group;
        fragmentsRef.current = built;
        setIsLoading(false);
        rendererRef.current?.render(scene, cameraRef.current!);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("[ShatterLogo] Failed to build fragments", error);
        setIsLoading(false);
        setHasError(true);
      });

    return () => {
      ignore = true;
    };
  }, [logo, depth, bevel, fragments]);

  useEffect(() => {
    if (!materialRef.current) return;
    applyGlassConfig(materialRef.current, { tint, transmission, frost });
    if (sceneRef.current && cameraRef.current) rendererRef.current?.render(sceneRef.current, cameraRef.current);
  }, [tint, transmission, frost]);

  useEffect(() => {
    keyLightRef.current?.color.set(lightColor);
    if (sceneRef.current && cameraRef.current) rendererRef.current?.render(sceneRef.current, cameraRef.current);
  }, [lightColor]);

  return (
    <div ref={containerRef} className="relative h-full min-h-64 w-full overflow-hidden" style={{ background: "#05060a" }}>
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/25 border-t-white/85" />
        </div>
      )}
      {hasError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center">
          <span className="text-xs text-red-400">Couldn&apos;t render this SVG.</span>
        </div>
      )}
    </div>
  );
}
