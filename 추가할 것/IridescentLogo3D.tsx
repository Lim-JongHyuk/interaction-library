import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { useEffect, useRef, useState } from "react"
import * as THREE from "https://esm.sh/three@0.169.0"
import { SVGLoader } from "https://esm.sh/three@0.169.0/examples/jsm/loaders/SVGLoader.js"
// Auto-rotate rocks the logo back and forth within this range instead of
// spinning a full 360 degrees. A full spin on a single (Y) axis inevitably
// passes through a ~90 degree angle where the camera looks straight at the
// extrusion's thin edge — at that angle every logo looks like the same
// plain rectangular slab, since the front silhouette is invisible edge-on.
// Staying within this range keeps the front face (or most of it) in view
// at all times. Dragging is unaffected and can still spin all the way
// around manually.
const AUTO_ROTATE_AMPLITUDE = THREE.MathUtils.degToRad(34)

// ---------------------------------------------------------------------------
// Default logo (shown on first install so the component never renders blank)
// ---------------------------------------------------------------------------
const DEFAULT_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="27" cy="30" r="17" fill="#7C6CF2"/><circle cx="73" cy="30" r="17" fill="#4C8DFF"/><circle cx="50" cy="74" r="17" fill="#F2E9D8"/></svg>`
const DEFAULT_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(DEFAULT_LOGO_SVG)}`

// ---------------------------------------------------------------------------
// Material presets — six distinct finishes, each tuned as its own material
// (color, gloss, metalness and how hard the rainbow interference reads)
// rather than one look with a recolor. Motion speed is scaled per preset too
// (rotateMultiplier) so a heavy metal reads as deliberate and a glassy one
// reads as light, instead of every finish spinning at identical speed.
// ---------------------------------------------------------------------------
const PRESETS = {
    opal: {
        color: "#F5F1FF",
        roughness: 0.2,
        metalness: 0.32,
        iridescence: 1,
        iridescenceIOR: 1.3,
        thicknessRange: [200, 450],
        envMapIntensity: 1.3,
        rotateMultiplier: 0.85,
    },
    prism: {
        color: "#FFFFFF",
        roughness: 0.05,
        metalness: 0.92,
        iridescence: 1,
        iridescenceIOR: 2.3,
        thicknessRange: [100, 900],
        envMapIntensity: 2.4,
        rotateMultiplier: 1.15,
    },
    pearl: {
        color: "#FAF6EE",
        roughness: 0.04,
        metalness: 0.14,
        iridescence: 0.5,
        iridescenceIOR: 1.4,
        thicknessRange: [260, 380],
        envMapIntensity: 0.9,
        rotateMultiplier: 0.55,
    },
    titanium: {
        color: "#C9CDD3",
        roughness: 0.34,
        metalness: 0.95,
        iridescence: 0.15,
        iridescenceIOR: 1.5,
        thicknessRange: [300, 480],
        envMapIntensity: 1.25,
        rotateMultiplier: 0.8,
    },
    obsidian: {
        color: "#15141F",
        roughness: 0.1,
        metalness: 0.6,
        iridescence: 0.85,
        iridescenceIOR: 1.9,
        thicknessRange: [150, 600],
        envMapIntensity: 2.0,
        rotateMultiplier: 0.7,
    },
    roseGold: {
        color: "#E3B8AE",
        roughness: 0.14,
        metalness: 0.9,
        iridescence: 0.4,
        iridescenceIOR: 1.6,
        thicknessRange: [280, 450],
        envMapIntensity: 1.7,
        rotateMultiplier: 0.75,
    },
}

function resolveMaterialConfig(preset, materialGroup) {
    if (preset === "custom") {
        const {
            baseColor = "#EDEBFF",
            roughness = 0.2,
            metalness = 0.5,
            iridescenceIntensity = 0.9,
        } = materialGroup || {}
        return {
            color: baseColor,
            roughness,
            metalness,
            iridescence: iridescenceIntensity,
            iridescenceIOR: 1.35,
            thicknessRange: [200, 500],
            envMapIntensity: 1.5,
            rotateMultiplier: 1,
        }
    }
    return PRESETS[preset] || PRESETS.opal
}

