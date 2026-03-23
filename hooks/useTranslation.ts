"use client";

import { useState, useEffect, useRef } from "react";

// Lingva Translate — Google Translate tabanlı, ücretsiz, key yok, auto-detect destekli
const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://translate.plausibility.cloud",
];

async function translateText(text: string): Promise<string> {
  for (const base of LINGVA_INSTANCES) {
    try {
      const res = await fetch(
        `${base}/api/v1/auto/tr/${encodeURIComponent(text)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.translation) return data.translation;
    } catch {
      // try next instance
    }
  }
  return text; // fallback: orijinal metni göster
}

export function useTranslation(text: string | null, prefetchText?: string | null) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Map<string, string>>(new Map());

  // Bir sonraki satırı arka planda cache'le
  useEffect(() => {
    if (!prefetchText || cacheRef.current.has(prefetchText)) return;
    translateText(prefetchText).then((result) => {
      cacheRef.current.set(prefetchText, result);
    });
  }, [prefetchText]);

  useEffect(() => {
    if (!text) {
      setTranslated(null);
      return;
    }

    if (cacheRef.current.has(text)) {
      setTranslated(cacheRef.current.get(text)!);
      return;
    }

    setLoading(true);

    translateText(text)
      .then((result) => {
        cacheRef.current.set(text, result);
        setTranslated(result);
      })
      .catch(() => setTranslated(text))
      .finally(() => setLoading(false));
  }, [text]);

  return { translated, loading };
}
