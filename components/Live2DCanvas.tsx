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
  // Sağ yarının ortasına yerleştir
  model.x = screenW / 2 + (screenW / 2 - origW * scale) / 2;
  model.y = screenH - origH * scale;
}

function findBeatIndex(beats: Beat[], progressSec: number): number {
  let lo = 0, hi = beats.length - 1, result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (beats[mid].start <= progressSec) { result = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return result;
}

export default function Live2DCanvas({ beats, progressMs }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<import("pixi.js").Application | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelRef = useRef<any>(null);
  const beatsRef = useRef<Beat[]>([]);
  const progressMsRef = useRef<number>(0);

  // Ticker closure için ref'leri her render'da güncelle
  beatsRef.current = beats;
  progressMsRef.current = progressMs;

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

        // Idle motion: yüz ifadesi, göz kırpma, nefes için devam eder
        (model as unknown as { motion: (group: string, index?: number) => void }).motion("Idle", 0);

        // Dans ticker: beat'e senkronize vücut parametre animasyonu
        const ticker = PIXI.Ticker.shared;
        const onTick = () => {
          const m = modelRef.current;
          if (!m) return;
          const currentBeats = beatsRef.current;
          if (currentBeats.length === 0) return;

          const progressSec = progressMsRef.current / 1000;
          const idx = findBeatIndex(currentBeats, progressSec);
          if (idx < 0) return;

          const beat = currentBeats[idx];
          const t = Math.min((progressSec - beat.start) / beat.duration, 1);
          // Çift beatler sağa, tek beatler sola → doğal sallantı
          const dir = idx % 2 === 0 ? 1 : -1;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const core = (m as any).internalModel?.coreModel;
          if (!core || typeof core.addParameterValueById !== "function") return;

          // Gövde sol/sağ sallantı (ana dans hareketi)
          core.addParameterValueById("ParamBodyAngleZ", dir * Math.sin(t * Math.PI) * 12);
          // Gövde hafif öne bounce
          core.addParameterValueById("ParamBodyAngleX", -Math.abs(Math.sin(t * Math.PI)) * 4);
          // Omuz ritmi
          core.addParameterValueById("ParamShoulder", Math.sin(t * Math.PI * 2) * 0.4);
          // Kollar karşılıklı (gövdenin ters yönünde)
          core.addParameterValueById("ParamArmLA", Math.sin(t * Math.PI) * 18 * dir);
          core.addParameterValueById("ParamArmRA", -Math.sin(t * Math.PI) * 18 * dir);
          // Kafa gövdeyi takip eder
          core.addParameterValueById("ParamAngleZ", dir * Math.sin(t * Math.PI) * 5);
        };

        ticker.add(onTick);

        // Cleanup için ticker'ı sakla
        (app as unknown as Record<string, unknown>)._danceTicker = onTick;
        (app as unknown as Record<string, unknown>)._PIXI = PIXI;

      } catch (e) {
        console.error("Live2D model load error:", e);
      }
    }

    init();

    return () => {
      destroyed = true;
      // Dans ticker'ı temizle
      const app = appRef.current;
      if (app) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const onTick = (app as any)._danceTicker;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PIXI = (app as any)._PIXI;
        if (onTick && PIXI?.Ticker?.shared) {
          PIXI.Ticker.shared.remove(onTick);
        }
      }
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
