import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useSettingsStore } from "../stores/settingsStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { PaymentMethodIcon } from "../components/PaymentMethodIcon";
import { AmountInput } from "../components/AmountInput";
import { formatSum } from "../utils/amountFormat";

export default function AddSale() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const calculateSales = useSettingsStore((s) => s.calculateSales);

  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [bank, setBank] = useState(0);
  const now = new Date();
  const [saleDate, setSaleDate] = useState(() => now.toISOString().slice(0, 10));
  const [saleTime, setSaleTime] = useState(() =>
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitLockRef = useRef(false);

  const total = cash + card + bank;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if (!calculateSales) {
      setError("Savdoni hisoblash sozlamada yoqilishi kerak");
      return;
    }
    if (total <= 0) {
      setError("Kamida bitta to'lov miqdorini kiriting");
      return;
    }
    setError("");
    submitLockRef.current = true;
    setSubmitting(true);
    const saleDateTime = `${saleDate}T${saleTime}:00`;
    try {
      const res = await api.addSale({
        cashAmount: cash,
        cardAmount: card,
        bankAmount: bank,
        saleDateTime,
        comment: comment.trim() || undefined,
      });
      if (res.success) {
        navigate("/dashboard");
        return;
      }
      setError(res.message || "Xatolik yuz berdi");
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <AppPage>
      <AppHeader title={t("addSaleTitle")} />

      <main className="flex-1 px-4 py-5">
        {!calculateSales && (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl mb-4">
            Savdoni hisoblash profil sozlamalarida yoqing.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {t("totalSalesAmountLabel")}
            </label>
            <p className="text-3xl font-bold py-3 text-app-primary">
              {formatSum(total)}
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t("paymentAmounts")}
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-app-primary/15 dark:bg-app-primary/25">
                  <PaymentMethodIcon type="CASH" className="w-6 h-6 text-app-primary" />
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-medium">{t("cash")}</span>
                <AmountInput
                  value={cash}
                  onChange={setCash}
                  className="flex-1 min-w-0 py-3 px-2 bg-transparent font-semibold border-0 focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30">
                  <PaymentMethodIcon type="CARD" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-medium">{t("card")}</span>
                <AmountInput
                  value={card}
                  onChange={setCard}
                  className="flex-1 min-w-0 py-3 px-2 bg-transparent font-semibold border-0 focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 overflow-hidden">
                <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30">
                  <PaymentMethodIcon type="BANK" className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-slate-700 dark:text-slate-200 font-medium">{t("bankAccount")}</span>
                <AmountInput
                  value={bank}
                  onChange={setBank}
                  className="flex-1 min-w-0 py-3 px-2 bg-transparent font-semibold border-0 focus:ring-0"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t("dateAndTime")}
            </h2>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
              <div className="flex-1 flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="time"
                  value={saleTime}
                  onChange={(e) => setSaleTime(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              {t("commentOptional")}
            </h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("saleCommentPlaceholder")}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || total <= 0 || !calculateSales}
            className="w-full py-3.5 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:pointer-events-none bg-app-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {submitting ? t("saving") : t("save")}
          </button>
        </form>
      </main>

      <BottomNav activeTab="main" />
    </AppPage>
  );
}
