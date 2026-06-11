"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BrainGeometry } from "./use-brain-geometry";
import { MAX_FLASHES, type FlashStore } from "./flash-store";

const vertex = /* glsl */ `
  attribute float phase;
  attribute vec3 color;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec4 uFlashes[${MAX_FLASHES}];
  varying vec3 vColor;
  varying float vBrightness;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = 0.7 + 0.3 * sin(uTime * 1.4 + phase);

    // Błysk absorpcji — wzmocnienie w promieniu wokół punktu wchłonięcia
    float flash = 0.0;
    for (int i = 0; i < ${MAX_FLASHES}; i++) {
      vec4 f = uFlashes[i];
      if (f.w < 1.0) {
        float d = distance(position, f.xyz);
        float fall = smoothstep(0.4, 0.0, d);
        flash += fall * (1.0 - f.w) * 2.2;
      }
    }

    vBrightness = pulse + flash;
    vColor = color;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (4.2 + flash * 2.2) * uPixelRatio * (4.6 / -mv.z);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vBrightness;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.08, d);
    gl_FragColor = vec4(vColor * vBrightness, alpha * 0.9);
  }
`;

export function NeuronPoints({
  geometry,
  flashes,
}: {
  geometry: BrainGeometry;
  flashes: FlashStore;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const bufferGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(geometry.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(geometry.colors, 3));
    g.setAttribute("phase", new THREE.BufferAttribute(geometry.phases, 1));
    return g;
  }, [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uFlashes: {
        value: Array.from({ length: MAX_FLASHES }, () => new THREE.Vector4(0, 0, 0, 1)),
      },
    }),
    [],
  );

  useFrame((state) => {
    const mat = matRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    const vecs = mat.uniforms.uFlashes.value as THREE.Vector4[];
    for (let i = 0; i < MAX_FLASHES; i++) {
      vecs[i].set(
        flashes.data[i * 4],
        flashes.data[i * 4 + 1],
        flashes.data[i * 4 + 2],
        flashes.data[i * 4 + 3],
      );
    }
  });

  return (
    <points geometry={bufferGeometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
