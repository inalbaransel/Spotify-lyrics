import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const trackId = req.nextUrl.searchParams.get("trackId");
  if (!trackId) {
    return NextResponse.json({ error: "No trackId" }, { status: 400 });
  }

  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }

  const res = await fetch(
    `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    { headers: { Authorization: authorization } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Spotify error" }, { status: res.status });
  }

  const data = await res.json();

  // Only return beats to keep the payload small
  return NextResponse.json({
    beats: (data.beats ?? []) as { start: number; duration: number; confidence: number }[],
    tempo: data.track?.tempo ?? null,
  });
}
