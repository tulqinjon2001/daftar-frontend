import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPhoneDisplay, validatePhone, validateRequired } from "../utils/validation";
import { useClientStore } from "../stores/clientStore";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AmountInput } from "../components/AmountInput";
import { useTranslation } from "../i18n/useTranslation";

export default function AddClient() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addClient = useClientStore((s) => s.addClient);
  const shopId = useProfileStore((s) => s.shopId);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const duplicatePhoneMsg = t("duplicateClientPhone");
  const isDuplicatePhoneWarning = error.includes(duplicatePhoneMsg);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    const errors: string[] = [];
    const nameErr = validateRequired(fullName, "F.I.O.");
    if (nameErr) errors.push(nameErr);
    const phoneErr = validatePhone(phone);
    if (phoneErr) errors.push(phoneErr);
    if (errors.length) {
      setError(errors.join(". "));
      return;
    }

    setError("");
    setLoading(true);
    const trimmedName = fullName.trim();
    const initials =
      trimmedName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("") || "MJ";
    const phoneDigits = phone.replace(/\D/g, "").slice(0, 9);
    if (shopId) {
      const res = await api.createClient({
        name: trimmedName,
        phone: phoneDigits,
        initialDebt: amount,
        dueDate: dueDate || undefined,
      });
      setLoading(false);
      if (res.success && res.data?.client) {
        const c = res.data.client;
        addClient({
          id: c.id,
          name: c.name,
          phone: c.phone,
          debt: c.debt,
          dueDate: c.dueDate || "",
          status: null,
          initials,
          backendId: c.id,
        });
        navigate("/clients", { replace: true });
      } else {
        const message = res.message || "Mijoz qo‘shib bo‘lmadi";
        setError(message === "Bu raqam allaqachon qo'shilgan" ? t("duplicateClientPhone") : message);
      }
    } else {
      const id = Date.now().toString();
      addClient({
        id,
        name: trimmedName,
        phone: "+998 " + formatPhoneDisplay(phone),
        debt: String(amount),
        dueDate: dueDate || "",
        status: null,
        initials,
      });
      setLoading(false);
      navigate("/clients", { replace: true });
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 9));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col px-4 sm:px-6 pt-5 pb-20">
      {/* Header */}
      <header className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/clients"))}
          className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Orqaga"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg text-slate-800 dark:text-slate-100">
          Yangi mijoz qo'shish
        </h1>
        <div className="w-10" aria-hidden />
      </header>

      <main className="max-w-md w-full mx-auto flex-1">
        <div className="rounded-3xl bg-white dark:bg-slate-800/95 shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-700/50 px-6 sm:px-8 py-7 sm:py-8">
          {/* Info banner */}
          <div className="mb-6 rounded-2xl bg-app-primary/10 dark:bg-app-primary/15 border border-app-primary/25 dark:border-app-primary/30 px-4 py-3 text-sm text-app-primary-dark dark:text-app-primary">
            Mijoz ma'lumotlarini va qarz miqdorini aniq kiriting. Bu ma'lumotlar hisobotlarda aks etadi.
          </div>

          {error && (
            <p
              className={
                isDuplicatePhoneWarning
                  ? "mb-4 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 px-4 py-3 rounded-xl"
                  : "mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl"
              }
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                F.I.O.
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-slate-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM6 21v-1a5 5 0 015-5h2a5 5 0 015 5v1" />
                </svg>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Mijozning to'liq ismi"
                  className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Telefon raqami
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">+998</span>
                <input
                  type="tel"
                  value={formatPhoneDisplay(phone)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="90 123 45 67"
                  className="flex-1 ml-2 bg-transparent py-0.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
                />
                <svg className="w-5 h-5 text-slate-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V21a2 2 0 01-2 2h-2C7.82 23 2 17.18 2 10V8a2 2 0 012-2z" />
                </svg>
              </div>
            </div>

            {/* Debt amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Qarz miqdori
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-red-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v2m-7-8a7 7 0 1114 0 7 7 0 01-14 0z" />
                </svg>
                <AmountInput
                  value={amount}
                  onChange={setAmount}
                  placeholder="0"
                  className="flex-1 min-w-0 text-sm border-0 focus:ring-0 bg-transparent"
                />
                <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                  UZS
                </span>
              </div>
              <p className="mt-1 text-xs text-red-500">
                Mijozning boshlang'ich qarzdorligi
              </p>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Qaytarish muddati
              </label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
                <svg className="w-5 h-5 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Izoh (ixtiyoriy)
              </label>
              <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Qo'shimcha ma'lumotlar..."
                  className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-4 rounded-xl font-bold text-white shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed bg-app-primary"
            >
              Saqlash
            </button>
          </form>
        </div>
      </main>
      <BottomNav activeTab="clients" />
    </div>
  );
}

