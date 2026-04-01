import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPhoneDisplay, validatePhone, validateRequired } from "../utils/validation";
import { useClientStore } from "../stores/clientStore";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
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
    <AppPage>
      <AppHeader title="Yangi mijoz qo'shish" backFallback="/clients" />

      <main className="flex-1 px-4 py-6">
        <div className="mb-5 rounded-2xl bg-app-primary/10 dark:bg-app-primary/15 border border-app-primary/25 dark:border-app-primary/30 px-4 py-3 text-sm text-app-primary-dark dark:text-app-primary shadow-sm">
          Mijoz ma'lumotlarini va qarz miqdorini aniq kiriting. Bu ma'lumotlar hisobotlarda aks etadi.
        </div>

        {error && (
          <p
            className={
              isDuplicatePhoneWarning
                ? "mb-4 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 px-4 py-3 rounded-xl"
                : "mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-4 py-3 rounded-xl"
            }
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              F.I.O. <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-app-primary/50 focus-within:border-app-primary transition-shadow">
              <svg className="w-5 h-5 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM6 21v-1a5 5 0 015-5h2a5 5 0 015 5v1" />
              </svg>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mijozning to'liq ismi"
                className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm min-w-0"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Telefon raqami <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-app-primary/50 focus-within:border-app-primary transition-shadow">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">+998</span>
              <input
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="90 123 45 67"
                className="flex-1 ml-2 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm min-w-0"
              />
              <svg className="w-5 h-5 text-slate-400 shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V21a2 2 0 01-2 2h-2C7.82 23 2 17.18 2 10V8a2 2 0 012-2z" />
              </svg>
            </div>
          </div>

          {/* Debt amount */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Qarz miqdori
            </label>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-app-primary/50 focus-within:border-app-primary transition-shadow">
              <svg className="w-5 h-5 text-red-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 10v2m-7-8a7 7 0 1114 0 7 7 0 01-14 0z" />
              </svg>
              <AmountInput
                value={amount}
                onChange={setAmount}
                placeholder="0"
                className="flex-1 min-w-0 text-sm font-semibold border-0 focus:ring-0 bg-transparent"
              />
              <span className="ml-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                UZS
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              Mijozning boshlang'ich qarzdorligi
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Due date */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 truncate">
                Qaytarish muddati
              </label>
              <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-app-primary/50 focus-within:border-app-primary transition-shadow">
                <svg className="w-5 h-5 text-slate-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
            </div>
            
            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 truncate">
                Izoh (ixtiyoriy)
              </label>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-app-primary/50 focus-within:border-app-primary transition-shadow h-[46px] flex items-center">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Izoh..."
                  className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 flex items-center justify-center gap-2 rounded-xl font-bold text-white shadow-md hover:brightness-105 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed bg-app-primary"
            >
              {loading ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </main>
      <BottomNav activeTab="clients" />
    </AppPage>
  );
}

