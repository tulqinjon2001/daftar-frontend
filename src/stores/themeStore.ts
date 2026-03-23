import { create } from "zustand";

export type Theme = "light" | "dark";

const STORAGE_KEY = "qarz_theme";

function getStored(): Theme {
  if (typeof window === "undefined") return "light";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "dark" ? "dark" : "light";
}

export function initTheme() {
  const theme = getStored();
  document.documentElement.classList.toggle("dark", theme === "dark");
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getStored(),
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme);
    set({ theme });
    document.documentElement.classList.toggle("dark", theme === "dark");
  },
  toggleTheme: () => {
    set((s) => {
      const next = s.theme === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return { theme: next };
    });
  },
}));
