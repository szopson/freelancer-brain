"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BrainGeometry } from "./use-brain-geometry";

const vertex = /* glsl */ `
  attribute float phase;
  attribute vec3 color;
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = color;
    vAlpha = 0.13 + 0.12 * sin(uTime * 2.0 + phase);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(vColor, max(vAlpha, 0.0));
  }
`;

export function Connections({ geometry }: { geometry: BrainGeometry }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const bufferGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(geometry.linePositions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(geometry.lineColors, 3));
    g.setAttribute("phase", new THREE.BufferAttribute(geometry.linePhases, 1));
    return g;
  }, [geometry]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <lineSegments geometry={bufferGeometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}
