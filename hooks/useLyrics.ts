"use client";

import { useState, useEffect, useRef } from "react";
import { fetchLrclib } from "@/lib/lrclib";
import { parseLRC } from "@/lib/lrc-parser";
import type { SpotifyTrack } from "@/types/spotify";
import type { LyricLine } from "@/types/lyrics";

interface LyricsState {
  lines: LyricLine[];
  loading: boolean;
  notFound: boolean;
}

export function useLyrics(track: SpotifyTrack | null): LyricsState {
  const [state, setState] = useState<LyricsState>({
    lines: [],
    loading: false,
    notFound: false,
  });

  const cacheRef = useRef<Map<string, LyricLine[] | null>>(new Map());
  const lastTrackIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!track) {
      setState({ lines: [], loading: false, notFound: false });
      return;
    }

    if (track.id === lastTrackIdRef.current) return;
    lastTrackIdRef.current = track.id;

    if (cacheRef.current.has(track.id)) {
      const cached = cacheRef.current.get(track.id);
      if (cached) {
        setState({ lines: cached, loading: false, notFound: false });
      } else {
        setState({ lines: [], loading: false, notFound: true });
      }
      return;
    }

    setState({ lines: [], loading: true, notFound: false });

    const durationSecs = track.durationMs / 1000;
    fetchLrclib(track.artists[0], track.name, track.album, durationSecs)
      .then((raw) => {
        if (!raw) {
          cacheRef.current.set(track.id, null);
          setState({ lines: [], loading: false, notFound: true });
          return;
        }
        const lines = parseLRC(raw);
        cacheRef.current.set(track.id, lines);
        setState({ lines, loading: false, notFound: false });
      })
      .catch(() => {
        setState({ lines: [], loading: false, notFound: true });
      });
  }, [track]);

  return state;
}
