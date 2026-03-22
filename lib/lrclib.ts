export async function fetchLrclib(
  artist: string,
  track: string,
  album: string,
  durationSecs: number
): Promise<string | null> {
  const params = new URLSearchParams({
    artist_name: artist,
    track_name: track,
    album_name: album,
    duration: String(Math.round(durationSecs)),
  });

  const res = await fetch(`/api/lyrics?${params}`);
  if (!res.ok) return null;

  const data = await res.json();
  return data.syncedLyrics ?? null;
}
