import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";
import { TelegramOtpNotice } from "../components/TelegramOtpNotice";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelect from "../components/LanguageSelect";
import { api } from "../api/client";
import { useTranslation } from "../i18n/useTranslation";
import { formatPhoneDisplay } from "../utils/validation";

function normalizePhone(phone: string) {
  return "+998" + phone.replace(/\D/g, "").slice(0, 9);
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [telegramDeepLink, setTelegramDeepLink] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phoneFull = normalizePhone(phone);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const sendCode = async () => {
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 9) {
      setError(t("errorPhoneInvalid"));
      return;
    }
    setLoading(true);
    const res = await api.sendResetCode(phoneFull);
    setLoading(false);
    if (res.success) {
      setResendCooldown(120);
      setTelegramDeepLink(res.data?.telegramDeepLink ?? null);
      setDevOtpCode(res.data?.code ?? null);
      setStep(2);
    } else {
      setError(res.message || t("errorSendCode"));
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) {
      setError(t("errorCodeInvalid"));
      return;
    }
    setError("");
    setLoading(true);
    const res = await api.verifyResetCode(phoneFull, code);
    setLoading(false);
    if (res.success) {
      setStep(3);
    } else {
      setError(res.message || t("errorCodeInvalid"));
    }
  };

  const submitNewPassword = async () => {
    setError("");
    if (newPassword.length < 8) {
      setError(t("errorPasswordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("errorPasswordsMismatch"));
      return;
    }
    setLoading(true);
    const res = await api.setNewPassword({ phone: phoneFull, code, newPassword });
    setLoading(false);
    if (res.success) {
      navigate("/", { state: { message: t("passwordUpdated") } });
    } else {
      setError(res.message || t("errorUpdatePassword"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col px-4 sm:px-6 pt-5 pb-10">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-sm">
          <ThemeToggle />
          <LanguageSelect />
        </div>
      </div>

      <div className="max-w-md w-full mx-auto flex flex-col flex-1 mt-10 sm:mt-14">
        <div className="flex-1 w-full rounded-3xl bg-white dark:bg-slate-800/95 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex items-center justify-between mb-6">
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
              {step === 1 ? t("resetTitle") : step === 2 ? t("confirmTitle") : t("newPasswordTitle")}
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
              <h2 className="text-xl font-bold mt-7 mb-1 text-slate-800 dark:text-slate-100">
                {t("resetTitle")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-7">
                {t("resetSubtitle")}
              </p>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                {t("phoneLabel")}
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 mb-6 focus-within:ring-2 focus-within:ring-app-primary/40 focus-within:border-app-primary dark:focus-within:border-app-primary transition-shadow">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">+998</span>
                <input
                  type="tel"
                  value={formatPhoneDisplay(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="90 123 45 67"
                  className="flex-1 min-w-0 ml-2 py-0.5 placeholder-slate-400 focus:outline-none bg-transparent text-slate-800 dark:text-slate-100 font-medium"
                />
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V21a2 2 0 01-2 2h-2C7.82 23 2 17.18 2 10V8a2 2 0 012-2z" />
                </svg>
              </div>
              <button
                type="button"
                onClick={sendCode}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-app-primary/25 hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 bg-app-primary"
              >
                {loading ? t("sending") : t("sendCode")} →
              </button>
              <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-10">
                {t("needHelp")}{" "}
                <a href="/support" className="font-semibold text-app-primary hover:underline">
                  {t("support")}
                </a>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold mt-7 mb-1 text-center text-slate-800 dark:text-slate-100">
                {t("confirmTitle")}
              </h2>
              <TelegramOtpNotice className="mb-4 mx-auto max-w-sm" />
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
              {devOtpCode ? (
                <p className="text-center text-xs text-amber-700 dark:text-amber-300 mb-4 px-2">
                  Dev: {devOtpCode}
                </p>
              ) : null}
              <div className="flex justify-center gap-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code[i] ?? ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 1);
                      const next = code.split("");
                      next[i] = v;
                      setCode(next.join(""));
                      if (v && i < 5) otpRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !code[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-app-primary/40 text-slate-800 dark:text-slate-100"
                  />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-1">{t("didntReceiveCode")}</p>
              {resendCooldown > 0 ? (
                <p className="text-center text-sm mb-6 text-app-primary font-medium">
                  {t("resendCode")} {Math.floor(resendCooldown / 60)}:{String(resendCooldown % 60).padStart(2, "0")}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={sendCode}
                  disabled={loading}
                  className="text-center text-sm mb-6 font-semibold text-app-primary hover:underline"
                >
                  {t("resendCode")}
                </button>
              )}
              <button
                type="button"
                onClick={verifyCode}
                disabled={loading || code.length !== 6}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-app-primary/25 hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 bg-app-primary"
              >
                {t("confirmButton")}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold mt-7 mb-1 text-center text-slate-800 dark:text-slate-100">
                {t("newPasswordTitle")}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-7">
                {t("newPasswordSubtitle")}
              </p>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                {t("newPasswordLabel")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("minChars")}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary dark:focus:border-app-primary placeholder-slate-400 text-slate-800 dark:text-slate-100 font-medium"
              />
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
                {t("repeatPasswordLabel")}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("repeatPasswordPlaceholder")}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 mb-8 focus:outline-none focus:ring-2 focus:ring-app-primary/40 focus:border-app-primary dark:focus:border-app-primary placeholder-slate-400 text-slate-800 dark:text-slate-100 font-medium"
              />
              <button
                type="button"
                onClick={submitNewPassword}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-app-primary/25 hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 bg-app-primary"
              >
                {loading ? t("saving") : t("updatePassword")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
