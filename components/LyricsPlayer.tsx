"use client";

import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useLyrics } from "@/hooks/useLyrics";
import { useWordSync } from "@/hooks/useWordSync";
import { useAlbumColors } from "@/hooks/useAlbumColors";
import { useTranslation } from "@/hooks/useTranslation";
import { LyricLine } from "./LyricLine";
import { NowPlayingBar } from "./NowPlayingBar";
import { TranslationPanel } from "./TranslationPanel";
import { IdleScreen } from "./IdleScreen";

const LYRICS_ENABLED = process.env.NEXT_PUBLIC_LYRICS_ENABLED !== "false";

export function LyricsPlayer() {
  const { track, progressMs, isPlaying } = useSpotifyPlayer();
  const { lines, loading, notFound } = useLyrics(LYRICS_ENABLED ? track : null);
  const { displayWords, allWords, lineIndex } = useWordSync(lines, progressMs);
  const colors = useAlbumColors(track?.imageUrl ?? null);

  const currentLineText = LYRICS_ENABLED && lineIndex >= 0 ? (lines[lineIndex]?.text ?? null) : null;
  const nextLineText = LYRICS_ENABLED && lineIndex >= 0 ? (lines[lineIndex + 1]?.text ?? null) : null;
  const { translated, loading: translating } = useTranslation(currentLineText, nextLineText);

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
      {LYRICS_ENABLED && loading && (
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

      {LYRICS_ENABLED && !loading && notFound && (
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

      {LYRICS_ENABLED && !loading && !notFound && lineIndex === -1 && (
        <div
          className="w-3 h-3 rounded-full opacity-30"
          style={{ backgroundColor: colors.muted }}
        />
      )}

      {LYRICS_ENABLED && !loading && !notFound && lineIndex >= 0 && displayWords.length > 0 && (
        <LyricLine
          key={lineIndex}
          displayWords={displayWords}
          allWords={allWords}
          lineIndex={lineIndex}
          textColor={colors.text}
        />
      )}

      <NowPlayingBar
        track={track}
        progressMs={progressMs}
        textColor={colors.text}
        mutedColor={colors.muted}
      />

      <TranslationPanel
        translated={translated}
        loading={translating}
        lineIndex={lineIndex}
        mutedColor={colors.muted}
      />
    </div>
  );
}
