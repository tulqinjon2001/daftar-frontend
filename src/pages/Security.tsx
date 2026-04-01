import { useState, useEffect, useRef, type MutableRefObject } from "react";
import { api } from "../api/client";
import { useTranslation } from "../i18n/useTranslation";
import { formatPhoneDisplay } from "../utils/validation";
import { useProfileStore } from "../stores/profileStore";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { TelegramOtpNotice } from "../components/TelegramOtpNotice";

function fullPhone(digits9: string) {
  return "+998" + digits9.replace(/\D/g, "").slice(0, 9);
}

function OtpRow({
  code,
  setCode,
  otpRefs,
}: {
  code: string;
  setCode: (s: string) => void;
  otpRefs: MutableRefObject<(HTMLInputElement | null)[]>;
}) {
  return (
    <div className="flex justify-center gap-2 mt-4 mb-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => {
            otpRefs.current[i] = el;
          }}
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
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-app-primary/40 text-slate-800 dark:text-slate-100"
        />
      ))}
    </div>
  );
}

function OtpModal({
  open,
  title,
  hint,
  code,
  setCode,
  otpRefs,
  telegramLink,
  devCode,
  cooldown,
  onResend,
  resending,
  onClose,
  onConfirm,
  confirming,
  confirmLabel,
  openTelegramLabel,
  resendLabel,
  savingLabel,
}: {
  open: boolean;
  title: string;
  hint: string;
  code: string;
  setCode: (s: string) => void;
  otpRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  telegramLink: string | null;
  devCode: string | null;
  cooldown: number;
  onResend: () => void;
  resending: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirming: boolean;
  confirmLabel: string;
  openTelegramLabel: string;
  resendLabel: string;
  savingLabel: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button className="absolute inset-0 bg-black/45" aria-label="close" onClick={onClose} />
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-800 p-4 sm:p-5 shadow-2xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300">{hint}</p>
        {telegramLink ? (
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-[#0088cc] hover:brightness-110"
          >
            {openTelegramLabel}
          </a>
        ) : null}
        {devCode ? (
          <p className="text-center text-xs text-amber-700 dark:text-amber-300 mt-2">Dev: {devCode}</p>
        ) : null}
        <OtpRow code={code} setCode={setCode} otpRefs={otpRefs} />
        {cooldown > 0 ? (
          <p className="text-center text-sm text-app-primary font-medium mb-3">
            {resendLabel} {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={resending}
            className="w-full py-2 text-sm font-semibold text-app-primary mb-3"
          >
            {resendLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming || code.length !== 6}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-app-primary hover:brightness-105 active:scale-[0.99] disabled:opacity-60"
        >
          {confirming ? savingLabel : confirmLabel}
        </button>
      </div>
    </div>
  );
}

export default function Security() {
  const { t } = useTranslation();
  const name = useProfileStore((s) => s.name);
  const phone = useProfileStore((s) => s.phone);
  const shopName = useProfileStore((s) => s.shopName);
  const shopAddress = useProfileStore((s) => s.shopAddress);
  const userId = useProfileStore((s) => s.userId);
  const shopId = useProfileStore((s) => s.shopId);
  const role = useProfileStore((s) => s.role);
  const setProfile = useProfileStore((s) => s.setProfile);

  const pwdOtpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdCode, setPwdCode] = useState("");
  const [pwdTelegram, setPwdTelegram] = useState<string | null>(null);
  const [pwdDevCode, setPwdDevCode] = useState<string | null>(null);
  const [pwdCooldown, setPwdCooldown] = useState(0);
  const [pwdSending, setPwdSending] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdOk, setPwdOk] = useState("");

  const [newPhoneDigits, setNewPhoneDigits] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneTelegram, setPhoneTelegram] = useState<string | null>(null);
  const [phoneDevCode, setPhoneDevCode] = useState<string | null>(null);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneConfirming, setPhoneConfirming] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [phoneOk, setPhoneOk] = useState("");
  const [otpModal, setOtpModal] = useState<"password" | "phone" | null>(null);

  const mapCurrentPasswordError = (message?: string) => {
    if (!message) return t("errorSendCode");
    const normalized = message.trim().toLowerCase();
    if (
      normalized === "currentpassword kerak" ||
      normalized === "joriy parol kerak"
    ) {
      return t("errorCurrentPasswordRequired");
    }
    if (normalized === "joriy parol noto'g'ri") {
      return t("errorCurrentPasswordWrong");
    }
    return message;
  };

  const newPhoneFull = fullPhone(newPhoneDigits);
  const displayCurrent = phone ? "+998 " + formatPhoneDisplay(phone) : "—";

  useEffect(() => {
    if (pwdCooldown <= 0) return;
    const t = setInterval(() => setPwdCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [pwdCooldown]);

  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const t = setInterval(() => setPhoneCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [phoneCooldown]);

  useEffect(() => {
    if (!otpModal) return;
    const refs = otpModal === "password" ? pwdOtpRefs.current : phoneOtpRefs.current;
    const tm = setTimeout(() => refs[0]?.focus(), 120);
    return () => clearTimeout(tm);
  }, [otpModal]);

  const sendPwdOtp = async () => {
    setPwdError("");
    setPwdOk("");
    if (!currentPassword) {
      setPwdError(t("errorCurrentPasswordRequired"));
      return;
    }
    setPwdSending(true);
    const res = await api.sendChangePasswordCode(currentPassword);
    setPwdSending(false);
    if (res.success) {
      setPwdCooldown(120);
      setPwdTelegram(res.data?.telegramDeepLink ?? null);
      setPwdDevCode(res.data?.code ?? null);
      setPwdCode("");
      setOtpModal("password");
    } else {
      setPwdError(mapCurrentPasswordError(res.message));
    }
  };

  const submitPwdChange = async () => {
    setPwdError("");
    setPwdOk("");
    if (newPassword.length < 8) {
      setPwdError(t("errorPasswordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(t("errorPasswordsMismatch"));
      return;
    }
    if (pwdCode.length !== 6) {
      setPwdError(t("errorCodeInvalid"));
      return;
    }
    setPwdSaving(true);
    const res = await api.changePassword({
      currentPassword,
      newPassword,
      code: pwdCode,
    });
    setPwdSaving(false);
    if (res.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwdCode("");
      setPwdTelegram(null);
      setPwdDevCode(null);
      setPwdError("");
      setPwdOk(res.message || t("passwordUpdated"));
      setOtpModal(null);
    } else {
      setPwdError(res.message || t("errorUpdatePassword"));
    }
  };

  const sendPhoneOtp = async () => {
    setPhoneError("");
    setPhoneOk("");
    const d = newPhoneDigits.replace(/\D/g, "");
    if (d.length !== 9 || !/^9[0-9]/.test(d)) {
      setPhoneError(t("errorPhoneInvalid"));
      return;
    }
    setPhoneSending(true);
    const res = await api.sendPhoneChangeCode(newPhoneFull);
    setPhoneSending(false);
    if (res.success) {
      setPhoneCooldown(120);
      setPhoneTelegram(res.data?.telegramDeepLink ?? null);
      setPhoneDevCode(res.data?.code ?? null);
      setPhoneCode("");
      setOtpModal("phone");
    } else {
      setPhoneError(res.message || t("errorSendCode"));
    }
  };

  const confirmPhone = async () => {
    setPhoneError("");
    setPhoneOk("");
    if (phoneCode.length !== 6) {
      setPhoneError(t("errorCodeInvalid"));
      return;
    }
    setPhoneConfirming(true);
    const res = await api.confirmPhoneChange(newPhoneFull, phoneCode);
    setPhoneConfirming(false);
    if (res.success && res.data?.phone) {
      setProfile({
        name,
        phone: res.data.phone,
        shopName,
        shopAddress,
        userId,
        shopId,
      });
      setNewPhoneDigits("");
      setPhoneCode("");
      setPhoneTelegram(null);
      setPhoneDevCode(null);
      setPhoneOk(res.message || "");
      setOtpModal(null);
    } else {
      setPhoneError(res.message || t("errorCodeInvalid"));
    }
  };

  return (
    <AppPage>
      <AppHeader title={t("security")} backFallback={role === "Customer" ? "/customer/profile" : "/profile"} />

      <main className="flex-1 px-4 py-6 space-y-8 pb-24">
        <TelegramOtpNotice />
        {/* Parol */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 p-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">
            {t("changePasswordSection")}
          </h2>
          {pwdError ? (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-xl mb-3" role="alert">
              {pwdError}
            </p>
          ) : null}
          {pwdOk ? (
            <p className="text-app-primary text-sm bg-app-primary/10 py-2 px-3 rounded-xl mb-3" role="status">
              {pwdOk}
            </p>
          ) : null}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200" htmlFor="sec-cur-pw">
                {t("currentPasswordLabel")}
              </label>
              <input
                id="sec-cur-pw"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-app-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200" htmlFor="sec-new-pw">
                {t("newPasswordLabel")}
              </label>
              <input
                id="sec-new-pw"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-app-primary/40"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-200" htmlFor="sec-rep-pw">
                {t("repeatPasswordLabel")}
              </label>
              <input
                id="sec-rep-pw"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-app-primary/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={sendPwdOtp}
            disabled={pwdSending}
            className="w-full mt-4 py-3.5 rounded-xl font-bold text-white bg-app-primary hover:brightness-105 active:scale-[0.99] disabled:opacity-60 transition-all shadow-lg shadow-app-primary/20"
          >
            {pwdSending ? t("sending") : t("sendCode")}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            Kodni yuborishdan keyin tasdiqlash oynasi ochiladi.
          </p>
        </section>

        {/* Telefon */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 p-4">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
            {t("changePhoneSection")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {t("phoneLabel")}: <span className="font-medium text-slate-700 dark:text-slate-200">{displayCurrent}</span>
          </p>
          {phoneError ? (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-xl mb-3" role="alert">
              {phoneError}
            </p>
          ) : null}
          {phoneOk ? (
            <p className="text-app-primary text-sm bg-app-primary/10 py-2 px-3 rounded-xl mb-3" role="status">
              {phoneOk}
            </p>
          ) : null}
          <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">{t("phoneLabel")}</label>
          <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 mb-4 focus-within:ring-2 focus-within:ring-app-primary/40">
            <span className="text-slate-500 text-sm font-medium">+998</span>
            <input
              type="tel"
              inputMode="numeric"
              value={formatPhoneDisplay(newPhoneDigits)}
              onChange={(e) => setNewPhoneDigits(e.target.value.replace(/\D/g, "").slice(0, 9))}
              placeholder="90 123 45 67"
              className="flex-1 min-w-0 ml-2 py-0.5 bg-transparent text-slate-800 dark:text-slate-100 font-medium focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={sendPhoneOtp}
            disabled={phoneSending}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-app-primary hover:brightness-105 active:scale-[0.99] disabled:opacity-60 shadow-lg shadow-app-primary/20"
          >
            {phoneSending ? t("sending") : t("sendCode")}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            Kodni yuborishdan keyin tasdiqlash oynasi ochiladi.
          </p>
        </section>
      </main>
      <OtpModal
        open={otpModal === "password"}
        title={t("changePasswordSection")}
        hint={t("otpTelegramHint")}
        code={pwdCode}
        setCode={setPwdCode}
        otpRefs={pwdOtpRefs}
        telegramLink={pwdTelegram}
        devCode={pwdDevCode}
        cooldown={pwdCooldown}
        onResend={sendPwdOtp}
        resending={pwdSending}
        onClose={() => setOtpModal(null)}
        onConfirm={submitPwdChange}
        confirming={pwdSaving}
        confirmLabel={t("updatePassword")}
        openTelegramLabel={t("openTelegramBot")}
        resendLabel={t("resendCode")}
        savingLabel={t("saving")}
      />
      <OtpModal
        open={otpModal === "phone"}
        title={t("changePhoneSection")}
        hint={t("otpTelegramHint")}
        code={phoneCode}
        setCode={setPhoneCode}
        otpRefs={phoneOtpRefs}
        telegramLink={phoneTelegram}
        devCode={phoneDevCode}
        cooldown={phoneCooldown}
        onResend={sendPhoneOtp}
        resending={phoneSending}
        onClose={() => setOtpModal(null)}
        onConfirm={confirmPhone}
        confirming={phoneConfirming}
        confirmLabel={t("confirmButton")}
        openTelegramLabel={t("openTelegramBot")}
        resendLabel={t("resendCode")}
        savingLabel={t("saving")}
      />
    </AppPage>
  );
}
