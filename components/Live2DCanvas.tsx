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
  const appRef = useRef<import("pixi.js").Application | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const lastBeatTimeRef = useRef<number>(-9999);
  const beatCountRef = useRef<number>(0);
  // Smoothed estimate of ms between beats (default 500ms = 120 BPM)
  const beatIntervalRef = useRef<number>(500);

  // Init PixiJS + Live2D once
  useEffect(() => {
    if (!canvasRef.current) return;
    let destroyed = false;

    async function init() {
      const PIXI = await import("pixi.js");
      // MUST set window.PIXI BEFORE importing pixi-live2d-display
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
          "/live2d/haru/haru_greeter_t03.model3.json"
        );
        if (destroyed) { return; }
        modelRef.current = model;

        app.stage.addChild(model as unknown as import("pixi.js").DisplayObject);
        positionModel(model, window.innerWidth, window.innerHeight);

        // Patch coreModel.update — runs AFTER motion/physics, BEFORE mesh apply
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coreModel = model.internalModel.coreModel as any;
        const origCoreUpdate = coreModel.update.bind(coreModel);
        coreModel.update = () => {
          const now = performance.now();
          const timeSinceLastBeat = now - lastBeatTimeRef.current;
          const interval = beatIntervalRef.current;

          // Dance while music is playing (stop after 3s silence)
          if (timeSinceLastBeat < 3000) {
            // Continuous sine wave locked to beat phase
            const phase = ((timeSinceLastBeat % interval) / interval) * Math.PI * 2;
            // Fade out gently in the last second of silence
            const fade = timeSinceLastBeat > 2000
              ? 1 - (timeSinceLastBeat - 2000) / 1000
              : 1;
            const dir = beatCountRef.current % 2 === 0 ? 1 : -1;

            const sway = Math.sin(phase) * 18 * dir * fade;          // hip sway L/R
            const bounce = Math.sin(phase * 2) * -10 * fade;         // up-down bounce
            const upper = Math.sin(phase + 0.4) * 12 * dir * fade;   // upper body follows
            const bust = Math.abs(Math.sin(phase)) * 1.2 * fade;     // chest bounce

            try {
              coreModel.setParameterValueById("ParamBodyAngleZ", sway);
              coreModel.setParameterValueById("ParamBodyAngleX", bounce);
              coreModel.setParameterValueById("ParamBodyUpper", upper);
              coreModel.setParameterValueById("ParamBustY", bust);
            } catch { /* param absent — skip */ }
          }

          origCoreUpdate();
        };

        // Start idle motion
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

  // Beat reaction
  const onBeat = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;

    const now = performance.now();
    const prev = lastBeatTimeRef.current;
    // Update smoothed beat interval estimate
    if (prev > 0) {
      const gap = now - prev;
      if (gap > 200 && gap < 2000) {
        beatIntervalRef.current = beatIntervalRef.current * 0.7 + gap * 0.3;
      }
    }
    lastBeatTimeRef.current = now;
    beatCountRef.current++;

    try {
      // FORCE (3): interrupts current motion, starts fresh "Use" motion each beat
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (model as any).motion("Use", undefined, 3);
    } catch {}

    // CSS glow flash
    if (glowRef.current) {
      glowRef.current.classList.remove("beat-active");
      void glowRef.current.offsetWidth;
      glowRef.current.classList.add("beat-active");
    }
  }, []);

  useBeatSync(beats, progressMs, onBeat);

  // Simulated beat fallback when Spotify audio-analysis unavailable (403 / non-premium)
  // Fires at the current estimated tempo so the character always dances
  useEffect(() => {
    if (beats.length > 0) return; // real beats available — no simulation needed

    const tick = () => {
      onBeat();
    };

    // Start immediately then repeat at current interval
    tick();
    const id = setInterval(() => {
      tick();
      // Reschedule dynamically to match updated beatInterval
    }, beatIntervalRef.current);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beats.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none beat-glow-overlay"
      />
    </div>
  );
}
