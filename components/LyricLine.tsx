"use client";

interface LyricLineProps {
  displayWords: string[];
  allWords: string[];
  lineIndex: number;
  textColor: string;
}

function getFontSize(allWords: string[]): string {
  const totalChars = allWords.join("").length;
  if (totalChars <= 8) return "text-[20vw]";
  if (totalChars <= 15) return "text-[14vw]";
  if (totalChars <= 25) return "text-[10vw]";
  if (totalChars <= 40) return "text-[7vw]";
  return "text-[5vw]";
}

export function LyricLine({
  displayWords,
  allWords,
  lineIndex,
  textColor,
}: LyricLineProps) {
  const sizeClass = getFontSize(allWords);

  return (
    <div className="flex flex-wrap justify-center items-end gap-x-[0.2em] gap-y-[0.1em] px-8 max-w-[92vw]">
      {displayWords.map((word, i) => (
        <span
          key={`${lineIndex}-${i}`}
          className={`${sizeClass} font-black leading-none select-none animate-word-in`}
          style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            color: textColor,
            transition: "color 1.5s ease",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
