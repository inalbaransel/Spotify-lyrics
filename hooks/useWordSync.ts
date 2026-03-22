"use client";

import { useMemo } from "react";
import type { LyricLine } from "@/types/lyrics";

interface WordTiming {
  timeMs: number;
  word: string;
}

function computeWordTimings(lines: LyricLine[]): WordTiming[] {
  const result: WordTiming[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineStart = lines[i].timeMs;
    const lineEnd =
      i + 1 < lines.length ? lines[i + 1].timeMs : lineStart + 4000;
    const words = lines[i].text.split(/\s+/).filter(Boolean);
    if (!words.length) continue;

    const duration = lineEnd - lineStart;
    const wordDuration = duration / words.length;

    words.forEach((word, j) => {
      result.push({ timeMs: lineStart + j * wordDuration, word });
    });
  }

  return result;
}

export function useWordSync(
  lines: LyricLine[],
  progressMs: number
): { word: string | null; wordIndex: number } {
  const wordTimings = useMemo(() => computeWordTimings(lines), [lines]);

  return useMemo(() => {
    if (!wordTimings.length) return { word: null, wordIndex: -1 };

    let lo = 0,
      hi = wordTimings.length - 1,
      result = -1;

    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (wordTimings[mid].timeMs <= progressMs) {
        result = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    return result >= 0
      ? { word: wordTimings[result].word, wordIndex: result }
      : { word: null, wordIndex: -1 };
  }, [wordTimings, progressMs]);
}
