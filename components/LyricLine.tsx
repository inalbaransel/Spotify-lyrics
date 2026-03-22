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
    <div className="flex flex-wrap justify-center items-end px-8 max-w-[92vw]">
      {allWords.map((word, i) => {
        const isVisible = i < displayWords.length;
        return (
          <span
            // key changes when word goes from hidden→visible → remounts → animation plays
            key={`${lineIndex}-${i}-${isVisible}`}
            className={`${sizeClass} font-black leading-none select-none ${
              isVisible ? "animate-word-in" : "opacity-0"
            }`}
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              color: textColor,
              transition: "color 1.5s ease",
              marginRight: i < allWords.length - 1 ? "0.3em" : 0,
              marginBottom: "0.1em",
            }}
            aria-hidden={!isVisible}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}
