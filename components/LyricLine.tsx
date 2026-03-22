"use client";

interface LyricLineProps {
  text: string;
  animationKey: number;
}

export function LyricLine({ text, animationKey }: LyricLineProps) {
  const isLong = text.length > 30;
  const sizeClass = isLong ? "text-5xl md:text-7xl" : "text-7xl md:text-9xl";

  return (
    <div
      key={animationKey}
      className={`${sizeClass} font-black text-[#3B2A1A] text-center leading-none px-8 animate-fade-in`}
      style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        animationDuration: "0.4s",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
      }}
    >
      {text}
    </div>
  );
}
