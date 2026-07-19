"use client";

// deps: 없음 (raw WebGL)
import { useEffect, useRef } from "react";

export interface FluidSimulationProps {
  /** 스플랫(잉크 방울) 반경 */
  splatRadius?: number;
  /** 잉크가 사라지는 속도 (높을수록 빨리 사라짐) */
  fade?: number;
  /** 소용돌이 강도 (vorticity confinement) */
  curl?: number;
  /** 무지개 자동 색상. 끄면 단색 */
  colorful?: boolean;
  /** colorful=false일 때 잉크 색 */
  color?: string;
  /** 포인터 입력이 없어도 주기적으로 잉크를 뿌리는 앰비언트 모드 */
  ambient?: boolean;
}

/**
 * 실시간 Navier-Stokes 유체 시뮬레이션 배경. GPU에서 ping-pong FBO로
 * advection → curl → vorticity → divergence → pressure(Jacobi) → project를
 * 매 프레임 풀어낸다. 포인터 드래그로 잉크를 뿌릴 수 있다.
 */
export function FluidSimulation({
  splatRadius = 0.25,
  fade = 1,
  curl = 30,
  colorful = true,
  color = "#6366f1",
  ambient = true,
}: FluidSimulationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef({ splatRadius, fade, curl, colorful, color, ambient });

  useEffect(() => {
    paramsRef.current = { splatRadius, fade, curl, colorful, color, ambient };
  }, [splatRadius, fade, curl, colorful, color, ambient]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, { display: "block", width: "100%", height: "100%" });
    container.appendChild(canvas);

    const gl2 = canvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: false });
    const gl = (gl2 ??
      canvas.getContext("webgl", { alpha: false, depth: false, stencil: false, antialias: false })) as
      | WebGLRenderingContext
      | WebGL2RenderingContext
      | null;
    if (!gl) {
      canvas.remove();
      container.style.background = "radial-gradient(circle at 30% 40%, #312e81, #000)";
      return;
    }
    const isGL2 = !!gl2;

    let halfFloat: number;
    let supportLinear: boolean;
    if (isGL2) {
      (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
      supportLinear = !!gl.getExtension("OES_texture_float_linear");
      halfFloat = (gl as WebGL2RenderingContext).HALF_FLOAT;
    } else {
      const ext = gl.getExtension("OES_texture_half_float");
      supportLinear = !!gl.getExtension("OES_texture_half_float_linear");
      if (!ext) {
        canvas.remove();
        container.style.background = "radial-gradient(circle at 30% 40%, #312e81, #000)";
        return;
      }
      halfFloat = ext.HALF_FLOAT_OES;
    }
    const filtering = supportLinear ? gl.LINEAR : gl.NEAREST;

    const VERT = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main () { vUv = aPosition * 0.5 + 0.5; gl_Position = vec4(aPosition, 0.0, 1.0); }`;

    const SPLAT = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }`;

    const ADVECT = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
      }`;

    const DIVERGENCE = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform vec2 texelSize;
      void main () {
        float L = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
        float R = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
        float B = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).y;
        float T = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).y;
        gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`;

    const CURL = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform vec2 texelSize;
      void main () {
        float L = texture2D(uVelocity, vUv - vec2(texelSize.x, 0.0)).y;
        float R = texture2D(uVelocity, vUv + vec2(texelSize.x, 0.0)).y;
        float B = texture2D(uVelocity, vUv - vec2(0.0, texelSize.y)).x;
        float T = texture2D(uVelocity, vUv + vec2(0.0, texelSize.y)).x;
        gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`;

    const VORTICITY = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform vec2 texelSize;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vUv - vec2(texelSize.x, 0.0)).x;
        float R = texture2D(uCurl, vUv + vec2(texelSize.x, 0.0)).x;
        float B = texture2D(uCurl, vUv - vec2(0.0, texelSize.y)).x;
        float T = texture2D(uCurl, vUv + vec2(0.0, texelSize.y)).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;
        gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
      }`;

    const PRESSURE = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      uniform vec2 texelSize;
      void main () {
        float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
        float divergence = texture2D(uDivergence, vUv).x;
        gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
      }`;

    const GRADIENT_SUBTRACT = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      uniform vec2 texelSize;
      void main () {
        float L = texture2D(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
        float R = texture2D(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
        float B = texture2D(uPressure, vUv - vec2(0.0, texelSize.y)).x;
        float T = texture2D(uPressure, vUv + vec2(0.0, texelSize.y)).x;
        vec2 vel = texture2D(uVelocity, vUv).xy - 0.5 * vec2(R - L, T - B);
        gl_FragColor = vec4(vel, 0.0, 1.0);
      }`;

    const DISPLAY = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        // 살짝 톤매핑해서 과포화 방지
        c = c / (1.0 + dot(c, vec3(0.299, 0.587, 0.114)) * 0.15);
        gl_FragColor = vec4(c, 1.0);
      }`;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }
    const vertShader = compile(gl.VERTEX_SHADER, VERT);

    type Program = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation> };
    const programs: Program[] = [];
    function createProgram(fragSrc: string): Program {
      const program = gl!.createProgram()!;
      gl!.attachShader(program, vertShader);
      gl!.attachShader(program, compile(gl!.FRAGMENT_SHADER, fragSrc));
      gl!.linkProgram(program);
      const uniforms: Record<string, WebGLUniformLocation> = {};
      const n = gl!.getProgramParameter(program, gl!.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl!.getActiveUniform(program, i)!;
        uniforms[info.name] = gl!.getUniformLocation(program, info.name)!;
      }
      const p = { program, uniforms };
      programs.push(p);
      return p;
    }

    const splatProg = createProgram(SPLAT);
    const advectProg = createProgram(ADVECT);
    const divergenceProg = createProgram(DIVERGENCE);
    const curlProg = createProgram(CURL);
    const vorticityProg = createProgram(VORTICITY);
    const pressureProg = createProgram(PRESSURE);
    const gradientProg = createProgram(GRADIENT_SUBTRACT);
    const displayProg = createProgram(DISPLAY);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    interface FBO {
      texture: WebGLTexture;
      fbo: WebGLFramebuffer;
      width: number;
      height: number;
      texelX: number;
      texelY: number;
      attach: (unit: number) => number;
    }
    interface DoubleFBO {
      read: FBO;
      write: FBO;
      texelX: number;
      texelY: number;
      swap: () => void;
    }

    const internalFormat = isGL2 ? (gl as WebGL2RenderingContext).RGBA16F : gl.RGBA;

    function createFBO(w: number, h: number): FBO {
      const texture = gl!.createTexture()!;
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filtering);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filtering);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, gl!.RGBA, halfFloat, null);
      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
      gl!.viewport(0, 0, w, h);
      gl!.clearColor(0, 0, 0, 1);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelX: 1 / w,
        texelY: 1 / h,
        attach(unit: number) {
          gl!.activeTexture(gl!.TEXTURE0 + unit);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return unit;
        },
      };
    }

    function createDoubleFBO(w: number, h: number): DoubleFBO {
      let read = createFBO(w, h);
      let write = createFBO(w, h);
      return {
        get read() { return read; },
        get write() { return write; },
        texelX: 1 / w,
        texelY: 1 / h,
        swap() { const t = read; read = write; write = t; },
      } as DoubleFBO;
    }

    const SIM_RES = 128;
    const DYE_RES = 512;
    let velocity: DoubleFBO;
    let dye: DoubleFBO;
    let divergence: FBO;
    let curlFBO: FBO;
    let pressure: DoubleFBO;

    function simSize(res: number) {
      const aspect = canvas.width / Math.max(canvas.height, 1);
      return aspect > 1
        ? { w: Math.round(res * aspect), h: res }
        : { w: res, h: Math.round(res / Math.max(aspect, 0.0001)) };
    }

    function initFBOs() {
      const sim = simSize(SIM_RES);
      const dyeSize = simSize(DYE_RES);
      velocity = createDoubleFBO(sim.w, sim.h);
      divergence = createFBO(sim.w, sim.h);
      curlFBO = createFBO(sim.w, sim.h);
      pressure = createDoubleFBO(sim.w, sim.h);
      dye = createDoubleFBO(dyeSize.w, dyeSize.h);
    }

    function blit(target: FBO | null) {
      if (target) {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      } else {
        gl!.viewport(0, 0, canvas.width, canvas.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      }
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace("#", "");
      const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
      const n = parseInt(full, 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }

    function hsvToRgb(h: number): [number, number, number] {
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const q = 1 - f;
      switch (i % 6) {
        case 0: return [1, f, 0];
        case 1: return [q, 1, 0];
        case 2: return [0, 1, f];
        case 3: return [0, q, 1];
        case 4: return [f, 0, 1];
        default: return [1, 0, q];
      }
    }

    let hue = Math.random();
    function inkColor(): [number, number, number] {
      const p = paramsRef.current;
      if (!p.colorful) {
        const [r, g, b] = hexToRgb(p.color);
        return [r * 0.35, g * 0.35, b * 0.35];
      }
      hue = (hue + 0.13) % 1;
      const [r, g, b] = hsvToRgb(hue);
      return [r * 0.3, g * 0.3, b * 0.3];
    }

    function splat(x: number, y: number, dx: number, dy: number, col: [number, number, number]) {
      const aspect = canvas.width / Math.max(canvas.height, 1);
      const radius = (paramsRef.current.splatRadius / 100) * (aspect > 1 ? 1 : aspect);
      gl!.useProgram(splatProg.program);
      gl!.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
      gl!.uniform1f(splatProg.uniforms.aspectRatio, aspect);
      gl!.uniform2f(splatProg.uniforms.point, x, y);
      gl!.uniform3f(splatProg.uniforms.color, dx, dy, 0);
      gl!.uniform1f(splatProg.uniforms.radius, radius);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
      gl!.uniform3f(splatProg.uniforms.color, col[0], col[1], col[2]);
      blit(dye.write);
      dye.swap();
    }

    function step(dt: number) {
      const p = paramsRef.current;
      gl!.disable(gl!.BLEND);

      gl!.useProgram(curlProg.program);
      gl!.uniform2f(curlProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(curlFBO);

      gl!.useProgram(vorticityProg.program);
      gl!.uniform2f(vorticityProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(vorticityProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(vorticityProg.uniforms.uCurl, curlFBO.attach(1));
      gl!.uniform1f(vorticityProg.uniforms.curl, p.curl);
      gl!.uniform1f(vorticityProg.uniforms.dt, dt);
      blit(velocity.write);
      velocity.swap();

      gl!.useProgram(divergenceProg.program);
      gl!.uniform2f(divergenceProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);

      gl!.useProgram(pressureProg.program);
      gl!.uniform2f(pressureProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(pressureProg.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < 20; i++) {
        gl!.uniform1i(pressureProg.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gl!.useProgram(gradientProg.program);
      gl!.uniform2f(gradientProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(gradientProg.uniforms.uPressure, pressure.read.attach(0));
      gl!.uniform1i(gradientProg.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      gl!.useProgram(advectProg.program);
      gl!.uniform2f(advectProg.uniforms.texelSize, velocity.texelX, velocity.texelY);
      gl!.uniform1i(advectProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectProg.uniforms.uSource, velocity.read.attach(0));
      gl!.uniform1f(advectProg.uniforms.dt, dt);
      gl!.uniform1f(advectProg.uniforms.dissipation, 1 - 0.02 * dt * 60 * 0.1);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(advectProg.uniforms.uVelocity, velocity.read.attach(0));
      gl!.uniform1i(advectProg.uniforms.uSource, dye.read.attach(1));
      gl!.uniform1f(advectProg.uniforms.dissipation, Math.max(0, 1 - p.fade * 0.01 * dt * 60));
      blit(dye.write);
      dye.swap();
    }

    function render() {
      gl!.useProgram(displayProg.program);
      gl!.uniform1i(displayProg.uniforms.uTexture, dye.read.attach(0));
      blit(null);
    }

    function updateSize() {
      const w = Math.max(container!.clientWidth, 1);
      const h = Math.max(container!.clientHeight, 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pw = Math.floor(w * dpr);
      const ph = Math.floor(h * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        initFBOs();
        seed();
      }
    }

    function seed() {
      for (let i = 0; i < 6; i++) {
        const x = Math.random();
        const y = Math.random();
        splat(x, y, (Math.random() - 0.5) * 800, (Math.random() - 0.5) * 800, inkColor());
      }
    }

    let frameId: number | null = null;
    let lastTime = performance.now();
    let ambientTimer = 0;

    function frame(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      ambientTimer += dt;
      if (paramsRef.current.ambient && ambientTimer > 1.6) {
        ambientTimer = 0;
        const x = Math.random();
        const y = Math.random();
        splat(x, y, (Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600, inkColor());
      }

      step(dt);
      render();
      frameId = requestAnimationFrame(frame);
    }

    updateSize();
    if (reduced) {
      // 정적 잉크 몇 방울만 그려두고 시뮬레이션은 정지
      for (let i = 0; i < 30; i++) step(1 / 60);
      render();
    } else {
      frameId = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => {
      updateSize();
      if (reduced) {
        for (let i = 0; i < 30; i++) step(1 / 60);
        render();
      }
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        if (reduced) return;
        if (entries[0]?.isIntersecting) {
          if (frameId === null) {
            lastTime = performance.now();
            frameId = requestAnimationFrame(frame);
          }
        } else if (frameId !== null) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    let lastPointer: { x: number; y: number } | null = null;
    function onPointerMove(e: PointerEvent) {
      if (reduced) return;
      const rect = container!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (lastPointer) {
        const dx = (x - lastPointer.x) * 6000;
        const dy = (y - lastPointer.y) * 6000;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) splat(x, y, dx, dy, inkColor());
      }
      lastPointer = { x, y };
    }
    function onPointerLeave() {
      lastPointer = null;
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerleave", onPointerLeave);
      programs.forEach((p) => gl!.deleteProgram(p.program));
      gl!.deleteBuffer(quad);
      gl!.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  return <div ref={containerRef} className="relative h-full w-full touch-none overflow-hidden rounded-xl bg-black" />;
}
