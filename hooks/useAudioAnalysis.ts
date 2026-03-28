"use client";

import { useState, useEffect, useRef } from "react";
import { getTokens, isTokenExpired } from "@/lib/token-store";

export interface Beat {
  start: number;   // seconds
  duration: number;
  confidence: number;
}

// In-memory cache: trackId → beats
const cache = new Map<string, Beat[]>();

async function fetchBeats(trackId: string): Promise<Beat[]> {
  const tokens = getTokens();
  if (!tokens || isTokenExpired(tokens)) return [];

  const res = await fetch(
    `https://api.spotify.com/v1/audio-analysis/${trackId}`,
    { headers: { Authorization: `Bearer ${tokens.accessToken}` } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.beats ?? []) as Beat[];
}

export function useAudioAnalysis(trackId: string | null) {
  const [beats, setBeats] = useState<Beat[]>([]);
  const fetchingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!trackId) { setBeats([]); return; }

    const cached = cache.get(trackId);
    if (cached) { setBeats(cached); return; }

    if (fetchingRef.current === trackId) return;
    fetchingRef.current = trackId;

    fetchBeats(trackId).then((result) => {
      cache.set(trackId, result);
      fetchingRef.current = null;
      setBeats(result);
    });
  }, [trackId]);

  return beats;
}
