"use client";

import type { SpotifyTrack } from "@/types/spotify";

interface NowPlayingBarProps {
  track: SpotifyTrack;
  progressMs: number;
  textColor: string;
  mutedColor: string;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

export function NowPlayingBar({
  track,
  progressMs,
  textColor,
  mutedColor,
}: NowPlayingBarProps) {
  const pct =
    track.durationMs > 0
      ? Math.min((progressMs / track.durationMs) * 100, 100)
      : 0;

  return (
    <div
      className="fixed bottom-8 left-8 flex items-start gap-3"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      {/* album art */}
      {track.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.imageUrl}
          alt={track.album}
          className="w-12 h-12 rounded-sm flex-shrink-0"
          style={{ opacity: 0.85 }}
        />
      )}

      {/* info + bar */}
      <div className="flex flex-col gap-1" style={{ minWidth: 0, width: "180px" }}>
        <p
          className="text-xs font-bold tracking-widest uppercase truncate"
          style={{ color: textColor, transition: "color 1.5s ease" }}
        >
          {track.artists.join(", ")}
        </p>
        <p
          className="text-xs tracking-wide truncate"
          style={{ color: mutedColor, transition: "color 1.5s ease", opacity: 0.75 }}
        >
          {track.name}
        </p>

        {/* progress bar */}
        <div className="flex flex-col gap-1 mt-1">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: "1.5px", backgroundColor: mutedColor, opacity: 0.25 }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: textColor,
                opacity: 1,
                transition: "width 0.1s linear, background-color 1.5s ease",
              }}
            />
          </div>
          <div
            className="flex justify-between text-[10px] tracking-widest"
            style={{ color: mutedColor, opacity: 0.55, transition: "color 1.5s ease" }}
          >
            <span>{formatTime(progressMs)}</span>
            <span>{formatTime(track.durationMs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
