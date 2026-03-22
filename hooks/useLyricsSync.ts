"use client";

import { useMemo } from "react";
import type { LyricLine } from "@/types/lyrics";

export function useLyricsSync(lines: LyricLine[], progressMs: number): number {
  return useMemo(() => {
    if (lines.length === 0) return -1;

    let lo = 0;
    let hi = lines.length - 1;
    let result = -1;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lines[mid].timeMs <= progressMs) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return result;
  }, [lines, progressMs]);
}
