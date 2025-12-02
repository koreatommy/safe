"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Mesh, MeshStandardMaterial } from "three";
import { OrbitControls, Environment } from "@react-three/drei";

function Orb() {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock, mouse }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      
      // 마우스 반응
      meshRef.current.rotation.y += (mouse.x * 0.1 - meshRef.current.rotation.y) * 0.1;
      meshRef.current.rotation.x += (-mouse.y * 0.1 - meshRef.current.rotation.x) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        ref={materialRef}
        metalness={0.9}
        roughness={0.1}
        color="#b7d7ff"
        emissive="#4a90e2"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export function ReflectiveOrb() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none hidden md:block">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c4f2ff" />
        <Orb />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}

