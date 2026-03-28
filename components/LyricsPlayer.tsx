"use client";

import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useLyrics } from "@/hooks/useLyrics";
import { useWordSync } from "@/hooks/useWordSync";
import { useAlbumColors } from "@/hooks/useAlbumColors";
import { useTranslation } from "@/hooks/useTranslation";
import { useAudioAnalysis } from "@/hooks/useAudioAnalysis";
import { useTheme } from "@/contexts/ThemeContext";
import { LyricLine } from "./LyricLine";
import { NowPlayingBar } from "./NowPlayingBar";
import { TranslationPanel } from "./TranslationPanel";
import { IdleScreen } from "./IdleScreen";
import { InstrumentalDots } from "./InstrumentalDots";
import { AnimeBackground } from "./AnimeBackground";
import { ThemeMenu } from "./ThemeMenu";

const LYRICS_ENABLED = process.env.NEXT_PUBLIC_LYRICS_ENABLED !== "false";
const GAP_THRESHOLD_MS = 2000;

export function LyricsPlayer() {
  const { track, progressMs, isPlaying } = useSpotifyPlayer();
  const { lines, loading, notFound } = useLyrics(LYRICS_ENABLED ? track : null);
  const { displayWords, allWords, lineIndex } = useWordSync(lines, progressMs);
  const colors = useAlbumColors(track?.imageUrl ?? null);
  const { theme } = useTheme();

  const currentLineText = LYRICS_ENABLED && lineIndex >= 0 ? (lines[lineIndex]?.text ?? null) : null;
  const nextLineText = LYRICS_ENABLED && lineIndex >= 0 ? (lines[lineIndex + 1]?.text ?? null) : null;
  const { translated, loading: translating } = useTranslation(currentLineText, nextLineText);

  // Beat analysis (only fetch in anime theme)
  const beats = useAudioAnalysis(theme === "anime" ? (track?.id ?? null) : null);

  // ── Enstrümantal gap tespiti ─────────────────────────────────────────────
  const isBeforeFirstLyric = LYRICS_ENABLED && !loading && !notFound && lineIndex === -1;

  const nextLine = lineIndex >= 0 ? lines[lineIndex + 1] : null;
  const allWordsShown = displayWords.length === allWords.length && allWords.length > 0;
  const msToNextLine = nextLine ? nextLine.timeMs - progressMs : null;
  const isMidSongGap =
    LYRICS_ENABLED &&
    !loading &&
    !notFound &&
    lineIndex >= 0 &&
    allWordsShown &&
    msToNextLine !== null &&
    msToNextLine > GAP_THRESHOLD_MS;

  const isInstrumental = isBeforeFirstLyric || isMidSongGap;

  let gapElapsed = 0;
  let gapDuration: number | null = null;

  if (isBeforeFirstLyric && lines.length > 0) {
    gapDuration = lines[0].timeMs;
    gapElapsed = progressMs;
  } else if (isMidSongGap && nextLine) {
    const currentLine = lines[lineIndex];
    const lineEnd = nextLine.timeMs;
    const lineDuration = lineEnd - currentLine.timeMs;
    const wordsDoneAt = currentLine.timeMs + lineDuration * (allWords.length / allWords.length);
    gapElapsed = progressMs - wordsDoneAt;
    gapDuration = msToNextLine + gapElapsed;
  }

  if (!track || !isPlaying) {
    return (
      <>
        <IdleScreen />
        <ThemeMenu />
      </>
    );
  }

  const isAnime = theme === "anime";

  const textColor = isAnime ? "rgba(255,255,255,0.95)" : colors.text;
  const mutedColor = isAnime ? "rgba(255,255,255,0.55)" : colors.muted;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundColor: isAnime ? "#06060f" : colors.bg,
        transition: "background-color 1.5s ease",
      }}
    >
      {/* Anime theme: Live2D background */}
      {isAnime && (
        <AnimeBackground beats={beats} progressMs={progressMs} />
      )}

      {/* Content layer */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ zIndex: 10 }}
      >
        {LYRICS_ENABLED && loading && (
          <p
            className="text-2xl"
            style={{ color: mutedColor, fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            ...
          </p>
        )}

        {LYRICS_ENABLED && !loading && notFound && (
          <p
            className="text-2xl text-center px-8"
            style={{ color: mutedColor, fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            şarkı sözleri bulunamadı.
          </p>
        )}

        {isInstrumental && (
          <InstrumentalDots
            elapsed={gapElapsed}
            duration={gapDuration}
            color={mutedColor}
          />
        )}

        {LYRICS_ENABLED && !loading && !notFound && lineIndex >= 0 && displayWords.length > 0 && !isMidSongGap && (
          isAnime ? (
            <div
              className="px-8 py-4 rounded-2xl"
              style={{
                background: "rgba(0,0,0,0.35)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <LyricLine
                key={lineIndex}
                displayWords={displayWords}
                allWords={allWords}
                lineIndex={lineIndex}
                textColor={textColor}
              />
            </div>
          ) : (
            <LyricLine
              key={lineIndex}
              displayWords={displayWords}
              allWords={allWords}
              lineIndex={lineIndex}
              textColor={textColor}
            />
          )
        )}
      </div>

      <NowPlayingBar
        track={track}
        progressMs={progressMs}
        textColor={textColor}
        mutedColor={mutedColor}
      />

      <TranslationPanel
        translated={translated}
        loading={translating}
        lineIndex={lineIndex}
        mutedColor={mutedColor}
      />

      <ThemeMenu />
    </div>
  );
}
