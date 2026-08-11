"use client";

// deps: ogl
import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec3 } from "ogl";

const vertex = `precision highp float;attribute vec2 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`;
const fragment = `
precision highp float;uniform float uTime,uHue,uHover,uRotation,uHoverIntensity;uniform vec3 uResolution,uBackground;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);}
vec3 hueShift(vec3 c,float a){float s=sin(a),co=cos(a);return clamp(c*co+cross(vec3(.57735),c)*s+vec3(.57735)*dot(vec3(.57735),c)*(1.-co),0.,1.);}
void main(){vec2 uv=(vUv-.5)*2.;uv.x*=uResolution.x/uResolution.y;float c=cos(uRotation),s=sin(uRotation);uv=mat2(c,-s,s,c)*uv;uv.x+=sin(uv.y*10.+uTime)*uHover*uHoverIntensity*.1;uv.y+=sin(uv.x*10.+uTime)*uHover*uHoverIntensity*.1;float distance=length(uv);float n=noise(uv*.9+uTime*.18);float radius=.76+(n-.5)*.075;float ring=exp(-pow((distance-radius)*28.,2.));float glow=exp(-pow((distance-radius)*7.,2.))*.35;float angle=atan(uv.y,uv.x);vec3 color=mix(vec3(.61,.26,1.),vec3(.30,.76,.91),sin(angle+uTime*1.6)*.5+.5);color=hueShift(color,uHue*.01745329252);float inside=smoothstep(radius,.28,distance);vec3 core=mix(vec3(.025,.02,.07),color*.14,inside);vec3 result=mix(uBackground,core,smoothstep(1.08,.12,distance));result+=color*(ring+glow);float alpha=smoothstep(1.15,.74,distance);gl_FragColor=vec4(result*alpha,alpha);}`;

function hexToVec3(hex: string) { const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000"; return new Vec3(Number.parseInt(value.slice(1,3),16)/255,Number.parseInt(value.slice(3,5),16)/255,Number.parseInt(value.slice(5,7),16)/255); }

export interface OrbProps { hue?: number; hoverIntensity?: number; rotateOnHover?: boolean; forceHoverState?: boolean; backgroundColor?: string; className?: string; }

export function Orb({ hue=0, hoverIntensity=.2, rotateOnHover=true, forceHoverState=false, backgroundColor="#000000", className="" }: OrbProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const props = useRef({ hue,hoverIntensity,rotateOnHover,forceHoverState,backgroundColor });
  props.current = { hue,hoverIntensity,rotateOnHover,forceHoverState,backgroundColor };
  useEffect(() => {
    const host=hostRef.current;if(!host)return;
    const renderer=new Renderer({alpha:true,premultipliedAlpha:false,dpr:Math.min(window.devicePixelRatio||1,2)}),gl=renderer.gl;
    gl.clearColor(0,0,0,0);Object.assign(gl.canvas.style,{display:"block",width:"100%",height:"100%"});host.appendChild(gl.canvas);
    const program=new Program(gl,{vertex,fragment,uniforms:{uTime:{value:0},uHue:{value:hue},uHover:{value:0},uRotation:{value:0},uHoverIntensity:{value:hoverIntensity},uResolution:{value:new Vec3(1,1,1)},uBackground:{value:hexToVec3(backgroundColor)}}});
    const mesh=new Mesh(gl,{geometry:new Triangle(gl),program});
    const resize=()=>{const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);renderer.setSize(width,height);program.uniforms.uResolution.value.set(gl.drawingBufferWidth,gl.drawingBufferHeight,gl.drawingBufferWidth/gl.drawingBufferHeight);};const observer=new ResizeObserver(resize);observer.observe(host);resize();
    let targetHover=0,rotation=0,lastTime=0,frame=0;const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move=(event:PointerEvent)=>{const rect=host.getBoundingClientRect(),size=Math.min(rect.width,rect.height),x=(event.clientX-rect.left-rect.width/2)/size*2,y=(event.clientY-rect.top-rect.height/2)/size*2;targetHover=Math.hypot(x,y)<.82?1:0;};const leave=()=>targetHover=0;host.addEventListener("pointermove",move);host.addEventListener("pointerleave",leave);
    const render=(time:number)=>{const current=props.current,delta=(time-lastTime)*.001;lastTime=time;const active=current.forceHoverState?1:targetHover;program.uniforms.uTime.value=reducedMotion?0:time*.001;program.uniforms.uHue.value=current.hue;program.uniforms.uHoverIntensity.value=current.hoverIntensity;program.uniforms.uBackground.value=hexToVec3(current.backgroundColor);program.uniforms.uHover.value+=(active-program.uniforms.uHover.value)*.1;if(current.rotateOnHover&&active>.5&&!reducedMotion)rotation+=delta*.3;program.uniforms.uRotation.value=rotation;renderer.render({scene:mesh});if(!reducedMotion)frame=requestAnimationFrame(render);};frame=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();host.removeEventListener("pointermove",move);host.removeEventListener("pointerleave",leave);gl.canvas.remove();gl.getExtension("WEBGL_lose_context")?.loseContext();};
  },[]);
  return <div ref={hostRef} role="img" aria-label="Interactive glowing orb background" className={`relative h-full w-full overflow-hidden ${className}`.trim()} />;
}
