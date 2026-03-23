import {
  getTokens,
  saveTokens,
  isTokenExpired,
  clearTokens,
} from "./token-store";
import type { NowPlayingResponse } from "@/types/spotify";

async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("/api/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error("Token refresh failed");
  }

  const data = await res.json();
  saveTokens(data.access_token, data.refresh_token ?? refreshToken, data.expires_in);
  return data.access_token;
}

let refreshPromise: Promise<string> | null = null;

async function getValidAccessToken(): Promise<string> {
  const tokens = getTokens();
  if (!tokens) throw new Error("Not authenticated");

  if (!isTokenExpired(tokens)) return tokens.accessToken;

  // Eğer zaten bir refresh devam ediyorsa, aynı promise'i bekle (double-refresh önlenir)
  if (refreshPromise) return refreshPromise;

  refreshPromise = refreshAccessToken(tokens.refreshToken).finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function getCurrentlyPlaying(): Promise<NowPlayingResponse | null> {
  const accessToken = await getValidAccessToken();

  // Direct browser → Spotify call (CORS supported), no Vercel serverless hop
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);

  const data = await res.json();
  if (!data.item || data.item.type !== "track") return null;

  return {
    isPlaying: data.is_playing,
    progressMs: data.progress_ms ?? 0,
    track: {
      id: data.item.id,
      name: data.item.name,
      artists: data.item.artists.map((a: { name: string }) => a.name),
      album: data.item.album.name,
      durationMs: data.item.duration_ms,
      imageUrl: data.item.album.images?.[0]?.url ?? null,
    },
  };
}
