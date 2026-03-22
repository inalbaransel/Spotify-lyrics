"use client";

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
  if (!loading && !translated) return null;

  return (
    <div
      // Mobilde: sağ üst — Masaüstünde: sağ alt
      className="fixed top-6 right-6 max-w-[200px] text-right md:top-auto md:bottom-8 md:right-8 md:max-w-[300px]"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      <p
        key={lineIndex}
        className="text-sm italic leading-snug animate-fade-in md:text-xl md:leading-normal"
        style={{
          color: mutedColor,
          opacity: loading ? 0.3 : 0.7,
          transition: "color 1.5s ease, opacity 0.3s ease",
        }}
      >
        {loading ? "..." : translated}
      </p>
    </div>
  );
}
