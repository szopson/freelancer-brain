"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function ParallaxRig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const idle = state.clock.elapsedTime * 0.02;
    const ty = idle + target.current.x * 0.12;
    const tx = target.current.y * 0.08;
    g.rotation.y += (ty - g.rotation.y) * 0.05;
    g.rotation.x += (tx - g.rotation.x) * 0.05;
  });

  return <group ref={group}>{children}</group>;
}
