// components/loading-screen.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHidden(true), 2400);
    return () => clearTimeout(t);
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background animate-splash-out"
    >
      <div className="flex flex-col items-center gap-10 px-6 text-center sm:gap-12">
        <Image
          src="/home/flower2.png"
          alt=""
          width={480}
          height={480}
          priority
          className="w-64 sm:w-80 md:w-96 animate-bloom"
        />
        <h1 className="font-script text-5xl text-foreground sm:text-6xl animate-script-in">
          Kanagjegji Blerinës
        </h1>
        <p className="font-serif text-sm uppercase tracking-[0.4em] text-muted-foreground animate-fade-in [animation-delay:600ms]">
          6 qershor 2026
        </p>
      </div>
    </div>
  );
}
