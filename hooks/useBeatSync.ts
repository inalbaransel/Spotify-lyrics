"use client";

import { useEffect, useRef } from "react";
import type { Beat } from "./useAudioAnalysis";

// Binary search: find last beat whose start <= progressSec
function findBeatIndex(beats: Beat[], progressSec: number): number {
  let lo = 0, hi = beats.length - 1, result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid].start <= progressSec) { result = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return result;
}

export function useBeatSync(
  beats: Beat[],
  progressMs: number,
  onBeat: () => void
) {
  const lastFiredRef = useRef<number>(-1);
  const onBeatRef = useRef(onBeat);
  onBeatRef.current = onBeat;

  useEffect(() => {
    if (beats.length === 0) return;

    const progressSec = progressMs / 1000;
    const idx = findBeatIndex(beats, progressSec);

    if (idx < 0) return;
    if (idx === lastFiredRef.current) return;

    // Only fire if we are within 150ms of the beat start
    const beatStart = beats[idx].start;
    const diff = Math.abs(progressSec - beatStart);
    if (diff > 0.15) return;

    lastFiredRef.current = idx;
    onBeatRef.current();
  }, [beats, progressMs]);
}
