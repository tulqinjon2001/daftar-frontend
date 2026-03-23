import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { formatPhoneDisplay } from "../utils/validation";
import { useSupplierStore } from "../stores/supplierStore";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";

export default function AddSupplier() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addSupplier = useSupplierStore((s) => s.addSupplier);
  const shopId = useProfileStore((s) => s.shopId);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, "").slice(0, 9));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const trimmedName = (name || "").trim();
    if (!trimmedName) {
      setError("Yetkazuvchi nomini kiriting");
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "").trim().slice(-9);
    const phoneForApi = phoneDigits.length === 9 ? "+998" + phoneDigits : undefined;
    setError("");
    setLoading(true);

    if (shopId) {
      const res = await api.createSupplier({
        name: trimmedName,
        phone: phoneForApi,
      });
      setLoading(false);
      if (res.success && res.data?.supplier) {
        const s = res.data.supplier;
        addSupplier({
          id: s.id,
          name: s.name,
          phone: s.phone,
          debt: s.debt,
          dueDate: s.dueDate || "",
          dateInfo: s.dateInfo || "",
          debtId: s.debtId,
          backendId: s.id,
        });
        navigate("/suppliers", { replace: true });
      } else {
        setError(res.message || "Yetkazuvchi qo'shib bo'lmadi");
      }
    } else {
      const id = Date.now().toString();
      const displayPhone = phoneDigits.length === 9 ? "+998 " + formatPhoneDisplay(phoneDigits) : undefined;
      addSupplier({
        id,
        name: trimmedName,
        phone: displayPhone,
        debt: "0",
        dueDate: "",
        dateInfo: new Date().toISOString().slice(0, 10).split("-").reverse().join("."),
        debtId: null,
      });
      setLoading(false);
      navigate("/suppliers", { replace: true });
    }
  };

  return (
    <AppPage>
      <AppHeader title={t("addSupplier")} backFallback="/suppliers" />

      <main className="flex-1 px-4 py-6">
        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t("supplierNamePlaceholder")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Ideal Savdo MCHJ"
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-app-primary/50 focus:border-app-primary text-sm transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Telefon raqami (ixtiyoriy)
            </label>
            <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-app-primary/50 focus-within:border-app-primary transition-shadow">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">+998</span>
              <input
                type="tel"
                value={formatPhoneDisplay(phone)}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="90 123 45 67"
                className="flex-1 ml-2 bg-transparent py-0.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm min-w-0"
              />
              <svg className="w-5 h-5 text-slate-400 ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V21a2 2 0 01-2 2h-2C7.82 23 2 17.18 2 10V8a2 2 0 012-2z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-white shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 text-sm hover:brightness-105 active:scale-[0.98] transition-all bg-app-primary"
            >
              {loading ? t("saving") : t("save")}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </form>
      </main>
      <BottomNav activeTab="suppliers" />
    </AppPage>
  );
}
