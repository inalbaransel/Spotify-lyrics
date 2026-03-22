"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getCurrentlyPlaying } from "@/lib/spotify-client";
import type { NowPlayingResponse } from "@/types/spotify";

const POLL_INTERVAL = 3000; // 3s — drift compensation keeps progress smooth

export function useSpotifyPlayer() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingResponse | null>(null);
  const [estimatedProgressMs, setEstimatedProgressMs] = useState(0);
  const [error, setError] = useState(false);

  const fetchedAtRef = useRef<number>(0);
  const isPlayingRef = useRef(false);

  const fetchNowPlaying = useCallback(async () => {
    try {
      const data = await getCurrentlyPlaying();
      fetchedAtRef.current = Date.now();
      isPlayingRef.current = data?.isPlaying ?? false;
      setNowPlaying(data);
      if (data) setEstimatedProgressMs(data.progressMs);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  // Poll with visibility awareness: pause when tab is hidden
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    function start() {
      fetchNowPlaying();
      interval = setInterval(fetchNowPlaying, POLL_INTERVAL);
    }

    function stop() {
      if (interval) { clearInterval(interval); interval = null; }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") start();
      else stop();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    start();

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [fetchNowPlaying]);

  // Drift compensation: advance progress every 100ms when playing
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlayingRef.current) return;
      setEstimatedProgressMs(
        (nowPlaying?.progressMs ?? 0) + (Date.now() - fetchedAtRef.current)
      );
    }, 100);
    return () => clearInterval(interval);
  }, [nowPlaying]);

  return {
    track: nowPlaying?.track ?? null,
    progressMs: estimatedProgressMs,
    isPlaying: nowPlaying?.isPlaying ?? false,
    error,
  };
}
