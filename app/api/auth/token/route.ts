import { NextRequest, NextResponse } from "next/server";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI!;

export async function POST(req: NextRequest) {
  const body = await req.json();

  let params: URLSearchParams;

  if (body.code && body.codeVerifier) {
    params = new URLSearchParams({
      grant_type: "authorization_code",
      code: body.code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: body.codeVerifier,
    });
  } else if (body.refreshToken) {
    params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: body.refreshToken,
      client_id: CLIENT_ID,
    });
  } else {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: params,
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  return NextResponse.json(data);
}
