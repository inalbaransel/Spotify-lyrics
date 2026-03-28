"use client";

import { useState } from "react";
import { useTheme, Theme } from "@/contexts/ThemeContext";

const THEMES: { id: Theme; label: string; emoji: string; desc: string }[] = [
  { id: "classic", label: "Classic", emoji: "🎵", desc: "Album renkli, minimal" },
  { id: "anime", label: "Anime", emoji: "✨", desc: "Live2D karakter, beat sync" },
];

export function ThemeMenu() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center"
      style={{ pointerEvents: "auto" }}
    >
      {/* Expanded panel */}
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: open ? 192 : 0, opacity: open ? 1 : 0 }}
      >
        <div
          className="w-48 rounded-l-2xl p-3 flex flex-col gap-2"
          style={{
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <p className="text-white/50 text-xs uppercase tracking-widest px-1 mb-1">Tema</p>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 text-left"
              style={{
                background: theme === t.id ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.05)",
                border: theme === t.id ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
              }}
            >
              <span className="text-xl">{t.emoji}</span>
              <div>
                <p className="text-white text-sm font-semibold leading-none mb-0.5">{t.label}</p>
                <p className="text-white/50 text-xs leading-none">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle tab */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center rounded-l-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          width: 40,
          height: 80,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRight: "none",
        }}
        aria-label="Tema menüsü"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s ease",
          }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </div>
  );
}
