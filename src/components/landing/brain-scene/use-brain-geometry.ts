import { useMemo } from "react";

// Proceduralna chmura punktów w kształcie mózgu — bez modeli 3D z zewnątrz.
// Fibonacci-sfera → elipsoida → szczelina między półkulami → zmarszczki
// (fbm noise) → 85% powierzchnia + 15% wnętrze.

export interface BrainGeometry {
  positions: Float32Array; // xyz * N
  colors: Float32Array; // rgb * N
  phases: Float32Array; // N
  linePositions: Float32Array; // xyz * 2 * M
  lineColors: Float32Array; // rgb * 2 * M
  linePhases: Float32Array; // 2 * M (phase per vertex)
  count: number;
}

// Deterministyczny PRNG — scena wygląda tak samo przy każdym montażu.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Value noise 3D + fbm — wystarczający na zmarszczki kory.
function makeNoise(rand: () => number) {
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const grad = (h: number, x: number, y: number, z: number) => {
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const noise3 = (x: number, y: number, z: number): number => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = perm[X] + Y;
    const AA = perm[A] + Z;
    const AB = perm[A + 1] + Z;
    const B = perm[X + 1] + Y;
    const BA = perm[B] + Z;
    const BB = perm[B + 1] + Z;
    return lerp(
      lerp(
        lerp(grad(perm[AA] & 15, x, y, z), grad(perm[BA] & 15, x - 1, y, z), u),
        lerp(grad(perm[AB] & 15, x, y - 1, z), grad(perm[BB] & 15, x - 1, y - 1, z), u),
        v,
      ),
      lerp(
        lerp(grad(perm[AA + 1] & 15, x, y, z - 1), grad(perm[BA + 1] & 15, x - 1, y, z - 1), u),
        lerp(grad(perm[AB + 1] & 15, x, y - 1, z - 1), grad(perm[BB + 1] & 15, x - 1, y - 1, z - 1), u),
        v,
      ),
      w,
    );
  };

  return (x: number, y: number, z: number): number => {
    let sum = 0;
    let amp = 1;
    let freq = 1;
    for (let o = 0; o < 3; o++) {
      sum += amp * noise3(x * freq, y * freq, z * freq);
      amp *= 0.5;
      freq *= 2.1;
    }
    return sum;
  };
}

// amber «#ffc98a» ↔ cyan «#8be8e0» (paleta hero.webp)
const AMBER = [1.0, 0.79, 0.54];
const CYAN = [0.55, 0.91, 0.88];

export function buildBrainGeometry(count: number): BrainGeometry {
  const rand = mulberry32(20260611);
  const fbm = makeNoise(rand);

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const phases = new Float32Array(count);

  const golden = Math.PI * (3 - Math.sqrt(5));
  const surfaceCount = Math.floor(count * 0.85);

  for (let i = 0; i < count; i++) {
    let x: number, y: number, z: number;
    if (i < surfaceCount) {
      // Fibonacci-sfera (równomierna powierzchnia)
      const t = (i + 0.5) / surfaceCount;
      const y0 = 1 - 2 * t;
      const r0 = Math.sqrt(Math.max(0, 1 - y0 * y0));
      const theta = golden * i;
      x = Math.cos(theta) * r0;
      y = y0;
      z = Math.sin(theta) * r0;
    } else {
      // Wewnętrzna powłoka — głębia wolumetryczna
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const r0 = Math.sqrt(Math.max(0, 1 - u * u));
      const shell = 0.82 + rand() * 0.13;
      x = Math.cos(a) * r0 * shell;
      y = u * shell;
      z = Math.sin(a) * r0 * shell;
    }

    // Zmarszczki kory (radialnie)
    const n = fbm(x * 3.5, y * 3.5, z * 3.5);
    const wrinkle = 1 + 0.1 * n;
    x *= wrinkle;
    y *= wrinkle;
    z *= wrinkle;

    // Elipsoida mózgu + lekkie spłaszczenie dołu
    x *= 1.35;
    y *= 1.0 * (y < 0 ? 0.88 : 1);
    z *= 0.95;

    // Szczelina między półkulami (oś Z = lewa/prawa po obrocie sceny;
    // używamy X jako osi strzałkowej przed obrotem rigu)
    z += Math.sign(z) * 0.07;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Kolor amber↔cyan z drugiego kanału szumu
    const mix = Math.min(1, Math.max(0, 0.5 + 0.7 * fbm(x * 1.8 + 7.3, y * 1.8, z * 1.8)));
    colors[i * 3] = AMBER[0] + (CYAN[0] - AMBER[0]) * mix;
    colors[i * 3 + 1] = AMBER[1] + (CYAN[1] - AMBER[1]) * mix;
    colors[i * 3 + 2] = AMBER[2] + (CYAN[2] - AMBER[2]) * mix;

    phases[i] = rand() * Math.PI * 2;
  }

  // kNN k=2 z limitem dystansu → segmenty linii (brute force, raz)
  const pairs: number[] = [];
  const maxDist = 0.42;
  const maxDistSq = maxDist * maxDist;
  for (let i = 0; i < count; i++) {
    let best1 = -1;
    let best2 = -1;
    let d1 = Infinity;
    let d2 = Infinity;
    const xi = positions[i * 3];
    const yi = positions[i * 3 + 1];
    const zi = positions[i * 3 + 2];
    for (let j = i + 1; j < count; j++) {
      const dx = positions[j * 3] - xi;
      if (Math.abs(dx) > maxDist) continue;
      const dy = positions[j * 3 + 1] - yi;
      const dz = positions[j * 3 + 2] - zi;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < d1) {
        d2 = d1;
        best2 = best1;
        d1 = d;
        best1 = j;
      } else if (d < d2) {
        d2 = d;
        best2 = j;
      }
    }
    if (best1 >= 0 && d1 < maxDistSq) pairs.push(i, best1);
    if (best2 >= 0 && d2 < maxDistSq) pairs.push(i, best2);
  }

  const segCount = pairs.length / 2;
  const linePositions = new Float32Array(segCount * 6);
  const lineColors = new Float32Array(segCount * 6);
  const linePhases = new Float32Array(segCount * 2);
  for (let s = 0; s < segCount; s++) {
    const a = pairs[s * 2];
    const b = pairs[s * 2 + 1];
    for (let k = 0; k < 3; k++) {
      linePositions[s * 6 + k] = positions[a * 3 + k];
      linePositions[s * 6 + 3 + k] = positions[b * 3 + k];
      lineColors[s * 6 + k] = colors[a * 3 + k];
      lineColors[s * 6 + 3 + k] = colors[b * 3 + k];
    }
    linePhases[s * 2] = phases[a];
    linePhases[s * 2 + 1] = phases[b];
  }

  return { positions, colors, phases, linePositions, lineColors, linePhases, count };
}

export function useBrainGeometry(count: number): BrainGeometry {
  return useMemo(() => buildBrainGeometry(count), [count]);
}
