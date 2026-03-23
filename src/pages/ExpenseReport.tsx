import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { DateRangePicker } from "../components/DateRangePicker";
import { PaymentMethodIcon } from "../components/PaymentMethodIcon";
import { formatSum, parseAmountString } from "../utils/amountFormat";
import { getDefaultMonthRange } from "../utils/dateRange";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

interface ExpenseItem {
  id: string;
  amount: string;
  category: string | null;
  description: string | null;
  paymentMethod: string | null;
  expenseDate: string;
  createdAt: string;
}

function formatShortMillions(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return formatSum(n);
}

function getPrevPeriodRange(fromStr: string, toStr: string): { from: string; to: string } {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  const daysDiff = Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
  const prevTo = new Date(from);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - daysDiff);
  return {
    from: prevFrom.toISOString().slice(0, 10),
    to: prevTo.toISOString().slice(0, 10),
  };
}

function formatPeriodLabel(from: string, to: string): string {
  const [, m1, d1] = from.split("-").map(Number);
  const [, m2, d2] = to.split("-").map(Number);
  const monthName1 = MONTHS[m1 - 1] || "";
  const monthName2 = MONTHS[m2 - 1] || "";
  return `${d1}-${monthName1} - ${d2}-${monthName2}`;
}

function formatExpenseDate(dateStr: string, createdAt: string): string {
  const [, m, d] = dateStr.split("-").map(Number);
  const monthName = MONTHS[m - 1] || "";
  const created = new Date(createdAt);
  const h = String(created.getHours()).padStart(2, "0");
  const min = String(created.getMinutes()).padStart(2, "0");
  return `${d} ${monthName}, ${h}:${min}`;
}

function getCategoryIcon(category: string | null): { bg: string; Icon: React.FC<{ className?: string }> } {
  const c = (category || "").toLowerCase();
  if (c.includes("ijara") || c.includes("rent")) {
    return {
      bg: "bg-red-100 dark:bg-red-900/30",
      Icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    };
  }
  if (c.includes("oziq") || c.includes("ovqat") || c.includes("food") || c.includes("bozor")) {
    return {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      Icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    };
  }
  if (c.includes("maosh") || c.includes("salary") || c.includes("ishchi")) {
    return {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      Icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    };
  }
  if (c.includes("transport") || c.includes("benzin") || c.includes("yo'l")) {
    return {
      bg: "bg-violet-100 dark:bg-violet-900/30",
      Icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    };
  }
  return {
    bg: "bg-slate-200 dark:bg-slate-600/50",
    Icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };
}

