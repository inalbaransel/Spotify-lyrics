"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Theme = "classic" | "anime";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "classic",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("classic");

  useEffect(() => {
    const saved = localStorage.getItem("app-theme") as Theme | null;
    if (saved === "classic" || saved === "anime") setThemeState(saved);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("app-theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
