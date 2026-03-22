"use client";

interface LyricLineProps {
  word: string;
  wordIndex: number;
  textColor: string;
}

export function LyricLine({ word, wordIndex, textColor }: LyricLineProps) {
  const len = word.length;
  const sizeClass =
    len <= 4
      ? "text-[18vw]"
      : len <= 8
      ? "text-[13vw]"
      : len <= 12
      ? "text-[9vw]"
      : "text-[6vw]";

  return (
    <div
      key={wordIndex}
      className={`${sizeClass} font-black text-center leading-none px-8 select-none animate-word-in`}
      style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        color: textColor,
      }}
    >
      {word}
    </div>
  );
}
