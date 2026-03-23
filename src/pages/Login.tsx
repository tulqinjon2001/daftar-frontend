import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelect from "../components/LanguageSelect";
import { useTranslation } from "../i18n/useTranslation";
import { formatPhoneDisplay } from "../utils/validation";
import { api } from "../api/client";
import { useProfileStore } from "../stores/profileStore";
import { resetShopScopedLists } from "../utils/resetShopStores";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const successMessage = (location.state as { message?: string } | null)?.message;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "").slice(0, 9);
    if (digits.length !== 9) {
      setError(t("errorPhoneInvalid"));
      return;
    }
    if (!password || password.length < 8) {
      setError(t("errorPasswordMin"));
      return;
    }
    setLoading(true);
    const fullPhone = "998" + digits;
    const res = await api.login(fullPhone, password);
    setLoading(false);
    if (res.success && res.data?.accessToken) {
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }
      resetShopScopedLists();
      const d = res.data;
      if (d.user && (d.shop || d.user.role === "Owner")) {
        const phoneDigits = (d.user.phone ?? "").replace(/\D/g, "").slice(-9);
        useProfileStore.getState().setProfile({
          name: d.user.name ?? "",
          phone: phoneDigits,
          shopName: d.shop?.name ?? "",
          shopAddress: d.shop?.address ?? "",
          userId: d.user.id ?? "",
          shopId: d.shop?.id ?? "",
        });
      }
      navigate("/dashboard", { replace: true });
    } else {
      const msg = res.message === "Not found"
        ? t("errorApiNotFound")
        : (res.message || t("errorLogin"));
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col px-4 sm:px-6 max-[380px]:px-3 pt-5 max-[380px]:pt-3 pb-10 max-[380px]:pb-6">
      {/* Header: tema va til — bitta guruh */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-sm">
          <ThemeToggle />
          <LanguageSelect />
        </div>
      </div>

      <div className="max-w-md w-full mx-auto flex flex-col flex-1 mt-10 sm:mt-14 max-[380px]:mt-6">
        {/* Kartocha: logo + form */}
        <div className="flex-1 w-full rounded-3xl max-[380px]:rounded-2xl bg-white dark:bg-slate-800/95 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 px-6 sm:px-8 max-[380px]:px-4 py-8 sm:py-10 max-[380px]:py-5">
          {/* Logo */}
          <div className="flex justify-center mb-5 max-[380px]:mb-3">
            <div className="w-16 h-16 max-[380px]:w-14 max-[380px]:h-14 rounded-2xl flex items-center justify-center bg-app-primary/15 dark:bg-app-primary/25 ring-2 ring-app-primary/25 dark:ring-app-primary/35 shadow-inner">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-app-primary"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M8 10h8M8 14h5" />
              </svg>
            </div>
          </div>
          <h1 className="text-center text-2xl max-[380px]:text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-8 max-[380px]:mb-5">
            {t("appName")}
          </h1>

          <h2 className="text-xl max-[380px]:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
            {t("loginTitle")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-[380px]:text-xs mb-7 max-[380px]:mb-5">
            {t("loginSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col">
            {successMessage && (
              <p className="text-app-primary-dark dark:text-app-primary text-sm max-[380px]:text-xs mb-4 bg-app-primary/10 dark:bg-app-primary/20 py-3 max-[380px]:py-2.5 px-4 max-[380px]:px-3 rounded-xl border border-app-primary/25 dark:border-app-primary/35" role="status">
                {successMessage}
              </p>
            )}
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm max-[380px]:text-xs mb-4 bg-red-50 dark:bg-red-900/20 py-3 max-[380px]:py-2.5 px-4 max-[380px]:px-3 rounded-xl" role="alert">
                {error}
              </p>
            )}

            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              {t("phoneLabel")}
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 max-[380px]:px-3 py-3 max-[380px]:py-2.5 mb-4 max-[380px]:mb-3 focus-within:ring-2 focus-within:ring-app-primary/40 focus-within:border-app-primary dark:focus-within:border-app-primary transition-shadow">
              <svg
                className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V21a2 2 0 01-2 2h-2C7.82 23 2 17.18 2 10V8a2 2 0 012-2z" />
              </svg>
              <span className="text-slate-500 dark:text-slate-400 text-sm max-[380px]:text-xs font-medium">+998</span>
              <input
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="90 123 45 67"
                className="flex-1 min-w-0 ml-2 py-0.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none bg-transparent font-medium max-[380px]:text-sm"
              />
            </div>

            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              {t("passwordLabel")}
            </label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 max-[380px]:px-3 py-3 max-[380px]:py-2.5 mb-3 max-[380px]:mb-2 focus-within:ring-2 focus-within:ring-app-primary/40 focus-within:border-app-primary dark:focus-within:border-app-primary transition-shadow">
              <svg
                className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="flex-1 min-w-0 py-0.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none bg-transparent font-medium max-[380px]:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="p-2 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-600/50 transition-colors"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>
            <div className="flex justify-end mb-10 max-[380px]:mb-6 mt-2">
              <Link
                to="/forgot-password"
                className="text-sm max-[380px]:text-xs font-semibold text-app-primary hover:text-app-primary-dark dark:hover:text-app-primary hover:underline transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 max-[380px]:py-3.5 rounded-xl font-bold text-white shadow-lg shadow-app-primary/25 hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed bg-app-primary"
            >
              {loading ? "..." : t("loginButton")}
            </button>

            <p className="text-center text-slate-600 dark:text-slate-400 text-sm max-[380px]:text-xs mt-10 max-[380px]:mt-6">
              {t("noAccount")}{" "}
              <Link
                to="/register-owner"
                className="font-bold text-app-primary hover:text-app-primary-dark dark:hover:text-app-primary hover:underline transition-colors"
              >
                {t("register")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
