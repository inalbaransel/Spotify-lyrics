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

async function getValidAccessToken(): Promise<string> {
  const tokens = getTokens();
  if (!tokens) throw new Error("Not authenticated");

  if (isTokenExpired(tokens)) {
    return refreshAccessToken(tokens.refreshToken);
  }

  return tokens.accessToken;
}

export async function getCurrentlyPlaying(): Promise<NowPlayingResponse | null> {
  const accessToken = await getValidAccessToken();

  const res = await fetch("/api/spotify/now-playing", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 204 || res.status === 404) return null;
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);

  return res.json();
}
