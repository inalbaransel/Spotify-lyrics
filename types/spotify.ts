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
  imageUrl: string | null;
}

export interface NowPlayingResponse {
  isPlaying: boolean;
  progressMs: number;
  track: SpotifyTrack;
}
