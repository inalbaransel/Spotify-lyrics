"use client";

import dynamic from "next/dynamic";
import type { Beat } from "@/hooks/useAudioAnalysis";

const Live2DCanvas = dynamic(() => import("./Live2DCanvas"), { ssr: false });

interface Props {
  beats: Beat[];
  progressMs: number;
}

export function AnimeBackground({ beats, progressMs }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      <Live2DCanvas beats={beats} progressMs={progressMs} />

      {/* Top gradient: fade to dark */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "35%",
          background: "linear-gradient(to bottom, rgba(5,5,15,0.85) 0%, transparent 100%)",
          zIndex: 2,
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: "30%",
          background: "linear-gradient(to top, rgba(5,5,15,0.9) 0%, transparent 100%)",
          zIndex: 2,
        }}
      />
    </div>
  );
}
