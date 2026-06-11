"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useBrainGeometry } from "./use-brain-geometry";
import { NeuronPoints } from "./neuron-points";
import { Connections } from "./connections";
import { DocSprites } from "./doc-sprites";
import { ParallaxRig } from "./parallax-rig";
import { ageFlashes, createFlashStore } from "./flash-store";

function FlashAger({ flashes }: { flashes: ReturnType<typeof createFlashStore> }) {
  useFrame((_, dt) => ageFlashes(flashes, Math.min(dt, 0.05)));
  return null;
}

export function BrainScene({
  lowTier = false,
  onReady,
  onFail,
}: {
  lowTier?: boolean;
  onReady?: () => void;
  onFail?: () => void;
}) {
  const geometry = useBrainGeometry(lowTier ? 1500 : 3000);
  const flashes = useMemo(() => createFlashStore(), []);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);

  // Pauza: poza viewportem / ukryta karta = zero pracy GPU.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => setInView(entries[0].isIntersecting),
      { threshold: 0.05 },
    );
    obs.observe(el);
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      obs.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const active = inView && pageVisible;

  return (
    <div ref={wrapRef} className="size-full">
      <Canvas
        dpr={lowTier ? [1, 1.25] : [1, 1.75]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: true,
        }}
        camera={{ fov: 40, position: [0.6, 0.15, 5.2] }}
        frameloop={active ? "always" : "never"}
        onCreated={() => onReady?.()}
        fallback={null}
        onError={() => onFail?.()}
      >
        <FlashAger flashes={flashes} />
        <ParallaxRig>
          {/* mózg profilem w prawo, środek-prawa strona — kompozycja jak hero.webp */}
          <group position={[2.1, -0.1, 0]} rotation={[0.05, -0.5, 0]}>
            <NeuronPoints geometry={geometry} flashes={flashes} />
            <Connections geometry={geometry} />
            <DocSprites geometry={geometry} flashes={flashes} />
          </group>
        </ParallaxRig>
      </Canvas>
    </div>
  );
}
