"use client";

import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useLyrics } from "@/hooks/useLyrics";
import { useLyricsSync } from "@/hooks/useLyricsSync";
import { LyricLine } from "./LyricLine";
import { SongInfo } from "./SongInfo";
import { IdleScreen } from "./IdleScreen";

export function LyricsPlayer() {
  const { track, progressMs, isPlaying } = useSpotifyPlayer();
  const { lines, loading, notFound } = useLyrics(track);
  const activeIndex = useLyricsSync(lines, progressMs);

  if (!track || !isPlaying) {
    return <IdleScreen />;
  }

  const activeLine = activeIndex >= 0 ? lines[activeIndex] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8D5B0]">
      {loading && (
        <p
          className="text-2xl text-[#9B7D5A]"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          ...
        </p>
      )}

      {!loading && notFound && (
        <p
          className="text-2xl text-[#9B7D5A] text-center px-8"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          şarkı sözleri bulunamadı.
        </p>
      )}

      {!loading && !notFound && activeIndex === -1 && (
        <div className="w-2 h-2 rounded-full bg-[#9B7D5A] opacity-50" />
      )}

      {!loading && !notFound && activeLine && (
        <LyricLine key={activeIndex} text={activeLine.text} animationKey={activeIndex} />
      )}

      <SongInfo track={track} />
    </div>
  );
}
