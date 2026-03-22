"use client";

import { useState, useEffect, useRef } from "react";

export function useTranslation(text: string | null) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef<Map<string, string>>(new Map());

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

    fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|tr`
    )
      .then((r) => r.json())
      .then((data) => {
        const result: string = data?.responseData?.translatedText ?? text;
        cacheRef.current.set(text, result);
        setTranslated(result);
      })
      .catch(() => setTranslated(text))
      .finally(() => setLoading(false));
  }, [text]);

  return { translated, loading };
}
