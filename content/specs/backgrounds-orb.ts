import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug:"orb",category:"backgrounds",name:"Orb",description:"A luminous, noise-shaped orb that subtly distorts and rotates on hover.",tags:["background","ogl","orb","glow","hover"],trigger:"hover",triggerNote:"Move over the orb to activate its ripple distortion and optional rotation.",
  params:[{key:"hue",label:"Hue",control:"slider",min:0,max:360,step:1,default:0,unit:"°"},{key:"hoverIntensity",label:"Hover intensity",control:"slider",min:0,max:1,step:.05,default:.2},{key:"rotateOnHover",label:"Rotate on hover",control:"toggle",default:true},{key:"forceHoverState",label:"Force hover state",control:"toggle",default:false},{key:"backgroundColor",label:"Background",control:"color",default:"#000000"}],dependencies:["ogl"],variants:["react-ts-tw"],a11y:{reducedMotion:"Respects reduced-motion preferences by rendering the orb without animation.",notes:["Decorative WebGL canvas is labelled for assistive technology."]},install:{registryPath:"r/backgrounds/orb.json"},credits:{inspiredBy:"React Bits",license:"MIT"},demo:{},status:"stable",createdAt:"2026-08-10"
};
export default spec;
