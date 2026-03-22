"use client";

import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useLyrics } from "@/hooks/useLyrics";
import { useWordSync } from "@/hooks/useWordSync";
import { useAlbumColors } from "@/hooks/useAlbumColors";
import { LyricLine } from "./LyricLine";
import { SongInfo } from "./SongInfo";
import { IdleScreen } from "./IdleScreen";

export function LyricsPlayer() {
  const { track, progressMs, isPlaying } = useSpotifyPlayer();
  const { lines, loading, notFound } = useLyrics(track);
  const { word, wordIndex } = useWordSync(lines, progressMs);
  const colors = useAlbumColors(track?.imageUrl ?? null);

  if (!track || !isPlaying) {
    return <IdleScreen />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: colors.bg,
        transition: "background-color 1.5s ease",
      }}
    >
      {loading && (
        <p
          className="text-2xl"
          style={{
            color: colors.muted,
            fontFamily: "var(--font-playfair), Georgia, serif",
          }}
        >
          ...
        </p>
      )}

      {!loading && notFound && (
        <p
          className="text-2xl text-center px-8"
          style={{
            color: colors.muted,
            fontFamily: "var(--font-playfair), Georgia, serif",
          }}
        >
          şarkı sözleri bulunamadı.
        </p>
      )}

      {!loading && !notFound && wordIndex === -1 && (
        <div
          className="w-3 h-3 rounded-full opacity-40"
          style={{ backgroundColor: colors.muted }}
        />
      )}

      {!loading && !notFound && word && (
        <LyricLine
          key={wordIndex}
          word={word}
          wordIndex={wordIndex}
          textColor={colors.text}
        />
      )}

      <SongInfo track={track} textColor={colors.muted} />
    </div>
  );
}
