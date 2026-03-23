import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../stores/themeStore";
import { useLanguageStore } from "../stores/languageStore";
import { useProfileStore } from "../stores/profileStore";
import { formatPhoneDisplay } from "../utils/validation";
import { useTranslation } from "../i18n/useTranslation";
import { LANG_LABELS, type LangCode } from "../i18n/translations";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { resetShopScopedLists } from "../utils/resetShopStores";

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const lang = useLanguageStore((s) => s.lang);
  const setLang = useLanguageStore((s) => s.setLang);
  const [langSheetOpen, setLangSheetOpen] = useState(false);
  const [pendingLang, setPendingLang] = useState<LangCode>(lang);

  const openLangSheet = () => {
    setPendingLang(lang);
    setLangSheetOpen(true);
  };
  const closeLangSheet = () => setLangSheetOpen(false);
  const saveLang = () => {
    setLang(pendingLang);
    setLangSheetOpen(false);
  };

  const name = useProfileStore((s) => s.name);
  const phone = useProfileStore((s) => s.phone);
  const shopName = useProfileStore((s) => s.shopName);
  const shopAddress = useProfileStore((s) => s.shopAddress);
  const userId = useProfileStore((s) => s.userId);
  const shopId = useProfileStore((s) => s.shopId);
  const setProfile = useProfileStore((s) => s.setProfile);
  const clearProfile = useProfileStore((s) => s.clear);
  const hydrateFromStorage = useProfileStore((s) => s.hydrateFromStorage);

  const [shopEditOpen, setShopEditOpen] = useState(false);
  const [editShopName, setEditShopName] = useState("");
  const [editShopAddress, setEditShopAddress] = useState("");

  const [personalEditOpen, setPersonalEditOpen] = useState(false);
  const [editPersonalName, setEditPersonalName] = useState("");
  const [personalEditError, setPersonalEditError] = useState("");

  const openShopEdit = () => {
    setEditShopName(shopName);
    setEditShopAddress(shopAddress);
    setShopEditOpen(true);
  };
  const closeShopEdit = () => setShopEditOpen(false);
  const saveShopEdit = () => {
    setProfile({
      name,
      phone,
      shopName: editShopName.trim(),
      shopAddress: editShopAddress.trim(),
      userId,
      shopId,
    });
    setShopEditOpen(false);
  };

  const openPersonalEdit = () => {
    setEditPersonalName(name);
    setPersonalEditError("");
    setPersonalEditOpen(true);
  };
  const closePersonalEdit = () => setPersonalEditOpen(false);
  const savePersonalEdit = () => {
    setPersonalEditError("");
    const trimmedName = editPersonalName.trim();
    if (!trimmedName) {
      setPersonalEditError(t("errorFullNameRequired"));
      return;
    }
    setProfile({
      name: trimmedName,
      phone,
      shopName,
      shopAddress,
      userId,
      shopId,
    });
    setPersonalEditOpen(false);
  };

  useEffect(() => {
    if (!name && !phone && !shopName && !shopAddress) {
      hydrateFromStorage();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    clearProfile();
    resetShopScopedLists();
    navigate("/", { replace: true });
  };

  const displayPhone = phone ? "+998 " + formatPhoneDisplay(phone) : "";

  return (
    <AppPage>
      <AppHeader title={t("profileTitle")} backFallback="/dashboard" />

      <main className="flex-1 px-4 py-6">
        {/* User info — orange tashqi, yashil ichki halqa */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 border-4 border-amber-200 dark:border-amber-900/50 ring-4 ring-app-primary/25 dark:ring-app-primary/30 ring-inset">
              <svg
                className="w-12 h-12 text-slate-400 dark:text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md bg-app-primary hover:brightness-110"
              aria-label={t("changeProfilePhoto")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
          <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {name || "—"}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {displayPhone || "—"}
          </p>
        </div>

        {/* Mening Do'konim — yashil fon, ro'yxatdan o'tish ma'lumotlari */}
        <div className="rounded-2xl p-4 mb-6 flex items-center gap-4 bg-app-primary/10 dark:bg-app-primary/15">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 bg-app-primary">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-800 dark:text-slate-100">
              {t("myShop")}
            </p>
            {shopName ? (
              <p className="text-sm text-slate-700 dark:text-slate-200 mt-0.5">
                {shopName}
              </p>
            ) : null}
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {shopAddress || "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={openShopEdit}
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white bg-app-primary hover:brightness-110 active:scale-95 transition-transform"
            aria-label="Do'kon ma'lumotlarini tahrirlash"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        </div>

        {/* Sozlamalar ro'yxati */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <ProfileRow
            icon="person"
            label={t("personalInfo")}
            onClick={openPersonalEdit}
            showArrow
          />
          <ProfileRow
            icon="gear"
            label={t("shopSettings")}
            onClick={() => {}}
            showArrow
          />
          <ProfileRow
            icon="ribbon"
            label={t("tariffPlan")}
            badge="PRO"
            onClick={() => {}}
            showArrow
          />
          <ProfileRow
            icon="shield"
            label={t("security")}
            onClick={() => navigate("/profile/security")}
            showArrow
          />
          {/* Tilni tanlash — bosilganda bottom sheet */}
          <div className="border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={openLangSheet}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 dark:text-slate-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path
                      d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                      strokeWidth={2}
                    />
                  </svg>
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {t("selectLanguage")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {LANG_LABELS[lang]}
                </span>
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
          {/* Mavzu — toggle switch (off = yorug') */}
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 dark:text-slate-500">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                  />
                </svg>
              </span>
              <span className="font-medium text-slate-800 dark:text-slate-100">
                {t("theme")}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={theme === "dark"}
              onClick={toggleTheme}
              className={`relative w-12 h-7 rounded-full transition-colors ${theme === "dark" ? "bg-app-primary" : "bg-slate-200 dark:bg-slate-600"}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${theme === "dark" ? "left-6" : "left-1"}`}
              />
            </button>
          </div>
          {/* Chiqish — ro'yxat ichida, qizil ikonka + qizil matn */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-slate-700 text-left hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <span className="text-red-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {t("logout")}
            </span>
          </button>
        </div>

        <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-8">{t("appVersion")}</p>
      </main>

      {/* Shaxsiy ma'lumotlarni tahrirlash — bottom sheet */}
      {personalEditOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closePersonalEdit}
            aria-hidden
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-50 max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="personal-edit-title"
          >
            <div className="pt-3 pb-safe">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto mb-4" />
              <div className="flex items-center justify-between px-4 mb-5">
                <h2
                  id="personal-edit-title"
                  className="text-lg font-bold text-slate-800 dark:text-slate-100"
                >
                  {t("personalInfo")}
                </h2>
                <button
                  type="button"
                  onClick={closePersonalEdit}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label={t("close")}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-4 space-y-4 pb-4">
                {personalEditError ? (
                  <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-xl" role="alert">
                    {personalEditError}
                  </p>
                ) : null}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200" htmlFor="edit-personal-name">
                    {t("fullNameLabel")}
                  </label>
                  <input
                    id="edit-personal-name"
                    type="text"
                    value={editPersonalName}
                    onChange={(e) => setEditPersonalName(e.target.value)}
                    placeholder={t("fullNamePlaceholder")}
                    autoComplete="name"
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary"
                  />
                </div>
                <div>
                  <p className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">{t("phoneLabel")}</p>
                  <p className="text-slate-800 dark:text-slate-100 font-medium mb-2">{displayPhone || "—"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t("phoneChangeViaSecurity")}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPersonalEditOpen(false);
                      navigate("/profile/security");
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-app-primary border-2 border-app-primary/40 hover:bg-app-primary/5 active:scale-[0.99] transition-all"
                  >
                    {t("changePhoneAction")}
                  </button>
                </div>
              </div>
              <div className="px-4 pb-6 pt-2">
                <button
                  type="button"
                  onClick={savePersonalEdit}
                  className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] bg-app-primary"
                >
                  {t("save")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Do'kon ma'lumotlarini tahrirlash — bottom sheet */}
      {shopEditOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeShopEdit}
            aria-hidden
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-50 max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-edit-title"
          >
            <div className="pt-3 pb-safe">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto mb-4" />
              <div className="flex items-center justify-between px-4 mb-5">
                <h2
                  id="shop-edit-title"
                  className="text-lg font-bold text-slate-800 dark:text-slate-100"
                >
                  {t("editShopTitle")}
                </h2>
                <button
                  type="button"
                  onClick={closeShopEdit}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label={t("close")}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-4 space-y-4 pb-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                    {t("shopNameLabel")}
                  </label>
                  <input
                    type="text"
                    value={editShopName}
                    onChange={(e) => setEditShopName(e.target.value)}
                    placeholder={t("shopNamePlaceholder")}
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                    {t("addressLabel")}
                  </label>
                  <input
                    type="text"
                    value={editShopAddress}
                    onChange={(e) => setEditShopAddress(e.target.value)}
                    placeholder={t("addressPlaceholder")}
                    className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary"
                  />
                </div>
              </div>
              <div className="px-4 pb-6 pt-2">
                <button
                  type="button"
                  onClick={saveShopEdit}
                  className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:brightness-105 active:scale-[0.98] bg-app-primary"
                >
                  {t("save")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tilni tanlash — bottom sheet */}
      {langSheetOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={closeLangSheet}
            aria-hidden
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-50 max-w-md mx-auto bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lang-sheet-title"
          >
            <div className="pt-3 pb-safe">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-600 mx-auto mb-4" />
              <div className="flex items-center justify-between px-4 mb-5">
                <h2
                  id="lang-sheet-title"
                  className="text-lg font-bold text-slate-800 dark:text-slate-100"
                >
                  {t("selectLanguage")}
                </h2>
                <button
                  type="button"
                  onClick={closeLangSheet}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  aria-label={t("close")}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="px-4 space-y-2 pb-4">
                {(["uz-Latn", "uz-Cyrl", "en", "ru"] as LangCode[]).map(
                  (code) => {
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
                          {code === "uz-Latn" || code === "uz-Cyrl"
                            ? "🇺🇿"
                            : code === "ru"
                              ? "🇷🇺"
                              : "🇬🇧"}
                        </span>
                        <span
                          className={`flex-1 font-medium ${selected ? "text-app-primary-dark dark:text-app-primary" : "text-slate-800 dark:text-slate-100"}`}
                        >
                          {LANG_LABELS[code]}
                        </span>
                        {selected ? (
                          <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-app-primary">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 shrink-0" />
                        )}
                      </button>
                    );
                  },
                )}
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

      <BottomNav activeTab="settings" />
    </AppPage>
  );
}

function ProfileRow({
  icon,
  label,
  badge,
  onClick,
  showArrow,
}: {
  icon: "person" | "gear" | "ribbon" | "shield";
  label: string;
  badge?: string;
  onClick: () => void;
  showArrow?: boolean;
}) {
  const iconPaths: Record<typeof icon, ReactNode> = {
    person: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
    gear: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </>
    ),
    ribbon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    ),
    shield: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    ),
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 border-t border-slate-100 dark:border-slate-700 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors first:border-t-0"
    >
      <div className="flex items-center gap-3">
        <span className="text-slate-400 dark:text-slate-500">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {iconPaths[icon]}
          </svg>
        </span>
        <span className="font-medium text-slate-800 dark:text-slate-100">
          {label}
        </span>
        {badge && (
          <span className="px-2 py-0.5 rounded-md text-xs font-bold text-white bg-app-primary">
            {badge}
          </span>
        )}
      </div>
      {showArrow && (
        <svg
          className="w-5 h-5 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </button>
  );
}
