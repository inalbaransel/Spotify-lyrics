"use client";

import { useEffect, useRef } from "react";
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

export default function Live2DCanvas({ beats: _beats, progressMs: _progressMs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<import("pixi.js").Application | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);

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
        const model = await Live2DModel.from("/live2d/hiyori/Hiyori.model3.json");
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
