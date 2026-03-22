"use client";

import type { SpotifyTrack } from "@/types/spotify";

interface SongInfoProps {
  track: SpotifyTrack;
  textColor: string;
}

export function SongInfo({ track, textColor }: SongInfoProps) {
  return (
    <div
      className="fixed bottom-8 left-8 flex items-center gap-3"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      {track.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={track.imageUrl}
          alt={track.album}
          className="w-10 h-10 rounded-sm opacity-80"
        />
      )}
      <div>
        <p
          className="text-sm font-bold tracking-widest uppercase"
          style={{ color: textColor, transition: "color 1.5s ease" }}
        >
          {track.artists.join(", ")}
        </p>
        <p
          className="text-xs tracking-wide opacity-70"
          style={{ color: textColor, transition: "color 1.5s ease" }}
        >
          {track.name}
        </p>
      </div>
    </div>
  );
}
