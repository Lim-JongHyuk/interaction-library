"use client";

/* eslint-disable react-hooks/exhaustive-deps -- The WebGL lifecycle is stable while a separate effect mirrors live props. */

// deps: ogl
import { useEffect, useRef } from "react";
import { Color, Mesh, Program, Renderer, RenderTarget, Triangle } from "ogl";

const MAX_STRANDS = 12;
const MAX_COLORS = 8;

const vertex = `#version 300 es
in vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;

const fragment = `#version 300 es
precision highp float;
uniform float uTime,uSpeed,uAmplitude,uWaviness,uThickness,uGlow,uTaper,uSpread,uHueShift,uIntensity,uOpacity,uScale,uSaturation;
uniform vec2 uResolution; uniform vec3 uColors[${MAX_COLORS}]; uniform int uColorCount,uStrandCount; out vec4 fragColor;
const float PI=3.14159265;
vec3 spectrum(float t){return .5+.5*cos(2.*PI*(t+vec3(0.,.33,.67)));}
vec3 palette(float t){t=fract(t);float scaled=t*float(uColorCount);int index=int(floor(scaled));float blend=fract(scaled);int next=index+1;if(next>=uColorCount)next=0;return mix(uColors[index],uColors[next],blend);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uResolution)/uResolution.y;uv/=max(uScale,.0001);float energy=.06+uIntensity*.94;float envelope=pow(max(cos(uv.x*PI*1.3),0.),uTaper);vec3 color=vec3(0.);for(int i=0;i<${MAX_STRANDS};i++){if(i>=uStrandCount)break;float strand=float(i);float phase=strand*1.7*uSpread;float frequency=(2.+strand*.35)*uWaviness;float time=uTime*uSpeed;float wave=sin(uv.x*frequency+time*(1.4+strand*1.2)+phase)*.6+sin(uv.x*frequency*1.1-time*(1.4+strand*1.2)*.7+phase*1.7)*.4;float y=wave*(.1+.02*energy)*envelope*uAmplitude;float thickness=(.001+.05*energy)*(.35+envelope)*uThickness;float glow=thickness/(abs(uv.y-y)+thickness*.45);glow*=glow;float hue=strand/float(uStrandCount)+uv.x*.3+uTime*.04+uHueShift;vec3 strandColor=uColorCount>0?palette(hue):spectrum(hue);color+=strandColor*glow*envelope;}color*=.45+.7*energy;color=1.-exp(-color*uGlow);float gray=dot(color,vec3(.2126,.7152,.0722));color=max(mix(vec3(gray),color,uSaturation),0.);float alpha=clamp(max(max(color.r,color.g),color.b),0.,1.)*uOpacity;fragColor=vec4(color*uOpacity,alpha);}`;

const glassFragment = `#version 300 es
precision highp float;
uniform sampler2D uScene;uniform vec2 uResolution;uniform float uRadius,uRefraction,uDispersion;out vec4 fragColor;
vec2 toUv(vec2 p){return p*(uResolution.y/uResolution)+.5;}
void main(){vec2 p=(gl_FragCoord.xy-.5*uResolution)/uResolution.y;float distance=length(p),edge=fwidth(distance)*1.5,mask=1.-smoothstep(uRadius-edge,uRadius+edge,distance);if(mask<=0.){fragColor=vec4(0.);return;}float z=sqrt(max(uRadius*uRadius-distance*distance,0.))/uRadius;float normalizedDistance=distance/uRadius;vec2 direction=distance>0.?p/distance:vec2(0.);float lens=smoothstep(.85,1.,normalizedDistance)*pow(normalizedDistance,6.);vec2 offset=-direction*lens*uRefraction*.15,dispersion=-direction*lens*uDispersion*.012;vec3 light=vec3(texture(uScene,toUv(p+offset-dispersion)).r,texture(uScene,toUv(p+offset)).g,texture(uScene,toUv(p+offset+dispersion)).b);float fresnel=pow(1.-z,3.);vec2 lightDirection=normalize(vec2(-.55,.6));float specular=pow(max(dot(p/max(uRadius,.0001),lightDirection),0.),6.)*smoothstep(uRadius,uRadius*.55,distance);vec3 emissive=light+vec3(fresnel*.18+specular*.4);float emissiveAlpha=clamp(max(max(emissive.r,emissive.g),emissive.b),0.,1.);float alpha=(emissiveAlpha+(.05+fresnel*.05)*(1.-emissiveAlpha))*mask;fragColor=vec4(emissive*mask,alpha);}`;

const buildPalette = (colors: string[]) => {
  const filled = colors.length ? colors : ["#ffffff"];
  return Array.from({ length: MAX_COLORS }, (_, index) => {
    const color = new Color(filled[index] ?? filled[filled.length - 1]);
    return [color.r, color.g, color.b];
  });
};

export interface StrandsProps {
  colors?: string[]; count?: number; speed?: number; amplitude?: number; waviness?: number; thickness?: number; glow?: number; taper?: number; spread?: number; hueShift?: number; intensity?: number; saturation?: number; opacity?: number; scale?: number; glass?: boolean; refraction?: number; dispersion?: number; glassSize?: number; className?: string;
}

export function Strands({ colors=["#FF4242","#7C3AED","#06B6D4","#EAB308"], count=3, speed=.5, amplitude=1, waviness=1, thickness=.7, glow=2.6, taper=3, spread=1, hueShift=0, intensity=.6, saturation=1.5, opacity=1, scale=1.5, glass=false, refraction=1, dispersion=1, glassSize=1, className="" }: StrandsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const props = useRef({ colors,count,speed,amplitude,waviness,thickness,glow,taper,spread,hueShift,intensity,saturation,opacity,scale,glass,refraction,dispersion,glassSize });
  useEffect(() => { props.current = { colors,count,speed,amplitude,waviness,thickness,glow,taper,spread,hueShift,intensity,saturation,opacity,scale,glass,refraction,dispersion,glassSize }; }, [colors,count,speed,amplitude,waviness,thickness,glow,taper,spread,hueShift,intensity,saturation,opacity,scale,glass,refraction,dispersion,glassSize]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const renderer = new Renderer({ alpha: true, premultipliedAlpha: true, antialias: true, webgl: 2, dpr: Math.min(window.devicePixelRatio || 1, 2) });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    Object.assign(gl.canvas.style, { display: "block", width: "100%", height: "100%" });
    host.appendChild(gl.canvas);
    const geometry = new Triangle(gl);
    if (geometry.attributes.uv) delete geometry.attributes.uv;
    const program = new Program(gl, { vertex, fragment, uniforms: { uTime:{value:0},uResolution:{value:[1,1]},uColors:{value:buildPalette(colors)},uColorCount:{value:Math.min(colors.length,MAX_COLORS)},uStrandCount:{value:Math.min(count,MAX_STRANDS)},uSpeed:{value:speed},uAmplitude:{value:amplitude},uWaviness:{value:waviness},uThickness:{value:thickness},uGlow:{value:glow},uTaper:{value:taper},uSpread:{value:spread},uHueShift:{value:hueShift},uIntensity:{value:intensity},uOpacity:{value:opacity},uScale:{value:scale},uSaturation:{value:saturation} } });
    const scene = new Mesh(gl, { geometry, program });
    const target = new RenderTarget(gl, { width: 1, height: 1 });
    const glassProgram = new Program(gl, { vertex, fragment: glassFragment, uniforms: { uScene:{value:target.texture},uResolution:{value:[1,1]},uRadius:{value:.46*glassSize},uRefraction:{value:refraction},uDispersion:{value:dispersion} } });
    const glassScene = new Mesh(gl, { geometry, program: glassProgram });
    const resize = () => { const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height);const resolution=[gl.drawingBufferWidth,gl.drawingBufferHeight];program.uniforms.uResolution.value=resolution;glassProgram.uniforms.uResolution.value=resolution;target.setSize(width,height); };
    const observer = new ResizeObserver(resize); observer.observe(host); resize();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const render = (time: number) => { const current=props.current;program.uniforms.uTime.value=reducedMotion?0:time*.001;program.uniforms.uColors.value=buildPalette(current.colors);program.uniforms.uColorCount.value=Math.min(current.colors.length,MAX_COLORS);program.uniforms.uStrandCount.value=Math.min(Math.max(Math.round(current.count),1),MAX_STRANDS);program.uniforms.uSpeed.value=current.speed;program.uniforms.uAmplitude.value=current.amplitude;program.uniforms.uWaviness.value=current.waviness;program.uniforms.uThickness.value=current.thickness;program.uniforms.uGlow.value=current.glow;program.uniforms.uTaper.value=current.taper;program.uniforms.uSpread.value=current.spread;program.uniforms.uHueShift.value=current.hueShift;program.uniforms.uIntensity.value=current.intensity;program.uniforms.uOpacity.value=current.opacity;program.uniforms.uScale.value=current.scale;program.uniforms.uSaturation.value=current.saturation;if(current.glass){renderer.render({scene,target});glassProgram.uniforms.uRefraction.value=current.refraction;glassProgram.uniforms.uDispersion.value=current.dispersion;glassProgram.uniforms.uRadius.value=.46*current.glassSize;renderer.render({scene:glassScene});}else renderer.render({scene});if(!reducedMotion)frame=requestAnimationFrame(render); };
    frame=requestAnimationFrame(render);
    return () => { cancelAnimationFrame(frame);observer.disconnect();gl.canvas.remove();gl.getExtension("WEBGL_lose_context")?.loseContext(); };
  }, []);
  return <div ref={hostRef} role="img" aria-label="Animated glowing strands background" className={`relative h-full w-full overflow-hidden ${className}`.trim()} />;
}
