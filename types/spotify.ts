export interface SpotifyToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  album: string;
  durationMs: number;
}

export interface NowPlayingResponse {
  isPlaying: boolean;
  progressMs: number;
  track: SpotifyTrack;
}