// A Framer Color control can return a CSS "var(--token, #hex)" string for
// shared color styles. THREE.Color can't parse that, so fall back to the
// literal value inside the var() when present.
function toColorInput(value) {
    if (typeof value !== "string") return "#ffffff"
    const match = value.match(/var\([^,]+,\s*(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s*\)/)
    return match ? match[1] : value
}

function applyMaterialConfig(material, config, overrideColorHex) {
    material.color.set(toColorInput(overrideColorHex || config.color))
    material.roughness = config.roughness
    material.metalness = config.metalness
    material.iridescence = config.iridescence
    material.iridescenceIOR = config.iridescenceIOR
    material.iridescenceThicknessRange = config.thicknessRange
    material.envMapIntensity = config.envMapIntensity
    material.needsUpdate = true
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
}

function disposeObject3D(object) {
    if (!object) return
    object.traverse((child) => {
        if (child.isMesh) {
            child.geometry?.dispose()
            if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose())
            else child.material?.dispose()
        }
    })
}

function getSvgDimensions(xml) {
    const viewBox = xml?.getAttribute?.("viewBox")
    if (viewBox) {
        const parts = viewBox.trim().split(/\s+/).map(Number)
        if (parts.length === 4 && Number.isFinite(parts[2]) && Number.isFinite(parts[3])) {
            const width = parts[2] || 100
            const height = parts[3] || 100
            return { width, height, size: Math.max(width, height) }
        }
    }
    const width = parseFloat(xml?.getAttribute?.("width")) || 100
    const height = parseFloat(xml?.getAttribute?.("height")) || 100
    return { width, height, size: Math.max(width, height) }
}

// Many app-icon-style SVGs (Adobe, GitHub, rounded-square social icons, ...)
// include a full-bleed background shape behind the actual mark. Extruding
// that background as a solid slab turns any such logo into a plain plaque
// with the real mark embossed into it ("looks like a plaster cast"). This
// flags a shape as background when its bounding box touches all four edges
// of the SVG's own viewBox, so only genuinely full-canvas shapes — not a
// large-but-inset mark — get excluded.
function isFullBleedShape(points, width, height) {
    if (!points || points.length === 0) return false
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity
    for (const p of points) {
        if (p.x < minX) minX = p.x
        if (p.y < minY) minY = p.y
        if (p.x > maxX) maxX = p.x
        if (p.y > maxY) maxY = p.y
    }
    const marginX = width * 0.03
    const marginY = height * 0.03
    return minX <= marginX && minY <= marginY && maxX >= width - marginX && maxY >= height - marginY
}

// ---------------------------------------------------------------------------
// Procedural chromatic environment (no external HDR asset required)
// ---------------------------------------------------------------------------
function buildEnvironmentScene() {
    const size = 256
    const canvas = document.createElement("canvas")
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext("2d")
    const gradient = ctx.createLinearGradient(0, 0, 0, size)
    gradient.addColorStop(0, "#8C7CFF")
    gradient.addColorStop(0.45, "#5B8CFF")
    gradient.addColorStop(0.75, "#D9CBAE")
    gradient.addColorStop(1, "#0A0A12")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const geometry = new THREE.SphereGeometry(50, 32, 32)
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    return { scene, texture, geometry, material }
}

