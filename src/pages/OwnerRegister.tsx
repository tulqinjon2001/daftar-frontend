import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";
import { TelegramOtpNotice } from "../components/TelegramOtpNotice";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelect from "../components/LanguageSelect";
import { useRegisterStore } from "../stores/registerStore";
import { useProfileStore } from "../stores/profileStore";
import { resetShopScopedLists } from "../utils/resetShopStores";
import { api } from "../api/client";
import { useTranslation } from "../i18n/useTranslation";
import type { Translations } from "../i18n/translations";
import {
  validatePhone,
  validatePassword,
  validateRequired,
  normalizePhoneForApi,
  formatPhoneDisplay,
} from "../utils/validation";

export default function OwnerRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const store = useRegisterStore();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(store.fullName);
  const [phone, setPhone] = useState(store.phone);
  const [password, setPassword] = useState(store.password);
  const [showPassword, setShowPassword] = useState(false);

  const handleStep1 = () => {
    setError("");
    const nameErr = validateRequired(fullName, t("fullNameLabel"));
    const phoneErr = validatePhone(phone);
    const passErr = validatePassword(password);
    if (nameErr || phoneErr || passErr) {
      setError([nameErr, phoneErr, passErr].filter(Boolean).join(". "));
      return;
    }
    store.setStep1({ fullName: fullName.trim(), phone, password });
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col px-4 sm:px-6 pt-4 pb-8">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-sm">
          <ThemeToggle />
          <LanguageSelect />
        </div>
      </div>

      <div className="max-w-md w-full mx-auto flex flex-col flex-1 mt-6 sm:mt-12 justify-center">
        <div className="w-full rounded-[2rem] bg-white dark:bg-slate-800/95 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 px-5 sm:px-8 py-7 sm:py-10">
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(step - 1) : navigate("/"))}
              className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 active:scale-95 transition-all shrink-0"
              aria-label={t("back")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="flex-1 text-center font-bold text-lg text-slate-800 dark:text-slate-100">
              {step === 1 ? t("registerTitle") : step === 2 ? t("stepShop") : t("stepVerify")}
            </h1>
            <div className="w-10 shrink-0" aria-hidden />
          </div>

          <Stepper step={step} total={3} />

          {error && (
            <p className="mt-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-xl" role="alert">
              {error}
            </p>
          )}

          {step === 1 && (
            <>
              <h2 className="text-lg sm:text-xl font-bold mt-5 mb-1.5 text-slate-800 dark:text-slate-100">
                {t("personalTitle")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6">
                {t("personalSubtitle")}
              </p>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
                {t("fullNameLabel")}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("fullNamePlaceholder")}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary dark:focus:border-app-primary text-sm font-medium mb-4"
              />
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
                {t("phoneLabel")}
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-app-primary/40 focus-within:border-app-primary dark:focus-within:border-app-primary transition-shadow">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">+998</span>
                <input
                  type="tel"
                  value={formatPhoneDisplay(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="90 123 45 67"
                  className="flex-1 min-w-0 ml-2 bg-transparent py-0.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm font-medium"
                />
              </div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
                {t("createPasswordLabel")}
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 mb-6 focus-within:ring-2 focus-within:ring-app-primary/40 focus-within:border-app-primary dark:focus-within:border-app-primary transition-shadow">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("minChars")}
                  className="flex-1 min-w-0 bg-transparent py-0.5 px-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm font-medium"
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
              <button
                type="button"
                onClick={handleStep1}
                className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-app-primary/20 hover:brightness-105 active:scale-[0.98] transition-all duration-200 bg-app-primary"
              >
                {t("next")}
              </button>
            </>
          )}

          {step === 2 && (
            <Step2
              t={t}
              onNext={() => setStep(3)}
              onError={setError}
              loading={loading}
              setLoading={setLoading}
            />
          )}

          {step === 3 && (
            <Step3
              t={t}
              onSuccess={() => navigate("/dashboard")}
              onError={setError}
              loading={loading}
              setLoading={setLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Step2({
  t,
  onNext,
  onError,
  loading,
  setLoading: _setLoading,
}: {
  t: (key: keyof Translations, params?: Record<string, string>) => string;
  onNext: () => void;
  onError: (s: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const store = useRegisterStore();
  const [shopName, setShopName] = useState(store.shopName);
  const [address, setAddress] = useState(store.address);
  const [openAt, setOpenAt] = useState(store.openAt);
  const [closeAt, setCloseAt] = useState(store.closeAt);

  const handleStep2 = () => {
    onError("");
    const nameErr = validateRequired(shopName, t("shopNameLabel"));
    const addrErr = validateRequired(address, t("addressLabel"));
    if (nameErr || addrErr) {
      onError([nameErr, addrErr].filter(Boolean).join(". "));
      return;
    }
    store.setStep2({
      shopName: shopName.trim(),
      address: address.trim(),
      openAt: openAt.trim() || "09:00",
      closeAt: closeAt.trim() || "18:00",
    });
    onNext();
  };

  return (
    <>
      <h2 className="text-lg sm:text-xl font-bold mt-5 mb-1.5 text-slate-800 dark:text-slate-100">
        {t("shopTitle")}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6">
        {t("shopSubtitle")}
      </p>
      <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
        {t("shopNameLabel")}
      </label>
      <input
        type="text"
        value={shopName}
        onChange={(e) => setShopName(e.target.value)}
        placeholder={t("shopNamePlaceholder")}
        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary dark:focus:border-app-primary text-sm font-medium mb-4 transition-shadow"
      />
      <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
        {t("addressLabel")}
      </label>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={t("addressPlaceholder")}
        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary dark:focus:border-app-primary text-sm font-medium mb-4 transition-shadow"
      />
      <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200">
        {t("workingHours")}
      </label>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <input
          type="time"
          value={openAt || "09:00"}
          onChange={(e) => setOpenAt(e.target.value)}
          className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary dark:focus:border-app-primary font-medium [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
        <input
          type="time"
          value={closeAt || "18:00"}
          onChange={(e) => setCloseAt(e.target.value)}
          className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary dark:focus:border-app-primary font-medium [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        />
      </div>
      <button
        type="button"
        onClick={handleStep2}
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-app-primary/20 hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 bg-app-primary"
      >
        {t("next")}
      </button>
    </>
  );
}

function Step3({
  t,
  onSuccess,
  onError,
  loading,
  setLoading,
}: {
  t: (key: keyof Translations, params?: Record<string, string>) => string;
  onSuccess: () => void;
  onError: (s: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const store = useRegisterStore();
  const [code, setCode] = useState("");
  const [displayedCode, setDisplayedCode] = useState("");
  const [telegramDeepLink, setTelegramDeepLink] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendCodeError, setSendCodeError] = useState("");
  const phone = normalizePhoneForApi(store.phone);

  const sendCode = async () => {
    setLoading(true);
    setSendCodeError("");
    onError("");
    const res = await api.sendOwnerCode(phone);
    setLoading(false);
    if (res.success) {
      setResendCooldown(60);
      setTelegramDeepLink(res.data?.telegramDeepLink ?? null);
      if (res.data?.code) setDisplayedCode(res.data.code);
      else setDisplayedCode("");
    } else {
      setSendCodeError(res.message || t("errorSendCode"));
      onError(res.message || t("errorSendCode"));
    }
  };

  useEffect(() => {
    let mounted = true;
    setSendCodeError("");
    (async () => {
      setLoading(true);
      onError("");
      const res = await api.sendOwnerCode(phone);
      if (!mounted) return;
      setLoading(false);
      if (res.success) {
        setResendCooldown(60);
        setTelegramDeepLink(res.data?.telegramDeepLink ?? null);
        if (res.data?.code) setDisplayedCode(res.data.code);
        else setDisplayedCode("");
      } else {
        setSendCodeError(res.message || t("errorSendCode"));
        onError(res.message || t("errorSendCode"));
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c: number) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const verifyAndRegister = async () => {
    if (code.length !== 6) {
      onError(t("errorCodeInvalid"));
      return;
    }
    setLoading(true);
    onError("");
    const verifyRes = await api.verifyOwnerCode(phone, code);
    if (!verifyRes.success) {
      setLoading(false);
      onError(verifyRes.message || t("errorCodeInvalid"));
      return;
    }
    const registerRes = await api.registerOwner({
      full_name: store.fullName,
      phone,
      password: store.password,
      shop_name: store.shopName,
      address: store.address,
      open_at: store.openAt || "09:00",
      close_at: store.closeAt || "18:00",
    });
    setLoading(false);
    if (registerRes.success && registerRes.data?.accessToken) {
      localStorage.setItem("accessToken", registerRes.data.accessToken);
      if (registerRes.data.refreshToken) {
        localStorage.setItem("refreshToken", registerRes.data.refreshToken);
      }
      const d = registerRes.data as { user: { id: string; name: string; phone: string }; shop: { id: string; name: string; address: string | null } };
      if (d.user && d.shop) {
        const phoneDigits = (d.user.phone ?? "").replace(/\D/g, "").slice(-9);
        useProfileStore.getState().setProfile({
          name: d.user.name ?? "",
          phone: phoneDigits,
          role: "Owner",
          shopName: d.shop.name ?? "",
          shopAddress: d.shop.address ?? "",
          userId: d.user.id ?? "",
          shopId: d.shop.id ?? "",
        });
        resetShopScopedLists();
      }
      store.reset();
      onSuccess();
    } else {
      onError(registerRes.message || t("errorUpdatePassword"));
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold mt-7 mb-1 text-center text-slate-800 dark:text-slate-100">
        {t("otpTitle")}
      </h2>
      <TelegramOtpNotice className="mb-4" />
      {telegramDeepLink ? (
        <div className="mb-6">
          <a
            href={telegramDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-[#0088cc] hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            {t("openTelegramBot")}
          </a>
        </div>
      ) : null}
      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 text-center text-2xl tracking-widest placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/40 mb-4 font-medium"
      />
      {resendCooldown > 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-4">
          {t("resendIn")}: {Math.floor(resendCooldown / 60)}:{String(resendCooldown % 60).padStart(2, "0")}
        </p>
      ) : (
        <button
          type="button"
          onClick={sendCode}
          disabled={loading}
          className="w-full text-app-primary text-sm font-semibold mb-4 hover:underline"
        >
          {t("resendCode")}
        </button>
      )}
      <button
        type="button"
        onClick={verifyAndRegister}
        disabled={loading || code.length !== 6}
        className="w-full py-4 rounded-xl font-bold text-white shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 bg-app-primary"
      >
        {loading ? t("saving") : t("verifyAndContinue")}
      </button>

      {displayedCode ? (
        <p className="text-center mt-6 px-4 py-4 rounded-xl bg-app-primary/10 dark:bg-app-primary/20 border border-app-primary/25 dark:border-app-primary/35">
          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{t("sentCodeLabel")}: </span>
          <span className="text-app-primary-dark dark:text-app-primary font-bold text-xl tracking-widest">{displayedCode}</span>
        </p>
      ) : sendCodeError ? (
        <p className="text-center mt-6 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-sm">
          {sendCodeError === "Network error" || sendCodeError.includes("Failed")
            ? "Backend ishga tushirilganligini tekshiring. Telegram OTP uchun .env da TELEGRAM_BOT_TOKEN va TELEGRAM_BOT_USERNAME, shuningdek webhook (HTTPS) kerak."
            : sendCodeError}
        </p>
      ) : null}
    </>
  );
}