export default function ExpenseReport() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const shopId = useProfileStore((s) => s.shopId);

  const defaultRange = getDefaultMonthRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [prevTotal, setPrevTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const total = expenses.reduce((sum, e) => sum + parseAmountString(e.amount), 0);
  const cashTotal = expenses.filter((e) => e.paymentMethod === "CASH").reduce((s, e) => s + parseAmountString(e.amount), 0);
  const cardTotal = expenses.filter((e) => e.paymentMethod === "CARD").reduce((s, e) => s + parseAmountString(e.amount), 0);
  const bankTotal = expenses.filter((e) => e.paymentMethod === "BANK").reduce((s, e) => s + parseAmountString(e.amount), 0);

  const percentChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    const prev = getPrevPeriodRange(fromDate, toDate);
    Promise.all([
      api.getExpenses({ fromDate, toDate }),
      api.getExpenses({ fromDate: prev.from, toDate: prev.to }),
    ]).then(([res, prevRes]) => {
      setLoading(false);
      if (res.success && res.data?.expenses) setExpenses(res.data.expenses);
      if (prevRes.success && prevRes.data?.expenses) {
        const prevSum = prevRes.data.expenses.reduce((s, x) => s + parseAmountString(x.amount), 0);
        setPrevTotal(prevSum);
      }
    });
  }, [shopId, fromDate, toDate]);

  const displayList = showAll ? expenses : expenses.slice(0, 8);
  const hasMore = expenses.length > 8;

  return (
    <AppPage>
      <AppHeader
        title={t("expenseReportTitle")}
        onBack={() => navigate("/reports")}
        backFallback="/reports"
        right={
          <button
            type="button"
            onClick={() => setShowDatePicker(true)}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={t("filter")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        }
      />
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          {t("reportPeriod")}: {formatPeriodLabel(fromDate, toDate)}
        </p>
      </div>

      {/* Filtr modali — sana tanlash */}
      {showDatePicker && (
        <div role="dialog" aria-modal="true" aria-label={t("filter")} className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDatePicker(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-app-primary/15 dark:bg-app-primary/25 flex items-center justify-center">
                <svg className="w-5 h-5 text-app-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t("filter")}</h3>
            </div>
            <DateRangePicker
              fromDate={fromDate}
              toDate={toDate}
              onFromChange={setFromDate}
              onToChange={setToDate}
            />
            <button
              type="button"
              onClick={() => setShowDatePicker(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-app-primary-dark hover:brightness-110 text-white text-sm font-medium"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto px-4 py-4">
        {/* Jami xarajat — to'q kulrang kartochka */}
        <div className="rounded-2xl bg-slate-700 dark:bg-slate-800 overflow-hidden relative mb-4">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-app-primary/30 -translate-y-1/2 translate-x-1/2 flex items-center justify-center" aria-hidden>
            <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v1" />
            </svg>
          </div>
          <div className="p-5 relative z-10">
            <p className="text-sm font-medium text-slate-300">
              {t("totalExpenses")}
            </p>
            {loading ? (
              <p className="text-2xl font-bold text-white mt-1">—</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatSum(total)} {t("currency")}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-app-primary text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>
                    {percentChange >= 0 ? "+" : ""}
                    {percentChange.toFixed(1)}% {t("reportComparedToLastMonth")}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* To'lov turlari bo'yicha */}
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">{t("reportByPaymentTypes")}</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-app-primary/15 dark:bg-app-primary/25 flex items-center justify-center mx-auto mb-2">
              <PaymentMethodIcon type="CASH" className="w-5 h-5 text-app-primary" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("cash")}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {loading ? "—" : formatShortMillions(cashTotal)}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
              <PaymentMethodIcon type="CARD" className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("card")}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {loading ? "—" : formatShortMillions(cardTotal)}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
              <PaymentMethodIcon type="BANK" className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("bankAccount")}</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {loading ? "—" : formatShortMillions(bankTotal)}
            </p>
          </div>
        </div>

        {/* Xarajatlar tarixi */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {t("reportExpensesHistoryTitle")}
          </h2>
          {hasMore && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-sm font-semibold text-app-primary"
            >
              {t("all")}
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {loading && (
            <li className="py-4 text-center text-slate-500 dark:text-slate-400 text-sm">{t("loading")}</li>
          )}
          {!loading && displayList.length === 0 && (
            <li className="py-6 text-center text-slate-500 dark:text-slate-400 text-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              {t("expensesHistoryEmpty")}
            </li>
          )}
          {!loading && displayList.map((e) => {
            const { bg, Icon } = getCategoryIcon(e.category);
            const subtitle = e.description
              ? `${formatExpenseDate(e.expenseDate, e.createdAt)} • ${e.description}`
              : formatExpenseDate(e.expenseDate, e.createdAt);
            return (
              <li
                key={e.id}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-400 ${bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {e.category || t("expenseName")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {subtitle}
                  </p>
                </div>
                <p className="text-red-600 dark:text-red-400 font-bold shrink-0">
                  -{formatSum(parseAmountString(e.amount))}
                </p>
              </li>
            );
          })}
        </ul>
      </main>

      <BottomNav activeTab="reports" />
    </AppPage>
  );
}
