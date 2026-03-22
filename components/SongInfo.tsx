"use client";

import type { SpotifyTrack } from "@/types/spotify";

interface SongInfoProps {
  track: SpotifyTrack;
}

export function SongInfo({ track }: SongInfoProps) {
  return (
    <div
      className="fixed bottom-8 left-8 text-[#9B7D5A]"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      <p className="text-sm font-bold tracking-widest uppercase">
        {track.artists.join(", ")}
      </p>
      <p className="text-xs tracking-wide opacity-70">{track.name}</p>
    </div>
  );
}
