import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Supplier } from "../stores/supplierStore";
import { useSupplierStore } from "../stores/supplierStore";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { useTranslation } from "../i18n/useTranslation";
import { BottomNav } from "../components/BottomNav";
import { formatSum } from "../utils/amountFormat";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()] || "";
  const year = d.getFullYear();
  return `${day}-${month}, ${year}`;
}

export default function SupplierCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const state = (location.state as { supplier?: Supplier } | null) || null;
  const supplierFromState = state?.supplier;
  const suppliers = useSupplierStore((s) => s.suppliers);
  const updateSupplierDebt = useSupplierStore((s) => s.updateSupplierDebt);
  const supplier = supplierFromState
    ? suppliers.find((s) => s.id === supplierFromState.id) || supplierFromState
    : null;
  const shopId = useProfileStore((s) => s.shopId);

  const [history, setHistory] = useState<
    Array<{ date: string; createdAt: string; action: string; summa: number; isPayment: boolean; qoldiq: number | null }>
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [historyErrorMsg, setHistoryErrorMsg] = useState("");
  const [didAttemptFetch, setDidAttemptFetch] = useState(false);

  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!supplier?.id) {
      setLoadingHistory(false);
      return;
    }
    const supplierId = supplier.backendId || supplier.id;
    if (shopId || hasToken) {
      setHistoryError(false);
      setDidAttemptFetch(true);
      setLoadingHistory(true);
      api
        .getSupplierDebtHistory(supplierId)
        .then((res) => {
          setLoadingHistory(false);
          setHistoryError(!res.success);
          const isTokenError = res.message?.toLowerCase().includes("token") ?? false;
          setHistoryErrorMsg(isTokenError ? "Tizimga qayta kiring (sessiya tugadi)." : res.message || "");
          if (res.success && res.data?.history) {
            const list = res.data.history;
            setHistory(list);
            if (list.length > 0 && list[0].qoldiq != null && supplier?.id) {
              updateSupplierDebt(supplier.id, String(list[0].qoldiq));
            }
          } else setHistory([]);
        })
        .catch(() => {
          setLoadingHistory(false);
          setHistoryError(true);
          setHistoryErrorMsg("");
        });
    } else {
      setLoadingHistory(false);
      setDidAttemptFetch(false);
    }
  }, [supplier?.id, supplier?.backendId, shopId, hasToken, location.key]);

  if (!supplier) {
    navigate("/suppliers", { replace: true });
    return null;
  }

  const fromHistory = history.length > 0 && history[0].qoldiq != null ? history[0].qoldiq : null;
  const debtNum =
    fromHistory != null ? fromHistory : parseFloat(String(supplier.debt || "0").replace(/\s/g, "")) || 0;
  const lastPayment = history.find((r) => r.isPayment);
  const lastPaymentDate = lastPayment ? formatDate(lastPayment.createdAt) : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-20">
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 safe-area-inset-top">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/suppliers"))}
            className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("back")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center min-w-0 px-2">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
              {t("navSupplier")}: {supplier.name}
            </h1>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Joriy qarz miqdori */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Joriy qarz miqdori</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                -{formatSum(Math.abs(debtNum))} {t("currency")}
              </p>
              {lastPaymentDate && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Oxirgi to'lov: {lastPaymentDate}
                </p>
              )}
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              FAOL QARZ
            </span>
          </div>
        </section>

        {/* To'lov qilish / Qarz yozish */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/supplier-debt/pay", { state: { supplier } })}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 shadow-sm bg-app-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v1" />
            </svg>
            To'lov qilish
          </button>
          <button
            type="button"
            onClick={() => navigate("/supplier-debt/write", { state: { supplier } })}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-white bg-app-danger flex items-center justify-center gap-2 shadow-sm hover:brightness-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Qarz yozish
          </button>
        </div>

        {/* Amallar tarixi */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Amallar tarixi</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Saralash
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="py-2.5 px-3 font-semibold">Sana</th>
                  <th className="py-2.5 px-3 font-semibold">Amal</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Summa</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Qoldiq</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 dark:text-slate-400">
                      {t("loading")}
                    </td>
                  </tr>
                ) : historyError ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-amber-600 dark:text-amber-400 text-sm px-2">
                      {historyErrorMsg || "Tarix yuklanmadi. Internet va tizimga kirishni tekshiring."}
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 dark:text-slate-400">
                      {didAttemptFetch
                        ? "Hali amal kiritilmagan"
                        : "Amallar tarixi faqat tizimga kirgan va bazada saqlangan yetkazuvchilar uchun ko'rsatiladi."}
                    </td>
                  </tr>
                ) : (
                  history.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={
                            row.isPayment
                              ? "text-app-primary font-medium"
                              : "text-red-600 dark:text-red-400 font-medium"
                          }
                        >
                          {row.action}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-medium ${
                          row.isPayment ? "text-app-primary" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {row.isPayment ? `+${formatSum(Math.abs(row.summa))}` : `-${formatSum(Math.abs(row.summa))}`}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-medium ${
                          row.qoldiq != null && row.qoldiq < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {row.qoldiq != null
                          ? row.qoldiq === 0
                            ? "0"
                            : `-${formatSum(Math.abs(row.qoldiq))}`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <BottomNav activeTab="suppliers" />
    </div>
  );
}
