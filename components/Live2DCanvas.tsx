"use client";

import { useEffect, useRef, useCallback } from "react";
import { useBeatSync } from "@/hooks/useBeatSync";
import type { Beat } from "@/hooks/useAudioAnalysis";

interface Props {
  beats: Beat[];
  progressMs: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function positionModel(model: any, screenW: number, screenH: number) {
  const origW = model.internalModel?.originalWidth ?? model.width ?? 1000;
  const origH = model.internalModel?.originalHeight ?? model.height ?? 1000;
  const scale = (screenH * 0.9) / origH;
  model.scale.set(scale);
  model.x = (screenW - origW * scale) / 2;
  model.y = screenH - origH * scale;
}

export default function Live2DCanvas({ beats, progressMs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const danceRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<import("pixi.js").Application | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lastBeatTimeRef = useRef<number>(-9999);
  const beatCountRef = useRef<number>(0);
  const beatIntervalRef = useRef<number>(500);

  // Init PixiJS + Live2D once
  useEffect(() => {
    if (!canvasRef.current) return;
    let destroyed = false;

    async function init() {
      const PIXI = await import("pixi.js");
      (window as unknown as Record<string, unknown>).PIXI = PIXI;
      const { Live2DModel } = await import("pixi-live2d-display/cubism4");

      if (destroyed) return;

      const app = new PIXI.Application({
        view: canvasRef.current!,
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundAlpha: 0,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      });
      appRef.current = app;

      try {
        const model = await Live2DModel.from(
          "/live2d/hiyori/Hiyori.model3.json"
        );
        if (destroyed) return;
        modelRef.current = model;

        app.stage.addChild(model as unknown as import("pixi.js").DisplayObject);
        positionModel(model, window.innerWidth, window.innerHeight);

        (model as unknown as { motion: (group: string) => void }).motion("Idle");
      } catch (e) {
        console.error("Live2D model load error:", e);
      }
    }

    init();

    return () => {
      destroyed = true;
      appRef.current?.destroy(false);
      appRef.current = null;
      modelRef.current = null;
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    function onResize() {
      const app = appRef.current;
      const model = modelRef.current;
      if (!app || !model) return;
      app.renderer.resize(window.innerWidth, window.innerHeight);
      positionModel(model, window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const triggerDance = useCallback(() => {
    const el = danceRef.current;
    if (!el) return;
    // Set duration to ~80% of beat interval so it lands before next beat
    el.style.animationDuration = `${Math.max(200, beatIntervalRef.current * 0.8)}ms`;
    el.classList.remove("live2d-dance");
    void el.offsetWidth; // reflow to restart animation
    el.classList.add("live2d-dance");
  }, []);

  // Beat reaction
  const onBeat = useCallback(() => {
    const now = performance.now();
    const prev = lastBeatTimeRef.current;
    if (prev > 0) {
      const gap = now - prev;
      if (gap > 200 && gap < 2000) {
        beatIntervalRef.current = beatIntervalRef.current * 0.7 + gap * 0.3;
      }
    }
    lastBeatTimeRef.current = now;
    beatCountRef.current++;

    triggerDance();

    // Trigger "Use" motion every 4 beats with normal priority (no jarring interrupts)
    const model = modelRef.current;
    if (model && beatCountRef.current % 4 === 0) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (model as any).motion("TapBody", undefined, 2);
      } catch {}
    }

    // CSS glow flash
    if (glowRef.current) {
      glowRef.current.classList.remove("beat-active");
      void glowRef.current.offsetWidth;
      glowRef.current.classList.add("beat-active");
    }
  }, [triggerDance]);

  useBeatSync(beats, progressMs, onBeat);

  // Simulated beat when Spotify audio-analysis unavailable (non-premium / 403)
  useEffect(() => {
    if (beats.length > 0) return;

    const tick = () => {
      const now = performance.now();
      const prev = lastBeatTimeRef.current;
      if (prev > 0) {
        const gap = now - prev;
        if (gap > 200 && gap < 2000) {
          beatIntervalRef.current = beatIntervalRef.current * 0.7 + gap * 0.3;
        }
      }
      lastBeatTimeRef.current = now;
      beatCountRef.current++;
      triggerDance();
    };

    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beats.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* danceRef wraps canvas — CSS transform applied here, not inside Live2D */}
      <div
        ref={danceRef}
        className="absolute inset-0"
        style={{ transformOrigin: "50% 95%" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: "block" }}
        />
      </div>
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none beat-glow-overlay"
      />
    </div>
  );
}
