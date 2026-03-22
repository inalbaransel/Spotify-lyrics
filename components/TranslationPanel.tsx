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
      className="fixed bottom-8 right-8 max-w-[260px] text-right"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      <p
        key={lineIndex}
        className="text-sm italic leading-snug animate-fade-in"
        style={{
          color: mutedColor,
          opacity: loading ? 0.3 : 0.65,
          transition: "color 1.5s ease, opacity 0.3s ease",
        }}
      >
        {loading ? "..." : translated}
      </p>
    </div>
  );
}
