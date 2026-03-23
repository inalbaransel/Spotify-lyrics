"use client";

import { useState, useEffect, useRef } from "react";

// Lingva Translate — Google Translate tabanlı, ücretsiz, key yok, auto-detect destekli
const LINGVA_INSTANCES = [
  "https://lingva.ml",
  "https://translate.plausibility.cloud",
];

// ğ ve ı (noktasız i) yalnızca Türkçe'ye özgü karakterler — varsa çeviri gereksiz
function isTurkish(text: string): boolean {
  return /[ğĞıİ]/.test(text);
}

async function translateText(text: string): Promise<string> {
  for (const base of LINGVA_INSTANCES) {
    try {
      const res = await fetch(
        `${base}/api/v1/auto/tr/${encodeURIComponent(text)}`,
        { signal: AbortSignal.timeout(4000) }
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
    if (!prefetchText || isTurkish(prefetchText) || cacheRef.current.has(prefetchText)) return;
    translateText(prefetchText).then((result) => {
      cacheRef.current.set(prefetchText, result);
    });
  }, [prefetchText]);

  useEffect(() => {
    if (!text) {
      setTranslated(null);
      setLoading(false);
      return;
    }

    // Zaten Türkçe ise panel gösterilmesin
    if (isTurkish(text)) {
      setTranslated(null);
      setLoading(false);
      return;
    }

    if (cacheRef.current.has(text)) {
      setTranslated(cacheRef.current.get(text)!);
      setLoading(false); // cache hit'te loading'i kapat
      return;
    }

    // Cache miss: eski çeviriyi temizle, yüklemeye başla
    setTranslated(null);
    setLoading(true);

    let cancelled = false;

    translateText(text)
      .then((result) => {
        if (cancelled) return;
        cacheRef.current.set(text, result);
        setTranslated(result);
      })
      .catch(() => {
        if (cancelled) return;
        setTranslated(text); // fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // text değişirse eski fetch'i iptal et (stale güncelleme önlenir)
    return () => { cancelled = true; };
  }, [text]);

  return { translated, loading };
}
