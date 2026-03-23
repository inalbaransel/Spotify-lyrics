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
import { InstrumentalDots } from "./InstrumentalDots";

const LYRICS_ENABLED = process.env.NEXT_PUBLIC_LYRICS_ENABLED !== "false";
// Kaç ms önce noktalar gösterilsin (sonraki satıra bu kadar kalmışsa)
const GAP_THRESHOLD_MS = 2000;

export function LyricsPlayer() {
  const { track, progressMs, isPlaying } = useSpotifyPlayer();
  const { lines, loading, notFound } = useLyrics(LYRICS_ENABLED ? track : null);
  const { displayWords, allWords, lineIndex } = useWordSync(lines, progressMs);
  const colors = useAlbumColors(track?.imageUrl ?? null);

  const currentLineText = LYRICS_ENABLED && lineIndex >= 0 ? (lines[lineIndex]?.text ?? null) : null;
  const nextLineText = LYRICS_ENABLED && lineIndex >= 0 ? (lines[lineIndex + 1]?.text ?? null) : null;
  const { translated, loading: translating } = useTranslation(currentLineText, nextLineText);

  // ── Enstrümantal gap tespiti ─────────────────────────────────────────────
  // Durum 1: şarkı başında, henüz ilk satır gelmedi
  const isBeforeFirstLyric = LYRICS_ENABLED && !loading && !notFound && lineIndex === -1;

  // Durum 2: mevcut satırın tüm kelimeleri gösterildi + sonraki satıra GAP_THRESHOLD_MS'den fazla var
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

  // Gap süresi ve geçen süre hesapla (progress göstergesi için)
  let gapElapsed = 0;
  let gapDuration: number | null = null;

  if (isBeforeFirstLyric && lines.length > 0) {
    gapDuration = lines[0].timeMs;
    gapElapsed = progressMs;
  } else if (isMidSongGap && nextLine) {
    // Gap başlangıcı: mevcut satırın son kelimesinin bittiği an ≈ satır başı + süre
    const currentLine = lines[lineIndex];
    const lineEnd = nextLine.timeMs;
    const lineDuration = lineEnd - currentLine.timeMs;
    // Kelimelerin bitmesi için geçen süre
    const wordsDoneAt = currentLine.timeMs + lineDuration * (allWords.length / allWords.length);
    gapElapsed = progressMs - wordsDoneAt;
    gapDuration = msToNextLine + gapElapsed;
  }

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

      {isInstrumental && (
        <InstrumentalDots
          elapsed={gapElapsed}
          duration={gapDuration}
          color={colors.muted}
        />
      )}

      {LYRICS_ENABLED && !loading && !notFound && lineIndex >= 0 && displayWords.length > 0 && !isMidSongGap && (
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
