"use client";

interface InstrumentalDotsProps {
  /** Geçen süre (ms) — gap başından itibaren */
  elapsed: number;
  /** Gap toplam süresi (ms). null ise progress bilinmiyor */
  duration: number | null;
  color: string;
}

/**
 * Enstrümantal / sözsüz bölümlerde dalga gibi zıplayan 3 nokta.
 * Her nokta gap'in 1/3'ünü temsil eder: ilerledikçe birer birer parlar.
 */
export function InstrumentalDots({ elapsed, duration, color }: InstrumentalDotsProps) {
  // 0–1 arası genel ilerleme (bilinmiyorsa 0)
  const progress = duration && duration > 0 ? Math.min(elapsed / duration, 1) : 0;

  // Her nokta kendi 1/3 diliminde 0.15 → 0.85 opaklığa geçer
  const dotOpacity = (index: number) => {
    const start = index / 3;
    const end = (index + 1) / 3;
    const local = Math.max(0, Math.min((progress - start) / (end - start), 1));
    return 0.15 + local * 0.7;
  };

  const delays = ["0s", "0.18s", "0.36s"];

  return (
    <div className="flex items-end gap-[0.6em]" style={{ height: "2.5em" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-dot-bounce rounded-full block"
          style={{
            width: "3.5vw",
            height: "3.5vw",
            maxWidth: "2.2rem",
            maxHeight: "2.2rem",
            minWidth: "0.85rem",
            minHeight: "0.85rem",
            backgroundColor: color,
            opacity: dotOpacity(i),
            animationDelay: delays[i],
            transition: "opacity 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}
