import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useThemeStore } from "../stores/themeStore";
import { useLanguageStore } from "../stores/languageStore";
import { useProfileStore } from "../stores/profileStore";
import { LANG_LABELS, type LangCode } from "../i18n/translations";
import { useTranslation } from "../i18n/useTranslation";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);
  const clearProfile = useProfileStore((s) => s.clear);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState<LangCode>(lang);

  const openLangSheet = () => {
    setPendingLang(lang);
    setLangSheetOpen(true);
  };
  const saveLang = () => {
    setLang(pendingLang);
    setLangSheetOpen(false);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    clearProfile();
    navigate("/", { replace: true });
  };

  return (
    <AppPage>
      <AppHeader title={t("profileTitle")} backFallback="/customer" />

      <main className="px-4 py-4">
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{t("tariffPlan")}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold text-white bg-app-primary">PRO</span>
            </div>
            <Chevron />
          </button>

          <button
            type="button"
            onClick={() => navigate("/customer/security")}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{t("security")}</span>
            </div>
            <Chevron />
          </button>

          <button
            type="button"
            onClick={openLangSheet}
            className="w-full flex items-center justify-between px-4 py-3.5 text-left border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{t("selectLanguage")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">{LANG_LABELS[lang]}</span>
              <Chevron />
            </div>
          </button>

          <div className="w-full flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{t("theme")}</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              onClick={toggleTheme}
              className={`relative w-12 h-7 rounded-full transition-colors ${theme === "dark" ? "bg-app-primary" : "bg-slate-200 dark:bg-slate-600"}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${theme === "dark" ? "left-6" : "left-1"}`} />
            </button>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-slate-700 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="text-red-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">{t("logout")}</span>
          </button>
        </div>
      </main>

      {langSheetOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setLangSheetOpen(false)}
            aria-hidden
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-50 max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-lang-sheet-title"
          >
            <div className="pt-3 pb-safe">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto mb-4" />
              <div className="flex items-center justify-between px-4 mb-5">
                <h2
                  id="customer-lang-sheet-title"
                  className="text-lg font-bold text-slate-800 dark:text-slate-100"
                >
                  {t("selectLanguage")}
                </h2>
                <button
                  type="button"
                  onClick={() => setLangSheetOpen(false)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label={t("close")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-4 space-y-2 pb-4">
                {(["uz-Latn", "uz-Cyrl", "en", "ru"] as LangCode[]).map((code) => {
                  const selected = pendingLang === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setPendingLang(code)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-colors ${
                        selected
                          ? "bg-app-primary/10 dark:bg-app-primary/20 border-2 border-app-primary dark:border-app-primary"
                          : "bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white dark:bg-slate-600 shadow-sm shrink-0">
                        {code === "uz-Latn" || code === "uz-Cyrl" ? "🇺🇿" : code === "ru" ? "🇷🇺" : "🇬🇧"}
                      </span>
                      <span className={`flex-1 font-medium ${selected ? "text-app-primary-dark dark:text-app-primary" : "text-slate-800 dark:text-slate-100"}`}>
                        {LANG_LABELS[code]}
                      </span>
                      {selected ? (
                        <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-app-primary">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="px-4 pb-6 pt-2">
                <button
                  type="button"
                  onClick={saveLang}
                  className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] bg-app-primary"
                >
                  {t("save")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </AppPage>
  );
}

function Chevron() {
  return (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
