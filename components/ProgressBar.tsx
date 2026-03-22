"use client";

interface ProgressBarProps {
  progressMs: number;
  durationMs: number;
  textColor: string;
  barColor: string;
}

function formatTime(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ProgressBar({
  progressMs,
  durationMs,
  textColor,
  barColor,
}: ProgressBarProps) {
  const pct = durationMs > 0 ? Math.min((progressMs / durationMs) * 100, 100) : 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 px-8 pb-8"
      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
    >
      {/* time labels */}
      <div
        className="flex justify-between mb-2 text-xs tracking-widest"
        style={{ color: textColor, opacity: 0.5, transition: "color 1.5s ease" }}
      >
        <span>{formatTime(progressMs)}</span>
        <span>{formatTime(durationMs)}</span>
      </div>

      {/* track */}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height: "2px",
          backgroundColor: barColor,
          opacity: 0.2,
        }}
      >
        {/* fill */}
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: barColor,
            opacity: 1,
            transition: "width 0.1s linear, background-color 1.5s ease",
          }}
        />
      </div>
    </div>
  );
}