// ---------------------------------------------------------------------------
// SVG -> extruded, centered THREE.Group
// ---------------------------------------------------------------------------
async function buildLogoGroup({
    url,
    colorMode,
    depthRatio,
    bevelRatio,
    bevelSegments,
    curveSegments,
    materialConfig,
    includeBackground,
}) {
    const data = await new Promise((resolve, reject) => {
        new SVGLoader().load(url, resolve, undefined, reject)
    })

    const { paths, xml } = data
    const dims = getSvgDimensions(xml)
    const depth = Math.max(dims.size * depthRatio, 0.001)
    const bevelSize = depth * bevelRatio * 0.6
    const extrudeSettings = {
        depth,
        bevelEnabled: bevelSize > 0.0005,
        bevelThickness: bevelSize,
        bevelSize,
        bevelSegments: Math.max(1, Math.round(bevelSegments)),
        curveSegments: Math.max(4, Math.round(curveSegments)),
    }

    // Collect every fillable shape first, without extruding yet, so
    // full-bleed background shapes (see isFullBleedShape) can be filtered
    // out before doing any geometry work.
    const candidates = []
    for (const path of paths) {
        if (path.userData?.style?.fill === "none") continue
        const shapes = SVGLoader.createShapes(path)
        const fillColor = path.color ? `#${path.color.getHexString()}` : "#ffffff"
        for (const shape of shapes) {
            const isBackground = isFullBleedShape(shape.getPoints(), dims.width, dims.height)
            candidates.push({ shape, fillColor, isBackground })
        }
    }

    const filtered = includeBackground ? candidates : candidates.filter((c) => !c.isBackground)
    // If every shape got flagged as background (e.g. the logo genuinely is
    // just a filled square with nothing else), fall back to showing
    // everything rather than throwing "no fillable paths".
    const finalShapes = filtered.length > 0 ? filtered : candidates

    // Paths are always kept as separate meshes, layered in SVG paint order,
    // rather than boolean-merged into one silhouette. Merging every path
    // into one union shape would just produce the largest shape's outer
    // silhouette and silently swallow the rest of the detail. Keeping paths
    // as separate meshes, each nudged forward a real fraction of the
    // extrusion depth, preserves the layered design — as flat color in
    // "Original" mode, as a genuine embossed relief (the raised shape's own
    // bevel and side walls catch the light even under one uniform material)
    // in "Chromatic" mode. Capped so logos with many paths don't turn into
    // a staircase.
    const layerStep = depth * 0.08
    const maxLayerOffset = depth * 0.4
    const useOriginalColor = colorMode === "original"
    const meshes = []

    finalShapes.forEach(({ shape, fillColor }) => {
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        geo.computeVertexNormals()
        const mat = new THREE.MeshPhysicalMaterial({ side: THREE.DoubleSide })
        applyMaterialConfig(mat, materialConfig, useOriginalColor ? fillColor : undefined)
        const mesh = new THREE.Mesh(geo, mat)
        mesh.userData.pathColor = fillColor
        mesh.userData.useOriginalColor = useOriginalColor
        mesh.position.z = Math.min(meshes.length * layerStep, maxLayerOffset)
        meshes.push(mesh)
    })

    if (meshes.length === 0) throw new Error("No fillable paths found in SVG")

    const contentGroup = new THREE.Group()
    meshes.forEach((mesh) => contentGroup.add(mesh))

    // Center in the SVG's raw local space first (still Y-down, unscaled) so
    // the centering math and the bounding box live in the same coordinate
    // frame. Only after children sit at the local origin do we apply the
    // Y-flip (SVG is Y-down, Three.js is Y-up) and the uniform normalizing
    // scale together — scaling around an already-centered origin can't
    // introduce any offset.
    const box = new THREE.Box3().setFromObject(contentGroup)
    const center = box.getCenter(new THREE.Vector3())
    contentGroup.children.forEach((child) => child.position.sub(center))

    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const targetSize = 2.4
    const scale = targetSize / maxDim
    contentGroup.scale.set(scale, -scale, scale)

    return contentGroup
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 400
 * @framerIntrinsicHeight 400
 */
//@framerDisableUnlink
export default function IridescentLogo3D(props) {
    const { logo, preset = "opal", content, geometry, material, interaction, style } = props

    const {
        colorMode = "chromatic",
        backgroundColor = "#050505",
        includeBackground = false,
    } = content || {}
    const { depth: depthRatio = 0.28, bevelAmount: bevelRatio = 0.35, bevelSegments = 3, curveSegments = 12 } =
        geometry || {}
    const { autoRotate = true, autoRotateSpeed = 0.6, enableDrag = true, enableInertia = true } = interaction || {}

    const isStatic = useIsStaticRenderer()

    const containerRef = useRef(null)
    const sceneRef = useRef(null)
    const cameraRef = useRef(null)
    const rendererRef = useRef(null)
    const logoGroupRef = useRef(null)
    const clockRef = useRef(null)
    const frameIdRef = useRef(null)
    const envTexRef = useRef(null)
    const loopControlRef = useRef(null)
    const isVisibleRef = useRef(true)
    const isStaticRef = useRef(isStatic)
    const dragStateRef = useRef({ isDragging: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0, phase: 0 })
    const interactionParamsRef = useRef({ autoRotate, autoRotateSpeed, enableDrag, enableInertia })
    const materialConfigRef = useRef(null)

    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    // Keep the latest interaction params available to the render loop
    // without re-subscribing effects on every change.
    interactionParamsRef.current = { autoRotate, autoRotateSpeed, enableDrag, enableInertia }

    // --- Mount: create renderer/scene/camera/env, observers, pointer handlers
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const scene = new THREE.Scene()
        scene.background = null

        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
        camera.position.set(0, 0, 6)

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1.05
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        container.appendChild(renderer.domElement)
        renderer.domElement.style.display = "block"
        renderer.domElement.style.width = "100%"
        renderer.domElement.style.height = "100%"

        const ambient = new THREE.AmbientLight(0xffffff, 0.6)
        const key = new THREE.DirectionalLight(0xffffff, 1.2)
        key.position.set(3, 4, 5)
        scene.add(ambient, key)

        const logoGroup = new THREE.Group()
        scene.add(logoGroup)

        const pmrem = new THREE.PMREMGenerator(renderer)
        const env = buildEnvironmentScene()
        const envRT = pmrem.fromScene(env.scene, 0.03)
        scene.environment = envRT.texture
        pmrem.dispose()
        env.texture.dispose()
        env.geometry.dispose()
        env.material.dispose()

        sceneRef.current = scene
        cameraRef.current = camera
        rendererRef.current = renderer
        logoGroupRef.current = logoGroup
        clockRef.current = new THREE.Clock()
        envTexRef.current = envRT.texture

        function updateSize() {
            const width = Math.max(container.clientWidth, 1)
            const height = Math.max(container.clientHeight, 1)
            renderer.setSize(width, height, false)
            camera.aspect = width / height
            camera.updateProjectionMatrix()
        }

        function renderOnce() {
            updateSize()
            renderer.render(scene, camera)
        }

        function stopLoop() {
            if (frameIdRef.current !== null) {
                cancelAnimationFrame(frameIdRef.current)
                frameIdRef.current = null
            }
        }

        function updateRotation(delta) {
            const drag = dragStateRef.current
            const params = interactionParamsRef.current
            if (drag.isDragging) return

            const hasVelocity =
                params.enableInertia && (Math.abs(drag.velocityX) > 0.0002 || Math.abs(drag.velocityY) > 0.0002)

            if (hasVelocity) {
                logoGroup.rotation.y += drag.velocityX
                logoGroup.rotation.x = clamp(logoGroup.rotation.x + drag.velocityY, -1.1, 1.1)
                drag.velocityX *= 0.94
                drag.velocityY *= 0.94
            } else {
                drag.velocityX = 0
                drag.velocityY = 0
                if (params.autoRotate) {
                    const speed = params.autoRotateSpeed * (materialConfigRef.current?.rotateMultiplier ?? 1)
                    drag.phase += speed * delta
                    const target = AUTO_ROTATE_AMPLITUDE * Math.sin(drag.phase)
                    const ease = Math.min(1, delta * 4)
                    logoGroup.rotation.y += (target - logoGroup.rotation.y) * ease
                    logoGroup.rotation.x += (0 - logoGroup.rotation.x) * ease
                }
            }
        }

        function tick() {
            frameIdRef.current = requestAnimationFrame(tick)
            const delta = Math.min(clockRef.current.getDelta(), 0.1)
            updateRotation(delta)
            renderer.render(scene, camera)
        }

        function startLoop() {
            if (isStaticRef.current) {
                stopLoop()
                renderOnce()
                return
            }
            if (frameIdRef.current !== null) return
            clockRef.current.getDelta()
            tick()
        }

        loopControlRef.current = { start: startLoop, stop: stopLoop, renderOnce }

        renderOnce()

        const ro = new ResizeObserver(() => {
            updateSize()
            loopControlRef.current?.renderOnce()
        })
        ro.observe(container)

        const io = new IntersectionObserver(
            (entries) => {
                const visible = !!entries[0]?.isIntersecting
                isVisibleRef.current = visible
                if (visible) startLoop()
                else stopLoop()
            },
            { threshold: 0.01 }
        )
        io.observe(container)

        function onPointerDown(event) {
            if (!interactionParamsRef.current.enableDrag) return
            const drag = dragStateRef.current
            drag.isDragging = true
            drag.lastX = event.clientX
            drag.lastY = event.clientY
            drag.velocityX = 0
            drag.velocityY = 0
            container.style.cursor = "grabbing"
        }

        function onPointerMove(event) {
            const drag = dragStateRef.current
            if (!drag.isDragging) return
            const dx = event.clientX - drag.lastX
            const dy = event.clientY - drag.lastY
            drag.lastX = event.clientX
            drag.lastY = event.clientY
            const rotSpeed = 0.008
            logoGroup.rotation.y += dx * rotSpeed
            logoGroup.rotation.x = clamp(logoGroup.rotation.x + dy * rotSpeed, -1.1, 1.1)
            drag.velocityX = dx * rotSpeed
            drag.velocityY = dy * rotSpeed
        }

        function onPointerUp() {
            const drag = dragStateRef.current
            drag.isDragging = false
            container.style.cursor = interactionParamsRef.current.enableDrag ? "grab" : "default"
        }

        container.style.cursor = interactionParamsRef.current.enableDrag ? "grab" : "default"
        container.addEventListener("pointerdown", onPointerDown)
        window.addEventListener("pointermove", onPointerMove)
        window.addEventListener("pointerup", onPointerUp)
        window.addEventListener("pointercancel", onPointerUp)

        if (!isStaticRef.current) startLoop()

        return () => {
            stopLoop()
            ro.disconnect()
            io.disconnect()
            container.removeEventListener("pointerdown", onPointerDown)
            window.removeEventListener("pointermove", onPointerMove)
            window.removeEventListener("pointerup", onPointerUp)
            window.removeEventListener("pointercancel", onPointerUp)
            disposeObject3D(scene)
            envTexRef.current?.dispose()
            renderer.dispose()
            renderer.forceContextLoss()
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement)
            sceneRef.current = null
            cameraRef.current = null
            rendererRef.current = null
            logoGroupRef.current = null
            loopControlRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // --- React to static-renderer changes (Framer canvas vs. preview/publish)
    useEffect(() => {
        isStaticRef.current = isStatic
        if (!loopControlRef.current) return
        if (isStatic) {
            loopControlRef.current.stop()
            loopControlRef.current.renderOnce()
        } else if (isVisibleRef.current) {
            loopControlRef.current.start()
        }
    }, [isStatic])

    // --- Update cursor affordance when drag is toggled
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.cursor = enableDrag ? "grab" : "default"
        }
    }, [enableDrag])

    // --- Rebuild geometry when the SVG or geometry controls change
    useEffect(() => {
        if (!sceneRef.current || !logoGroupRef.current) return
        let ignore = false
        setIsLoading(true)
        setHasError(false)

        const materialConfig = resolveMaterialConfig(preset, material)
        materialConfigRef.current = materialConfig

        buildLogoGroup({
            url: logo || DEFAULT_LOGO_DATA_URL,
            colorMode,
            depthRatio,
            bevelRatio,
            bevelSegments,
            curveSegments,
            materialConfig,
            includeBackground,
        })
            .then((contentGroup) => {
                if (ignore) {
                    disposeObject3D(contentGroup)
                    return
                }
                const outer = logoGroupRef.current
                const old = outer.children[0]
                if (old) {
                    disposeObject3D(old)
                    outer.remove(old)
                }
                outer.add(contentGroup)
                setIsLoading(false)
                loopControlRef.current?.renderOnce()
            })
            .catch((error) => {
                if (ignore) return
                console.error("[IridescentLogo3D] Failed to build logo", error)
                setIsLoading(false)
                setHasError(true)
            })

        return () => {
            ignore = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logo, colorMode, depthRatio, bevelRatio, bevelSegments, curveSegments, includeBackground])

    // --- Update material in place when preset/material controls change
    useEffect(() => {
        if (!logoGroupRef.current) return
        const config = resolveMaterialConfig(preset, material)
        materialConfigRef.current = config
        const contentGroup = logoGroupRef.current.children[0]
        if (!contentGroup) return
        contentGroup.traverse((obj) => {
            if (obj.isMesh) {
                applyMaterialConfig(obj.material, config, obj.userData.useOriginalColor ? obj.userData.pathColor : undefined)
            }
        })
        loopControlRef.current?.renderOnce()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preset, material?.baseColor, material?.roughness, material?.metalness, material?.iridescenceIntensity])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                overflow: "hidden",
                touchAction: "none",
                ...style,
                background: backgroundColor,
            }}
        >
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                    }}
                >
                    {!isStatic && (
                        <>
                            <style>{`@keyframes il3dSpin { to { transform: rotate(360deg) } }`}</style>
                            <div
                                style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    border: "2px solid rgba(255,255,255,0.25)",
                                    borderTopColor: "rgba(255,255,255,0.85)",
                                    animation: "il3dSpin 0.8s linear infinite",
                                }}
                            />
                        </>
                    )}
                    {isStatic && (
                        <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                            Loading…
                        </span>
                    )}
                </div>
            )}
            {hasError && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                        textAlign: "center",
                        pointerEvents: "none",
                    }}
                >
                    <span style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(255,120,120,0.9)" }}>
                        Couldn't render this SVG. Try a simpler file exported from Figma or Illustrator.
                    </span>
                </div>
            )}
        </div>
    )
}

