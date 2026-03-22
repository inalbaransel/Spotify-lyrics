import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const params = new URLSearchParams({
    artist_name: searchParams.get("artist_name") ?? "",
    track_name: searchParams.get("track_name") ?? "",
    album_name: searchParams.get("album_name") ?? "",
    duration: searchParams.get("duration") ?? "",
  });

  const res = await fetch(`https://lrclib.net/api/get?${params}`, {
    headers: { "Lrclib-Client": "spotify-lyrics-app" },
  });

  if (res.status === 404) {
    return NextResponse.json({ syncedLyrics: null });
  }

  if (!res.ok) {
    return NextResponse.json({ syncedLyrics: null }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ syncedLyrics: data.syncedLyrics ?? null });
}
