import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug:"beams", category:"backgrounds", name:"Beams", description:"Radiant noise-distorted light beams sweep across a cinematic black field.", tags:["background","three","beams","light","noise"], trigger:"loop",
  params:[
    {key:"beamWidth",label:"Beam width",control:"slider",min:.5,max:4,step:.1,default:2}, {key:"beamHeight",label:"Beam height",control:"slider",min:6,max:24,step:1,default:15}, {key:"beamNumber",label:"Beam count",control:"slider",min:2,max:24,step:1,default:12}, {key:"lightColor",label:"Light color",control:"color",default:"#FFFFFF"}, {key:"speed",label:"Speed",control:"slider",min:0,max:5,step:.1,default:2}, {key:"noiseIntensity",label:"Noise intensity",control:"slider",min:0,max:4,step:.05,default:1.75}, {key:"scale",label:"Noise scale",control:"slider",min:.05,max:1,step:.05,default:.2}, {key:"rotation",label:"Rotation",control:"slider",min:-45,max:45,step:1,default:0,unit:"°"}
  ], dependencies:["three","@react-three/fiber","@react-three/drei"], variants:["react-ts-tw"], a11y:{reducedMotion:"Respects reduced-motion preferences by holding the beams in a static position.",notes:["Decorative canvas is labelled for assistive technology."]}, install:{registryPath:"r/backgrounds/beams.json"}, credits:{inspiredBy:"React Bits",license:"MIT"}, demo:{}, status:"stable", createdAt:"2026-08-10"
};
export default spec;
