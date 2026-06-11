"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSpriteAtlas } from "./sprite-atlas";
import { pushFlash, type FlashStore } from "./flash-store";
import type { BrainGeometry } from "./use-brain-geometry";

const COUNT = 14;

interface Flight {
  start: THREE.Vector3;
  control: THREE.Vector3;
  target: THREE.Vector3;
  t: number; // -wait…0 = czekanie, 0…1 = lot
  speed: number;
  roll: number;
  rollSpeed: number;
  scale: number;
  glyph: number; // 0-3 kolumna atlasu
}

function randomFlight(geometry: BrainGeometry, initial: boolean): Flight {
  // Spawn z lewej/dołu (jak chaos na grafice hero), cel = losowy neuron
  const angle = Math.PI * (0.65 + Math.random() * 0.9); // lewa półsfera
  const radius = 5 + Math.random() * 2;
  const start = new THREE.Vector3(
    Math.cos(angle) * radius,
    (Math.random() - 0.65) * 4,
    Math.sin(angle) * radius * 0.5,
  );
  const ti = Math.floor(Math.random() * geometry.count) * 3;
  const target = new THREE.Vector3(
    geometry.positions[ti],
    geometry.positions[ti + 1],
    geometry.positions[ti + 2],
  );
  const mid = start.clone().lerp(target, 0.5);
  const control = mid.add(
    new THREE.Vector3(
      (Math.random() - 0.5) * 2.5,
      1 + Math.random() * 1.5,
      (Math.random() - 0.5) * 2,
    ),
  );
  return {
    start,
    control,
    target,
    t: -(Math.random() * (initial ? 6 : 2.5) + 0.3),
    speed: 1 / (2.5 + Math.random() * 1.5),
    roll: Math.random() * Math.PI * 2,
    rollSpeed: (Math.random() - 0.5) * 1.2,
    scale: 0.16 + Math.random() * 0.1,
    glyph: Math.floor(Math.random() * 4),
  };
}

const dummy = new THREE.Object3D();
const bezier = new THREE.Vector3();

function quadBezier(
  out: THREE.Vector3,
  a: THREE.Vector3,
  c: THREE.Vector3,
  b: THREE.Vector3,
  t: number,
) {
  const it = 1 - t;
  out.set(
    it * it * a.x + 2 * it * t * c.x + t * t * b.x,
    it * it * a.y + 2 * it * t * c.y + t * t * b.y,
    it * it * a.z + 2 * it * t * c.z + t * t * b.z,
  );
}

export function DocSprites({
  geometry,
  flashes,
}: {
  geometry: BrainGeometry;
  flashes: FlashStore;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const texture = useMemo(() => createSpriteAtlas(), []);
  const flights = useMemo(
    () => Array.from({ length: COUNT }, () => randomFlight(geometry, true)),
    [geometry],
  );

  // Atlas: każda instancja dostaje offset UV przez atrybut
  const glyphOffsets = useMemo(() => {
    const arr = new Float32Array(COUNT);
    flights.forEach((f, i) => (arr[i] = f.glyph));
    return arr;
  }, [flights]);

  const planeGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1);
    g.setAttribute(
      "glyph",
      new THREE.InstancedBufferAttribute(glyphOffsets, 1),
    );
    return g;
  }, [glyphOffsets]);

  const material = useMemo(() => {
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uMap: { value: texture } },
      vertexShader: /* glsl */ `
        attribute float glyph;
        varying vec2 vUv;
        void main() {
          vUv = vec2((uv.x + glyph) * 0.25, uv.y);
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D uMap;
        varying vec2 vUv;
        void main() {
          vec4 c = texture2D(uMap, vUv);
          if (c.a < 0.02) discard;
          gl_FragColor = vec4(c.rgb, c.a * 0.85);
        }
      `,
    });
    return m;
  }, [texture]);

  useFrame((state, dt) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const clampedDt = Math.min(dt, 0.05);

    for (let i = 0; i < COUNT; i++) {
      const f = flights[i];
      f.t += clampedDt * (f.t < 0 ? 1 : f.speed);

      if (f.t >= 1) {
        pushFlash(flashes, f.target.x, f.target.y, f.target.z);
        flights[i] = randomFlight(geometry, false);
        dummy.position.copy(flights[i].start);
        dummy.scale.setScalar(0.0001);
      } else if (f.t < 0) {
        // czekanie poza ekranem
        dummy.position.copy(f.start);
        dummy.scale.setScalar(0.0001);
      } else {
        const ease = f.t * f.t * (3 - 2 * f.t); // smoothstep
        quadBezier(bezier, f.start, f.control, f.target, ease);
        dummy.position.copy(bezier);
        // znikanie tuż przed celem
        const shrink = f.t > 0.88 ? 1 - (f.t - 0.88) / 0.12 : 1;
        dummy.scale.setScalar(f.scale * shrink);
        f.roll += f.rollSpeed * clampedDt;
        dummy.quaternion.copy(state.camera.quaternion);
        dummy.rotateZ(f.roll);
      }
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[planeGeo, material, COUNT]}
      frustumCulled={false}
    />
  );
}
