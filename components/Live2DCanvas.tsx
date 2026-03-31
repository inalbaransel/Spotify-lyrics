"use client";

import { useEffect, useRef } from "react";
import type { Beat } from "@/hooks/useAudioAnalysis";

interface Props {
  beats: Beat[];
  progressMs: number;
  modelPath: string;
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

// Hata fırlatmadan parametre ekle (model'de yoksa no-op)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryAdd(core: any, id: string, val: number) {
  try { core.addParameterValueById(id, val); } catch { /* parametre yoksa sessizce atla */ }
}

export default function Live2DCanvas({ beats, progressMs, modelPath }: Props) {
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
        const model = await Live2DModel.from(modelPath);
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
          if (!core) return;

          // ── Gövde (her iki model) ────────────────────────────────────────────
          // Sol/sağ sallantı - ana dans hareketi (kalça etkisi)
          tryAdd(core, "ParamBodyAngleZ", dir * Math.sin(t * Math.PI) * 20);
          // 3D rotasyon - kalçanın gerçek dönüşü (önceki implementasyonda yoktu!)
          tryAdd(core, "ParamBodyAngleY", Math.sin(t * Math.PI * 2) * 12);
          // Öne/arkaya bounce - vücut enerjisi
          tryAdd(core, "ParamBodyAngleX", -Math.abs(Math.sin(t * Math.PI)) * 7);
          // Üst gövde (Haru'da var, Hiyori'de yok → no-op)
          tryAdd(core, "ParamBodyUpper", dir * Math.sin(t * Math.PI) * 6);

          // ── Bacak / kalça ──────────────────────────────────────────────────
          // Hiyori'de ParamLeg var, bacak/kalça bölgesi
          tryAdd(core, "ParamLeg", dir * Math.sin(t * Math.PI * 2) * 0.9);

          // ── Omuz ───────────────────────────────────────────────────────────
          tryAdd(core, "ParamShoulder", Math.sin(t * Math.PI * 2) * 0.5);

          // ── Kollar - gövdenin ters yönünde sallanır ─────────────────────────
          tryAdd(core, "ParamArmLA",  dir * Math.sin(t * Math.PI) * 25);
          tryAdd(core, "ParamArmRA", -dir * Math.sin(t * Math.PI) * 25);
          // Haru'nun ikinci kol seti (LB/RB) - biraz faz gecikmeli
          tryAdd(core, "ParamArmLB",  dir * Math.sin(t * Math.PI + Math.PI / 4) * 20);
          tryAdd(core, "ParamArmRB", -dir * Math.sin(t * Math.PI + Math.PI / 4) * 20);
          // Haru el açıları
          tryAdd(core, "ParamHandAngleR", Math.sin(t * Math.PI * 2) * 20);
          tryAdd(core, "ParamHandAngleL", -Math.sin(t * Math.PI * 2) * 20);

          // ── Göğüs bounce (Haru) ─────────────────────────────────────────────
          tryAdd(core, "ParamBustY", Math.abs(Math.sin(t * Math.PI)) * 0.4);

          // ── Kafa gövdeyi takip eder ─────────────────────────────────────────
          tryAdd(core, "ParamAngleZ", dir * Math.sin(t * Math.PI) * 6);
        };

        ticker.add(onTick);

        // Cleanup için sakla
        (app as unknown as Record<string, unknown>)._danceTicker = onTick;
        (app as unknown as Record<string, unknown>)._PIXI = PIXI;

      } catch (e) {
        console.error("Live2D model load error:", e);
      }
    }

    init();

    return () => {
      destroyed = true;
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
  // modelPath değişince modeli yeniden yükle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelPath]);

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
