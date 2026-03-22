import type { LyricLine } from "@/types/lyrics";

const TIMESTAMP_REGEX = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

export function parseLRC(raw: string): LyricLine[] {
  const lines = raw.split(/\r?\n/);
  const result: LyricLine[] = [];

  for (const line of lines) {
    const match = line.match(TIMESTAMP_REGEX);
    if (!match) continue;

    const [, mm, ss, cs, text] = match;
    const centiseconds = cs.length === 2 ? parseInt(cs) * 10 : parseInt(cs);
    const timeMs =
      parseInt(mm) * 60000 + parseInt(ss) * 1000 + centiseconds;
    const trimmed = text.trim();

    if (trimmed) {
      result.push({ timeMs, text: trimmed });
    }
  }

  return result.sort((a, b) => a.timeMs - b.timeMs);
}
