"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Theme = "classic" | "anime";
export type Character = "hiyori" | "haru";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  character: Character;
  setCharacter: (c: Character) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "classic",
  setTheme: () => {},
  character: "hiyori",
  setCharacter: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("classic");
  const [character, setCharacterState] = useState<Character>("hiyori");

  useEffect(() => {
    const saved = localStorage.getItem("app-theme") as Theme | null;
    if (saved === "classic" || saved === "anime") setThemeState(saved);
    const savedChar = localStorage.getItem("app-character") as Character | null;
    if (savedChar === "hiyori" || savedChar === "haru") setCharacterState(savedChar);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("app-theme", t);
  }

  function setCharacter(c: Character) {
    setCharacterState(c);
    localStorage.setItem("app-character", c);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, character, setCharacter }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
