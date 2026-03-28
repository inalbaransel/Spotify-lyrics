"use client";

import { useEffect, useRef, useCallback } from "react";
import { useBeatSync } from "@/hooks/useBeatSync";
import type { Beat } from "@/hooks/useAudioAnalysis";

interface Props {
  beats: Beat[];
  progressMs: number;
}

export default function Live2DCanvas({ beats, progressMs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<import("pixi.js").Application | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  const glowRef = useRef<HTMLDivElement>(null);

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
        transparent: true,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio || 1,
      } as ConstructorParameters<typeof PIXI.Application>[0]);
      appRef.current = app;

      try {
        const model = await Live2DModel.from(
          "/live2d/haru/haru_greeter_t03.model3.json"
        );
        if (destroyed) { return; } // app already destroyed in cleanup
        modelRef.current = model;

        app.stage.addChild(model as unknown as import("pixi.js").DisplayObject);

        // Scale to fill screen (taller than wide, so fit to height)
        const origW = model.internalModel.originalWidth;
        const origH = model.internalModel.originalHeight;
        const scale = (window.innerHeight * 0.9) / origH;
        model.scale.set(scale);
        // Center horizontally, anchor to bottom
        model.x = (window.innerWidth - origW * scale) / 2;
        model.y = window.innerHeight - origH * scale * 0.02;

        // Start idle motion
        (model as unknown as { motion: (group: string) => void }).motion("Idle");
      } catch (e) {
        console.error("Live2D model load error:", e);
      }
    }

    init();

    return () => {
      destroyed = true;
      appRef.current?.destroy(false); // don't remove canvas, React manages it
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
      const origW = model.internalModel.originalWidth;
      const origH = model.internalModel.originalHeight;
      const scale = (window.innerHeight * 0.9) / origH;
      model.scale.set(scale);
      model.x = (window.innerWidth - origW * scale) / 2;
      model.y = window.innerHeight - origH * scale * 0.02;
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Beat reaction
  const onBeat = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;

    try {
      (model as unknown as { motion: (group: string) => void }).motion("Use");
    } catch {}

    // CSS glow flash
    if (glowRef.current) {
      glowRef.current.classList.remove("beat-active");
      void glowRef.current.offsetWidth; // force reflow
      glowRef.current.classList.add("beat-active");
    }
  }, []);

  useBeatSync(beats, progressMs, onBeat);

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
