"use client";

import { useState, useEffect, useRef } from "react";

interface TranslationPanelProps {
  translated: string | null;
  loading: boolean;
  lineIndex: number;
  mutedColor: string;
}

export function TranslationPanel({
  translated,
  loading,
  lineIndex,
  mutedColor,
}: TranslationPanelProps) {
  const incoming = loading ? null : translated;

  const [displayed, setDisplayed] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const nextRef = useRef<string | null>(null);

  useEffect(() => {
    nextRef.current = incoming;

    if (!displayed) {
      // Gösterilecek eski metin yok, direkt gir
      setDisplayed(incoming);
      return;
    }

    // Eski metni çıkart, sonra yenisini göster
    setExiting(true);
    const timer = setTimeout(() => {
      setExiting(false);
      setDisplayed(nextRef.current);
    }, 160);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex, incoming]);

  if (!displayed && !exiting) return null;

  return (
    <div
      className="fixed top-6 right-6 max-w-[200px] text-right md:top-auto md:bottom-8 md:right-8 md:max-w-[300px]"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      <p
        key={exiting ? "exit" : `enter-${lineIndex}`}
        className={`text-sm italic leading-snug md:text-xl md:leading-normal ${
          exiting ? "animate-translation-out" : "animate-translation-in"
        }`}
        style={{
          color: mutedColor,
          opacity: 0.7,
          transition: "color 1.5s ease",
        }}
      >
        {displayed ?? "..."}
      </p>
    </div>
  );
}
