import type { MotionSpec } from "@/lib/spec";

export const spec: MotionSpec = {
  slug: "strands", category: "backgrounds", name: "Strands", description: "Luminous, woven color strands flow across a transparent WebGL canvas.", tags: ["background", "webgl", "ogl", "strands", "glow"], trigger: "loop",
  params: [
    { key:"count",label:"Strand count",control:"slider",min:1,max:12,step:1,default:3 }, { key:"speed",label:"Speed",control:"slider",min:0,max:2,step:.1,default:.5 }, { key:"amplitude",label:"Amplitude",control:"slider",min:0,max:3,step:.1,default:1 }, { key:"waviness",label:"Waviness",control:"slider",min:.2,max:3,step:.1,default:1 }, { key:"thickness",label:"Thickness",control:"slider",min:.1,max:2,step:.1,default:.7 }, { key:"glow",label:"Glow",control:"slider",min:0,max:5,step:.1,default:2.6 }, { key:"intensity",label:"Intensity",control:"slider",min:0,max:1,step:.05,default:.6 }, { key:"saturation",label:"Saturation",control:"slider",min:0,max:2,step:.1,default:1.5 }, { key:"scale",label:"Scale",control:"slider",min:.5,max:3,step:.1,default:1.5 }, { key:"glass",label:"Glass mode",control:"toggle",default:false }, { key:"refraction",label:"Refraction",control:"slider",min:0,max:2,step:.1,default:1 }, { key:"dispersion",label:"Dispersion",control:"slider",min:0,max:2,step:.1,default:1 }
  ], dependencies:["ogl"], variants:["react-ts-tw"], a11y:{reducedMotion:"Respects reduced-motion preferences by rendering a static strands scene.",notes:["Decorative WebGL canvas is labelled for assistive technology."]}, install:{registryPath:"r/backgrounds/strands.json"}, credits:{inspiredBy:"React Bits",license:"MIT"}, demo:{}, status:"stable", createdAt:"2026-08-10"
};
export default spec;
