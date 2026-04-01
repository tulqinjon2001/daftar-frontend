import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelect from "../components/LanguageSelect";
import { TelegramOtpNotice } from "../components/TelegramOtpNotice";
import { api } from "../api/client";
import { useProfileStore } from "../stores/profileStore";
import { formatPhoneDisplay, normalizePhoneForApi, validatePassword, validatePhone, validateRequired } from "../utils/validation";
import { useLanguageStore } from "../stores/languageStore";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const lang = useLanguageStore((s) => s.lang);
  const txt =
    lang === "ru"
      ? {
          title: "Регистрация обычного покупателя",
          namePh: "Имя Фамилия",
          passPh: "Пароль (минимум 8 символов)",
          next: "Далее",
          openTelegram: "Открыть Telegram-бот",
          verify: "Подтвердить и войти",
          back: "Назад",
          codeInvalid: "Введите 6-значный код",
          codeNotSent: "Код не отправлен",
          codeWrong: "Код неверный",
          registerErr: "Ошибка регистрации",
        }
      : lang === "en"
        ? {
            title: "Customer registration",
            namePh: "Full name",
            passPh: "Password (min 8 characters)",
            next: "Next",
            openTelegram: "Open Telegram bot",
            verify: "Verify and sign in",
            back: "Back",
            codeInvalid: "Enter 6-digit code",
            codeNotSent: "Code was not sent",
            codeWrong: "Invalid code",
            registerErr: "Registration failed",
          }
        : lang === "uz-Cyrl"
          ? {
              title: "Оддий харидор рўйхатдан ўтиши",
              namePh: "Исм Фамилия",
              passPh: "Парол (камида 8 белги)",
              next: "Кейинги",
              openTelegram: "Telegram ботни очиш",
              verify: "Тасдиқлаш ва кириш",
              back: "Орқага",
              codeInvalid: "6 хонали код киритинг",
              codeNotSent: "Код юборилмади",
              codeWrong: "Код нотўғри",
              registerErr: "Рўйхатдан ўтишда хато",
            }
          : {
              title: "Oddiy xaridor ro'yxatdan o'tishi",
              namePh: "Ism Familiya",
              passPh: "Parol (kamida 8 belgi)",
              next: "Keyingi",
              openTelegram: "Telegram botni ochish",
              verify: "Tasdiqlash va kirish",
              back: "Orqaga",
              codeInvalid: "6 xonali kod kiriting",
              codeNotSent: "Kod yuborilmadi",
              codeWrong: "Kod noto'g'ri",
              registerErr: "Ro'yxatdan o'tishda xato",
            };
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [telegramDeepLink, setTelegramDeepLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fullPhone = normalizePhoneForApi(phone);

  useEffect(() => {
    if (step !== 2) return;
    (async () => {
      setLoading(true);
      const res = await api.sendOwnerCode(fullPhone);
      setLoading(false);
      if (!res.success) {
        setError(res.message || txt.codeNotSent);
        return;
      }
      setTelegramDeepLink(res.data?.telegramDeepLink ?? null);
    })();
  }, [step, fullPhone]);

  const next = () => {
    const nameErr = validateRequired(fullName, txt.namePh);
    const phoneErr = validatePhone(phone);
    const passErr = validatePassword(password);
    if (nameErr || phoneErr || passErr) {
      setError([nameErr, phoneErr, passErr].filter(Boolean).join(". "));
      return;
    }
    setError("");
    setStep(2);
  };

  const verifyAndRegister = async () => {
    if (code.length !== 6) {
      setError(txt.codeInvalid);
      return;
    }
    setLoading(true);
    setError("");
    const verify = await api.verifyOwnerCode(fullPhone, code);
    if (!verify.success) {
      setLoading(false);
      setError(verify.message || txt.codeWrong);
      return;
    }
    const reg = await api.registerCustomer({
      full_name: fullName.trim(),
      phone: fullPhone,
      password,
    });
    setLoading(false);
    if (!reg.success || !reg.data?.accessToken) {
      setError(reg.message || txt.registerErr);
      return;
    }
    localStorage.setItem("accessToken", reg.data.accessToken);
    if (reg.data.refreshToken) localStorage.setItem("refreshToken", reg.data.refreshToken);
    const d = reg.data as { user: { id: string; name: string; phone: string; role: string } };
    useProfileStore.getState().setProfile({
      name: d.user?.name ?? "",
      phone: (d.user?.phone ?? "").replace(/\D/g, "").slice(-9),
      role: d.user?.role ?? "Customer",
      shopName: "",
      shopAddress: "",
      userId: d.user?.id ?? "",
      shopId: "",
    });
    navigate("/customer", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col px-4 sm:px-6 pt-4 pb-8">
      <div className="flex justify-end">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-sm">
          <ThemeToggle />
          <LanguageSelect />
        </div>
      </div>
      <div className="max-w-md w-full mx-auto flex flex-col flex-1 mt-6 sm:mt-12 justify-center">
        <div className="w-full rounded-[2rem] bg-white dark:bg-slate-800/95 shadow-xl border border-slate-100 dark:border-slate-700/50 px-5 sm:px-8 py-7 sm:py-10">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => (step === 1 ? navigate("/register") : setStep(1))}
              className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/80 active:scale-95 transition-all shrink-0"
              aria-label={txt.back}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-10 shrink-0" aria-hidden />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 text-center">
            {txt.title}
          </h1>
          {error ? <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p> : null}

          {step === 1 ? (
            <div className="mt-6 space-y-3">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={txt.namePh}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3"
              />
              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
                <span className="text-slate-500 text-sm">+998</span>
                <input
                  type="tel"
                  value={formatPhoneDisplay(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  className="flex-1 ml-2 bg-transparent focus:outline-none"
                />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={txt.passPh}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3"
              />
              <button
                type="button"
                onClick={next}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-app-primary"
              >
                {txt.next}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <TelegramOtpNotice />
              {telegramDeepLink ? (
                <a href={telegramDeepLink} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-3.5 rounded-xl font-semibold text-white bg-[#0088cc]">
                  {txt.openTelegram}
                </a>
              ) : null}
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-center text-2xl tracking-widest"
              />
              <button
                type="button"
                onClick={verifyAndRegister}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white bg-app-primary disabled:opacity-60"
              >
                {loading ? "..." : txt.verify}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
