"use client";

import { useMemo } from "react";
import type { LyricLine } from "@/types/lyrics";

export interface WordSyncResult {
  displayWords: string[];  // accumulated words shown so far in current line
  allWords: string[];      // all words in current line (for sizing)
  lineIndex: number;       // changes when line changes → triggers screen clear
  wordIndex: number;       // unique id for last added word → triggers word animation
}

export function useWordSync(
  lines: LyricLine[],
  progressMs: number
): WordSyncResult {
  return useMemo(() => {
    const empty = { displayWords: [], allWords: [], lineIndex: -1, wordIndex: -1 };
    if (!lines.length) return empty;

    // Binary search: find active line
    let lo = 0, hi = lines.length - 1, lineIndex = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lines[mid].timeMs <= progressMs) { lineIndex = mid; lo = mid + 1; }
      else hi = mid - 1;
    }

    if (lineIndex === -1) return empty;

    const line = lines[lineIndex];
    const allWords = line.text.split(/\s+/).filter(Boolean);
    if (!allWords.length) return empty;

    const lineStart = line.timeMs;
    const lineEnd =
      lineIndex + 1 < lines.length
        ? lines[lineIndex + 1].timeMs
        : lineStart + 4000;

    const duration = Math.max(lineEnd - lineStart, 500);
    const wordDuration = duration / allWords.length;
    const elapsed = progressMs - lineStart;
    const wordPos = Math.min(
      Math.floor(elapsed / wordDuration),
      allWords.length - 1
    );

    return {
      displayWords: allWords.slice(0, wordPos + 1),
      allWords,
      lineIndex,
      wordIndex: lineIndex * 10000 + wordPos,
    };
  }, [lines, progressMs]);
}
