import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: { Authorization: authorization },
    }
  );

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "Spotify error" }, { status: res.status });
  }

  const data = await res.json();

  if (!data.item || data.item.type !== "track") {
    return new NextResponse(null, { status: 204 });
  }

  const normalized = {
    isPlaying: data.is_playing,
    progressMs: data.progress_ms ?? 0,
    track: {
      id: data.item.id,
      name: data.item.name,
      artists: data.item.artists.map((a: { name: string }) => a.name),
      album: data.item.album.name,
      durationMs: data.item.duration_ms,
    },
  };

  return NextResponse.json(normalized);
}