IridescentLogo3D.defaultProps = {
    logo: DEFAULT_LOGO_DATA_URL,
    preset: "opal",
    content: {
        colorMode: "chromatic",
        backgroundColor: "#050505",
        includeBackground: false,
    },
    geometry: {
        depth: 0.28,
        bevelAmount: 0.35,
        bevelSegments: 3,
        curveSegments: 12,
    },
    material: {
        baseColor: "#EDEBFF",
        roughness: 0.2,
        metalness: 0.5,
        iridescenceIntensity: 0.9,
    },
    interaction: {
        autoRotate: true,
        autoRotateSpeed: 0.6,
        enableDrag: true,
        enableInertia: true,
    },
}

addPropertyControls(IridescentLogo3D, {
    logo: {
        type: ControlType.File,
        title: "Logo",
        allowedFileTypes: ["svg"],
        defaultValue: DEFAULT_LOGO_DATA_URL,
        description: "Upload a single- or multi-color SVG logo.",
    },
    preset: {
        type: ControlType.Enum,
        title: "Preset",
        options: ["opal", "prism", "pearl", "titanium", "obsidian", "roseGold", "custom"],
        optionTitles: ["Opal", "Prism", "Pearl", "Titanium", "Obsidian", "Rose Gold", "Custom"],
        defaultValue: "opal",
    },
    content: {
        type: ControlType.Object,
        title: "Content",
        controls: {
            colorMode: {
                type: ControlType.Enum,
                title: "Colors",
                options: ["chromatic", "original"],
                optionTitles: ["Chromatic", "Original"],
                defaultValue: "chromatic",
            },
            backgroundColor: {
                type: ControlType.Color,
                title: "Background",
                defaultValue: "#050505",
            },
            includeBackground: {
                type: ControlType.Boolean,
                title: "Bg Shape",
                enabledTitle: "Show",
                disabledTitle: "Hide",
                defaultValue: false,
                description:
                    "Many app-icon SVGs include a full-canvas background shape behind the mark. Hidden by default so the logo reads as its own 3D shape instead of a plaque. Turn on if your SVG's background color is actually part of the brand mark (e.g. a colored square badge).",
            },
        },
    },
    geometry: {
        type: ControlType.Object,
        title: "Geometry",
        controls: {
            depth: {
                type: ControlType.Number,
                title: "Depth",
                min: 0.02,
                max: 1,
                step: 0.01,
                defaultValue: 0.28,
            },
            bevelAmount: {
                type: ControlType.Number,
                title: "Bevel",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: 0.35,
            },
            bevelSegments: {
                type: ControlType.Number,
                title: "Bevel Smoothness",
                min: 1,
                max: 8,
                step: 1,
                defaultValue: 3,
            },
            curveSegments: {
                type: ControlType.Number,
                title: "Curve Smoothness",
                min: 4,
                max: 32,
                step: 1,
                defaultValue: 12,
            },
        },
    },
    material: {
        type: ControlType.Object,
        title: "Material",
        hidden: (props) => props.preset !== "custom",
        controls: {
            baseColor: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#EDEBFF",
            },
            roughness: {
                type: ControlType.Number,
                title: "Roughness",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: 0.2,
            },
            metalness: {
                type: ControlType.Number,
                title: "Metalness",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: 0.5,
            },
            iridescenceIntensity: {
                type: ControlType.Number,
                title: "Iridescence",
                min: 0,
                max: 1,
                step: 0.01,
                defaultValue: 0.9,
            },
        },
    },
    interaction: {
        type: ControlType.Object,
        title: "Interaction",
        controls: {
            autoRotate: {
                type: ControlType.Boolean,
                title: "Auto Rotate",
                enabledTitle: "On",
                disabledTitle: "Off",
                defaultValue: true,
            },
            autoRotateSpeed: {
                type: ControlType.Number,
                title: "Speed",
                min: 0.05,
                max: 3,
                step: 0.05,
                defaultValue: 0.6,
            },
            enableDrag: {
                type: ControlType.Boolean,
                title: "Drag",
                enabledTitle: "On",
                disabledTitle: "Off",
                defaultValue: true,
            },
            enableInertia: {
                type: ControlType.Boolean,
                title: "Inertia",
                enabledTitle: "On",
                disabledTitle: "Off",
                defaultValue: true,
            },
        },
        description: "More interactive 3D components at [example.com](https://example.com)",
    },
})
