"use client";

// deps: three
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

// Auto-rotate rocks the logo back and forth within this range instead of
// spinning a full 360 degrees, so the front face stays in view at all times.
const AUTO_ROTATE_AMPLITUDE = THREE.MathUtils.degToRad(34);

const DEFAULT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="27" cy="30" r="17" fill="#7C6CF2"/><circle cx="73" cy="30" r="17" fill="#4C8DFF"/><circle cx="50" cy="74" r="17" fill="#F2E9D8"/></svg>`;
const DEFAULT_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_LOGO_SVG)}`;

const PRESETS = {
  opal: { color: "#F5F1FF", roughness: 0.2, metalness: 0.32, iridescence: 1, iridescenceIOR: 1.3, thicknessRange: [200, 450] as [number, number], envMapIntensity: 1.3, rotateMultiplier: 0.85 },
  prism: { color: "#FFFFFF", roughness: 0.05, metalness: 0.92, iridescence: 1, iridescenceIOR: 2.3, thicknessRange: [100, 900] as [number, number], envMapIntensity: 2.4, rotateMultiplier: 1.15 },
  pearl: { color: "#FAF6EE", roughness: 0.04, metalness: 0.14, iridescence: 0.5, iridescenceIOR: 1.4, thicknessRange: [260, 380] as [number, number], envMapIntensity: 0.9, rotateMultiplier: 0.55 },
  titanium: { color: "#C9CDD3", roughness: 0.34, metalness: 0.95, iridescence: 0.15, iridescenceIOR: 1.5, thicknessRange: [300, 480] as [number, number], envMapIntensity: 1.25, rotateMultiplier: 0.8 },
  obsidian: { color: "#15141F", roughness: 0.1, metalness: 0.6, iridescence: 0.85, iridescenceIOR: 1.9, thicknessRange: [150, 600] as [number, number], envMapIntensity: 2.0, rotateMultiplier: 0.7 },
  roseGold: { color: "#E3B8AE", roughness: 0.14, metalness: 0.9, iridescence: 0.4, iridescenceIOR: 1.6, thicknessRange: [280, 450] as [number, number], envMapIntensity: 1.7, rotateMultiplier: 0.75 },
};

function applyMaterialConfig(material: THREE.MeshPhysicalMaterial, config: (typeof PRESETS)[keyof typeof PRESETS]) {
  material.color.set(config.color);
  material.roughness = config.roughness;
  material.metalness = config.metalness;
  material.iridescence = config.iridescence;
  material.iridescenceIOR = config.iridescenceIOR;
  material.iridescenceThicknessRange = config.thicknessRange;
  material.envMapIntensity = config.envMapIntensity;
  material.needsUpdate = true;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function disposeObject3D(object: THREE.Object3D | null) {
  if (!object) return;
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat?.dispose();
    }
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
  gradient.addColorStop(0, "#8C7CFF");
  gradient.addColorStop(0.45, "#5B8CFF");
  gradient.addColorStop(0.75, "#D9CBAE");
  gradient.addColorStop(1, "#0A0A12");
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

async function buildLogoGroup({
  url,
  colorMode,
  depthRatio,
  materialConfig,
}: {
  url: string;
  colorMode: "chromatic" | "original";
  depthRatio: number;
  materialConfig: (typeof PRESETS)[keyof typeof PRESETS];
}) {
  type SVGLoadResult = Awaited<ReturnType<SVGLoader["loadAsync"]>> & { xml?: SVGElement };
  const data = (await new SVGLoader().loadAsync(url)) as SVGLoadResult;

  const { paths, xml } = data;
  const dims = getSvgDimensions(xml);
  const size = Math.max(dims.width, dims.height);
  const depth = Math.max(size * depthRatio, 0.001);
  const bevelSize = depth * 0.35 * 0.6;
  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth,
    bevelEnabled: bevelSize > 0.0005,
    bevelThickness: bevelSize,
    bevelSize,
    bevelSegments: 3,
    curveSegments: 12,
  };

  const candidates: { shape: THREE.Shape; fillColor: string; isBackground: boolean }[] = [];
  for (const path of paths) {
    const style = path.userData?.style as { fill?: string } | undefined;
    if (style?.fill === "none") continue;
    const shapes = SVGLoader.createShapes(path);
    const fillColor = path.color ? `#${path.color.getHexString()}` : "#ffffff";
    for (const shape of shapes) {
      candidates.push({ shape, fillColor, isBackground: isFullBleedShape(shape.getPoints(), dims.width, dims.height) });
    }
  }

  const filtered = candidates.filter((c) => !c.isBackground);
  const finalShapes = filtered.length > 0 ? filtered : candidates;

  const layerStep = depth * 0.08;
  const maxLayerOffset = depth * 0.4;
  const useOriginalColor = colorMode === "original";
  const meshes: THREE.Mesh[] = [];

  finalShapes.forEach(({ shape, fillColor }) => {
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide });
    applyMaterialConfig(mat, materialConfig);
    if (useOriginalColor) mat.color.set(fillColor);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = Math.min(meshes.length * layerStep, maxLayerOffset);
    meshes.push(mesh);
  });

  if (meshes.length === 0) throw new Error("No fillable paths found in SVG");

  const contentGroup = new THREE.Group();
  meshes.forEach((mesh) => contentGroup.add(mesh));

  const box = new THREE.Box3().setFromObject(contentGroup);
  const center = box.getCenter(new THREE.Vector3());
  contentGroup.children.forEach((child) => child.position.sub(center));

  const boxSize = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z) || 1;
  const scale = 2.4 / maxDim;
  contentGroup.scale.set(scale, -scale, scale);

  return contentGroup;
}

