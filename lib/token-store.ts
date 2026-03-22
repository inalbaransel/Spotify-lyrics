import type { SpotifyToken } from "@/types/spotify";

const ACCESS_TOKEN_KEY = "sp_access_token";
const REFRESH_TOKEN_KEY = "sp_refresh_token";
const EXPIRES_AT_KEY = "sp_expires_at";

export function saveTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function getTokens(): SpotifyToken | null {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);

  if (!accessToken || !refreshToken || !expiresAt) return null;

  return {
    accessToken,
    refreshToken,
    expiresAt: parseInt(expiresAt),
  };
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

export function isTokenExpired(tokens: SpotifyToken): boolean {
  return Date.now() >= tokens.expiresAt - 30000; // 30s buffer
}
