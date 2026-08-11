"use client";

// deps: three, meshline, @react-three/fiber, @react-three/drei, @react-three/rapier
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, useTexture } from "@react-three/drei";
import { Physics, RigidBody, BallCollider, CuboidCollider, useRopeJoint, useSphericalJoint } from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";

const blankPixel = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

export interface LanyardProps { position?: [number,number,number]; gravity?: [number,number,number]; fov?: number; transparent?: boolean; frontImage?: string | null; backImage?: string | null; imageFit?: "cover" | "contain"; lanyardImage?: string | null; lanyardWidth?: number; cardColor?: string; lanyardColor?: string; className?: string; }

function Card({ frontImage, backImage, cardColor, cardRef }: { frontImage: string | null; backImage: string | null; cardColor: string; cardRef: React.MutableRefObject<THREE.Group | null> }) {
  const front = useTexture(frontImage || blankPixel); const back = useTexture(backImage || blankPixel);
  return <group ref={cardRef} scale={1.25}><mesh><boxGeometry args={[1.7,2.35,.08]} /><meshPhysicalMaterial color={cardColor} roughness={.36} metalness={.2} clearcoat={.7} /></mesh><mesh position={[0,0,.046]}><planeGeometry args={[1.48,2.12]} /><meshBasicMaterial map={frontImage ? front : undefined} color={frontImage ? "white" : "#e9e9ef"} /></mesh><mesh position={[0,0,-.046]} rotation={[0,Math.PI,0]}><planeGeometry args={[1.48,2.12]} /><meshBasicMaterial map={backImage ? back : undefined} color={backImage ? "white" : "#d5d5dd"} /></mesh><mesh position={[0,1.3,0]}><torusGeometry args={[.12,.035,10,24]} /><meshStandardMaterial color="#a5a5b2" metalness={.8} roughness={.2} /></mesh></group>;
}

function Band({ frontImage,backImage,lanyardWidth,cardColor,lanyardColor }: Required<Pick<LanyardProps,"frontImage"|"backImage"|"lanyardWidth"|"cardColor"|"lanyardColor">>) {
  const fixed=useRef<any>(null),joint1=useRef<any>(null),joint2=useRef<any>(null),joint3=useRef<any>(null),card=useRef<any>(null);const cardGroup=useRef<THREE.Group>(null);const [dragged,setDragged]=useState<THREE.Vector3 | false>(false);
  const curve=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]),[]);
  const line=useMemo(()=>{const geometry=new MeshLineGeometry();const material=new MeshLineMaterial({color:new THREE.Color(lanyardColor),lineWidth:lanyardWidth,sizeAttenuation:1,resolution:new THREE.Vector2(1,1)});return new THREE.Mesh(geometry as unknown as THREE.BufferGeometry,material as unknown as THREE.Material);},[lanyardColor,lanyardWidth]);
  useRopeJoint(fixed,joint1,[[0,0,0],[0,0,0],.9]);useRopeJoint(joint1,joint2,[[0,0,0],[0,0,0],.9]);useRopeJoint(joint2,joint3,[[0,0,0],[0,0,0],.9]);useSphericalJoint(joint3,card,[[0,0,0],[0,1.35,0]]);
  useFrame((state,delta)=>{(line.material as unknown as MeshLineMaterial).resolution.set(state.size.width,state.size.height);if(dragged&&card.current){const point=new THREE.Vector3(state.pointer.x,state.pointer.y,.5).unproject(state.camera);const direction=point.sub(state.camera.position).normalize();point.add(direction.multiplyScalar(state.camera.position.length()));card.current.setNextKinematicTranslation({x:point.x-dragged.x,y:point.y-dragged.y,z:point.z-dragged.z});}[fixed,joint1,joint2,joint3,card].forEach(ref=>ref.current?.wakeUp());if(!fixed.current||!joint1.current||!joint2.current||!joint3.current||!card.current)return;curve.points[0].copy(card.current.translation());curve.points[1].copy(joint3.current.translation());curve.points[2].copy(joint2.current.translation());curve.points[3].copy(fixed.current.translation());(line.geometry as unknown as MeshLineGeometry).setPoints(curve.getPoints(32));const velocity=card.current.angvel(),rotation=card.current.rotation();card.current.setAngvel({x:velocity.x,y:velocity.y-rotation.y*delta*12,z:velocity.z});});
  const start=(event:any)=>{event.stopPropagation();event.target.setPointerCapture(event.pointerId);const position=card.current.translation();setDragged(new THREE.Vector3(event.point.x-position.x,event.point.y-position.y,event.point.z-position.z));};const end=(event:any)=>{event.target.releasePointerCapture?.(event.pointerId);setDragged(false);};
  return <><group position={[0,4,0]}><RigidBody ref={fixed} type="fixed" colliders={false}/><RigidBody ref={joint1} position={[.25,0,0]} colliders={false} angularDamping={4} linearDamping={4}><BallCollider args={[.1]}/></RigidBody><RigidBody ref={joint2} position={[.7,0,0]} colliders={false} angularDamping={4} linearDamping={4}><BallCollider args={[.1]}/></RigidBody><RigidBody ref={joint3} position={[1.15,0,0]} colliders={false} angularDamping={4} linearDamping={4}><BallCollider args={[.1]}/></RigidBody><RigidBody ref={card} position={[1.55,0,0]} colliders={false} type={dragged?"kinematicPosition":"dynamic"} angularDamping={4} linearDamping={4}><CuboidCollider args={[.9,1.25,.1]}/><group position={[0,-1.28,0]} onPointerDown={start} onPointerUp={end}><Card frontImage={frontImage} backImage={backImage} cardColor={cardColor} cardRef={cardGroup}/></group></RigidBody></group><primitive object={line}/></>;
}

export function Lanyard({ position=[0,0,20],gravity=[0,-40,0],fov=20,transparent=true,frontImage=null,backImage=null,lanyardWidth=1,cardColor="#16161d",lanyardColor="#dad8ff",className="" }: LanyardProps) {
  return <div role="img" aria-label="Interactive physics lanyard and ID card" className={`relative h-full min-h-[420px] w-full overflow-hidden ${className}`.trim()}><Canvas camera={{position,fov}} dpr={[1,2]} gl={{alpha:transparent}} onCreated={({gl})=>gl.setClearColor(new THREE.Color("#000000"),transparent?0:1)}><ambientLight intensity={Math.PI}/><Physics gravity={gravity}><Band frontImage={frontImage} backImage={backImage} lanyardWidth={lanyardWidth} cardColor={cardColor} lanyardColor={lanyardColor}/></Physics><Environment blur={.75}><Lightformer intensity={3} color="white" position={[0,-1,5]} rotation={[0,0,Math.PI/3]} scale={[100,.1,1]}/><Lightformer intensity={5} color="white" position={[-10,0,14]} rotation={[0,Math.PI/2,Math.PI/3]} scale={[100,10,1]}/></Environment></Canvas></div>;
}
