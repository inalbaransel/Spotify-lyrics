"use client";

import { useState, useEffect } from "react";

export interface AlbumColors {
  bg: string;
  text: string;
  muted: string;
}

const DEFAULT_COLORS: AlbumColors = {
  bg: "#E8D5B0",
  text: "#3B2A1A",
  muted: "#9B7D5A",
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
    case g: h = ((b - r) / d + 2) / 6; break;
    default: h = ((r - g) / d + 4) / 6; break;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return `#${[f(0), f(8), f(4)]
    .map((x) => Math.round(x * 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function useAlbumColors(imageUrl: string | null): AlbumColors {
  const [colors, setColors] = useState<AlbumColors>(DEFAULT_COLORS);

  useEffect(() => {
    if (!imageUrl) {
      setColors(DEFAULT_COLORS);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, size, size);
      const data = ctx.getImageData(0, 0, size, size).data;

      let bestH = 30, bestS = 40, maxVibrancy = -1;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const [h, s, l] = rgbToHsl(r, g, b);
        // vibrancy = saturation * how far from pure black/white
        const vibrancy = s * (1 - Math.abs(l / 100 - 0.5) * 2);
        if (vibrancy > maxVibrancy) {
          maxVibrancy = vibrancy;
          bestH = h;
          bestS = s;
        }
      }

      setColors({
        bg: hslToHex(bestH, Math.min(bestS * 0.25, 20), 93),
        text: hslToHex(bestH, Math.min(bestS * 0.9, 65), 12),
        muted: hslToHex(bestH, Math.min(bestS * 0.5, 40), 42),
      });
    };

    img.onerror = () => setColors(DEFAULT_COLORS);
    img.src = imageUrl;
  }, [imageUrl]);

  return colors;
}
