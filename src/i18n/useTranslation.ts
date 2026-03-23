import { useLanguageStore } from "../stores/languageStore";
import translations from "../i18n/translations";

export function useTranslation() {
  const lang = useLanguageStore((s) => s.lang);
  const t = (key: keyof typeof translations["uz-Latn"], params?: Record<string, string>) => {
    let str = translations[lang][key] ?? translations["uz-Latn"][key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      });
    }
    return str;
  };
  return { t, lang };
}
