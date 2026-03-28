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
        if (destroyed) { return; } // app already destroyed in cleanup
        modelRef.current = model;

        app.stage.addChild(model as unknown as import("pixi.js").DisplayObject);

        positionModel(model, window.innerWidth, window.innerHeight);

        // Patch coreModel.update to inject beat-driven dance params
        // This runs AFTER motion/physics but BEFORE mesh vertex apply — guaranteed correct timing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const coreModel = model.internalModel.coreModel as any;
        const origCoreUpdate = coreModel.update.bind(coreModel);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (coreModel as any).update = () => {
          const elapsed = performance.now() - lastBeatTimeRef.current;
          if (elapsed < 700) {
            const t = Math.sin((elapsed / 700) * Math.PI); // bell curve: 0→1→0
            const dir = beatCountRef.current % 2 === 0 ? 1 : -1;
            try {
              coreModel.setParameterValueById("ParamBodyAngleZ", t * 12 * dir);
              coreModel.setParameterValueById("ParamBodyAngleX", t * -5);
              coreModel.setParameterValueById("ParamBodyUpper", t * 8 * dir);
              coreModel.setParameterValueById("ParamBustY", t * 0.5);
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
      positionModel(model, window.innerWidth, window.innerHeight);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Beat reaction
  const onBeat = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;

    lastBeatTimeRef.current = performance.now();
    beatCountRef.current++;

    try {
      // priority 3 = FORCE: interrupts current motion, starts new "Use" motion
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (model as any).motion("Use", undefined, 3);
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
