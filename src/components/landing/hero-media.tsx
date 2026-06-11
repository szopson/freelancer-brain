"use client";

import { useState } from "react";
import Image from "next/image";
import { Brain } from "lucide-react";

// Hero: ambientowy loop wideo (Higgsfield) z obrazem jako posterem
// i gradientowym fallbackiem, gdy plików nie ma w public/media/.
export function HeroMedia() {
  const [imageOk, setImageOk] = useState(true);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border shadow-lg">
      {imageOk ? (
        <>
          <Image
            src="/media/hero.webp"
            alt="FreelancerBrain — wizualizacja drugiego mózgu"
            fill
            priority
            className="object-cover"
            onError={() => setImageOk(false)}
          />
          <video
            className="absolute inset-0 size-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster="/media/hero.webp"
          >
            <source src="/media/ambient-loop.mp4" type="video/mp4" />
          </video>
        </>
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/5">
          <Brain className="size-24 text-primary/40" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 to-transparent" />
    </div>
  );
}
