"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Scena three ładuje się wyłącznie tu (dynamic, ssr:false) — nie wycieka
// do bundli /app. Poster jest zawsze pod spodem: LCP + zero CLS.
const BrainScene = dynamic(
  () => import("./brain-scene/scene").then((m) => m.BrainScene),
  { ssr: false },
);

type Tier = "pending" | "webgl" | "webgl-low" | "video" | "poster";

function detectTier(): Tier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "poster";
  }
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  if (coarse || window.innerWidth < 768) return "video";
  const mem = (navigator as { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined && mem <= 4) return "webgl-low";
  return "webgl";
}

export function Hero3D() {
  const [tier, setTier] = useState<Tier>("pending");
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    setTier(detectTier());
  }, []);

  const useWebgl = tier === "webgl" || tier === "webgl-low";

  return (
    <div className="absolute inset-0">
      {/* Poster — zawsze obecny (LCP, fallback WebGL) */}
      <Image
        src="/media/hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover transition-opacity duration-1000 ${
          sceneReady || tier === "video" ? "opacity-0" : "opacity-60"
        }`}
      />

      {tier === "video" && (
        <video
          className="absolute inset-0 size-full object-cover opacity-70"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero.webp"
        >
          <source src="/media/ambient-loop.mp4" type="video/mp4" />
        </video>
      )}

      {useWebgl && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            sceneReady ? "opacity-100" : "opacity-0"
          }`}
        >
          <BrainScene
            lowTier={tier === "webgl-low"}
            onReady={() => setSceneReady(true)}
            onFail={() => setTier("poster")}
          />
        </div>
      )}
    </div>
  );
}