export interface IridescentLogo3DProps {
  logo?: string;
  preset?: keyof typeof PRESETS;
  colorMode?: "chromatic" | "original";
  depth?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  enableDrag?: boolean;
}

export function IridescentLogo3D({
  logo = DEFAULT_LOGO_DATA_URL,
  preset = "opal",
  colorMode = "chromatic",
  depth = 0.28,
  autoRotate = true,
  autoRotateSpeed = 0.6,
  enableDrag = true,
}: IridescentLogo3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const logoGroupRef = useRef<THREE.Group | null>(null);
  const clockRef = useRef<THREE.Clock | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const dragStateRef = useRef({ isDragging: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0, phase: 0 });
  const paramsRef = useRef({ autoRotate, autoRotateSpeed, enableDrag });

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 렌더 루프가 최신 파라미터를 참조하도록 effect에서 ref를 갱신 (렌더 중 ref 쓰기 금지 룰 준수)
  useEffect(() => {
    paramsRef.current = { autoRotate, autoRotateSpeed, enableDrag };
  }, [autoRotate, autoRotateSpeed, enableDrag]);

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

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 4, 5);
    scene.add(key);

    const logoGroup = new THREE.Group();
    scene.add(logoGroup);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = buildEnvironmentScene();
    const envRT = pmrem.fromScene(env.scene, 0.03);
    scene.environment = envRT.texture;
    pmrem.dispose();
    env.texture.dispose();
    env.geometry.dispose();
    env.material.dispose();

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    logoGroupRef.current = logoGroup;
    clockRef.current = new THREE.Clock();

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

    function updateRotation(delta: number) {
      const drag = dragStateRef.current;
      const params = paramsRef.current;
      if (drag.isDragging) return;

      const hasVelocity = Math.abs(drag.velocityX) > 0.0002 || Math.abs(drag.velocityY) > 0.0002;
      if (hasVelocity) {
        logoGroup.rotation.y += drag.velocityX;
        logoGroup.rotation.x = clamp(logoGroup.rotation.x + drag.velocityY, -1.1, 1.1);
        drag.velocityX *= 0.94;
        drag.velocityY *= 0.94;
      } else {
        drag.velocityX = 0;
        drag.velocityY = 0;
        if (params.autoRotate) {
          const speed = params.autoRotateSpeed;
          drag.phase += speed * delta;
          const target = AUTO_ROTATE_AMPLITUDE * Math.sin(drag.phase);
          const ease = Math.min(1, delta * 4);
          logoGroup.rotation.y += (target - logoGroup.rotation.y) * ease;
          logoGroup.rotation.x += (0 - logoGroup.rotation.x) * ease;
        }
      }
    }

    function tick() {
      frameIdRef.current = requestAnimationFrame(tick);
      const delta = Math.min(clockRef.current!.getDelta(), 0.1);
      updateRotation(delta);
      renderer.render(scene, camera);
    }

    renderOnce();
    frameIdRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => renderOnce());
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
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

    function onPointerDown(event: PointerEvent) {
      if (!paramsRef.current.enableDrag) return;
      const drag = dragStateRef.current;
      drag.isDragging = true;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.velocityX = 0;
      drag.velocityY = 0;
      container!.style.cursor = "grabbing";
    }

    function onPointerMove(event: PointerEvent) {
      const drag = dragStateRef.current;
      if (!drag.isDragging) return;
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      const rotSpeed = 0.008;
      logoGroup.rotation.y += dx * rotSpeed;
      logoGroup.rotation.x = clamp(logoGroup.rotation.x + dy * rotSpeed, -1.1, 1.1);
      drag.velocityX = dx * rotSpeed;
      drag.velocityY = dy * rotSpeed;
    }

    function onPointerUp() {
      dragStateRef.current.isDragging = false;
      container!.style.cursor = paramsRef.current.enableDrag ? "grab" : "default";
    }

    container.style.cursor = paramsRef.current.enableDrag ? "grab" : "default";
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      if (frameIdRef.current !== null) cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      disposeObject3D(scene);
      envRT.texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.cursor = enableDrag ? "grab" : "default";
    }
  }, [enableDrag]);

  useEffect(() => {
    if (!sceneRef.current || !logoGroupRef.current) return;
    let ignore = false;
    setIsLoading(true);
    setHasError(false);

    const materialConfig = PRESETS[preset];

    buildLogoGroup({ url: logo, colorMode, depthRatio: depth, materialConfig })
      .then((contentGroup) => {
        if (ignore) {
          disposeObject3D(contentGroup);
          return;
        }
        const outer = logoGroupRef.current!;
        const old = outer.children[0];
        if (old) {
          disposeObject3D(old);
          outer.remove(old);
        }
        outer.add(contentGroup);
        setIsLoading(false);
        rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("[IridescentLogo3D] Failed to build logo", error);
        setIsLoading(false);
        setHasError(true);
      });

    return () => {
      ignore = true;
    };
  }, [logo, colorMode, depth, preset]);

  useEffect(() => {
    const contentGroup = logoGroupRef.current?.children[0];
    if (!contentGroup) return;
    const config = PRESETS[preset];
    contentGroup.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) applyMaterialConfig(mesh.material as THREE.MeshPhysicalMaterial, config);
    });
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [preset]);

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden" style={{ touchAction: "none", background: "#050505" }}>
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
