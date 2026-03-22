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

  // Direct browser → lrclib.net call (supports CORS), no Vercel serverless hop
  const res = await fetch(`https://lrclib.net/api/get?${params}`, {
    headers: { "Lrclib-Client": "spotify-lyrics-app" },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data.syncedLyrics ?? null;
}
