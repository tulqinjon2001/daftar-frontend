import { create } from "zustand";
import type { LangCode } from "../i18n/translations";

const STORAGE_KEY = "qarz_lang";

function getStored(): LangCode {
  if (typeof window === "undefined") return "uz-Latn";
  const v = localStorage.getItem(STORAGE_KEY) as LangCode | null;
  return v && ["uz-Latn", "uz-Cyrl", "en", "ru"].includes(v) ? v : "uz-Latn";
}

interface LanguageState {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: getStored(),
  setLang: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    set({ lang });
  },
}));
