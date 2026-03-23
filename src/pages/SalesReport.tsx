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
import { AmountInput } from "../components/AmountInput";
import { formatSum, parseAmountString } from "../utils/amountFormat";
import { getDefaultMonthRange } from "../utils/dateRange";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

interface SaleItem {
  id: string;
  cashAmount: string;
  cardAmount: string;
  bankAmount: string;
  saleDate: string;
  comment: string | null;
  createdAt: string;
}

function formatShortMillions(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return formatSum(n);
}

/** Oldingi davr (tanlangan muddat uzunligi, boshlang‘ich sanadan oldin) */
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

function formatSaleDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const dateStr = d.toISOString().slice(0, 10);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const time = `${h}:${m}`;
  if (dateStr === today) return `Bugun, ${time}`;
  if (dateStr === yesterdayStr) return `Kecha, ${time}`;
  const day = d.getDate();
  const month = MONTHS[d.getMonth()] || "";
  return `${day}-${month}, ${time}`;
}

function getSaleAmount(s: SaleItem): number {
  return parseAmountString(s.cashAmount) + parseAmountString(s.cardAmount) + parseAmountString(s.bankAmount);
}

type PaymentMethod = "CASH" | "CARD" | "BANK";

interface SaleRow {
  sale: SaleItem;
  method: PaymentMethod;
  amount: number;
}

function saleToRows(s: SaleItem): SaleRow[] {
  const rows: SaleRow[] = [];
  const c = parseAmountString(s.cashAmount);
  const k = parseAmountString(s.cardAmount);
  const b = parseAmountString(s.bankAmount);
  if (c > 0) rows.push({ sale: s, method: "CASH", amount: c });
  if (k > 0) rows.push({ sale: s, method: "CARD", amount: k });
  if (b > 0) rows.push({ sale: s, method: "BANK", amount: b });
  return rows;
}

export default function SalesReport() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const shopId = useProfileStore((s) => s.shopId);

  const defaultRange = getDefaultMonthRange();
  const [fromDate, setFromDate] = useState(defaultRange.from);
  const [toDate, setToDate] = useState(defaultRange.to);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [prevTotal, setPrevTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleItem | null>(null);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [editSingleAmount, setEditSingleAmount] = useState(0);
  const [saving, setSaving] = useState(false);

  const total = sales.reduce((sum, s) => sum + getSaleAmount(s), 0);
  const cashTotal = sales.reduce((sum, s) => sum + parseAmountString(s.cashAmount), 0);
  const cardTotal = sales.reduce((sum, s) => sum + parseAmountString(s.cardAmount), 0);
  const bankTotal = sales.reduce((sum, s) => sum + parseAmountString(s.bankAmount), 0);

  const percentChange = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  useEffect(() => {
    if (!shopId) return;
    setLoading(true);
    const prev = getPrevPeriodRange(fromDate, toDate);
    Promise.all([
      api.getSales({ fromDate, toDate }),
      api.getSales({ fromDate: prev.from, toDate: prev.to }),
    ]).then(([res, prevRes]) => {
      setLoading(false);
      if (res.success && res.data?.sales) setSales(res.data.sales);
      if (prevRes.success && prevRes.data?.sales) {
        const prevSum = prevRes.data.sales.reduce(
          (s, x) => s + parseAmountString(x.cashAmount) + parseAmountString(x.cardAmount) + parseAmountString(x.bankAmount),
          0
        );
        setPrevTotal(prevSum);
      }
    });
  }, [shopId, fromDate, toDate]);

  const saleRows: SaleRow[] = sales.flatMap(saleToRows).sort(
    (a, b) => new Date(b.sale.saleDate).getTime() - new Date(a.sale.saleDate).getTime()
  );
  const displayRows = showAll ? saleRows : saleRows.slice(0, 10);
  const hasMore = saleRows.length > 10;

  const openEdit = (row: SaleRow) => {
    setEditingSale(row.sale);
    setEditingMethod(row.method);
    const amountStr =
      row.method === "CASH" ? row.sale.cashAmount : row.method === "CARD" ? row.sale.cardAmount : row.sale.bankAmount;
    setEditSingleAmount(parseAmountString(amountStr ?? "0"));
  };

  const closeEdit = () => {
    setEditingSale(null);
    setEditingMethod(null);
  };

  const saveEdit = async () => {
    if (!editingSale || editingMethod === null) return;
    const cash = editingMethod === "CASH" ? editSingleAmount : parseAmountString(editingSale.cashAmount);
    const card = editingMethod === "CARD" ? editSingleAmount : parseAmountString(editingSale.cardAmount);
    const bank = editingMethod === "BANK" ? editSingleAmount : parseAmountString(editingSale.bankAmount);
    if (cash === 0 && card === 0 && bank === 0) return;
    setSaving(true);
    const res = await api.updateSale(editingSale.id, {
      cashAmount: cash,
      cardAmount: card,
      bankAmount: bank,
    });
    setSaving(false);
    if (res.success) {
      closeEdit();
      const prev = getPrevPeriodRange(fromDate, toDate);
      Promise.all([
        api.getSales({ fromDate, toDate }),
        api.getSales({ fromDate: prev.from, toDate: prev.to }),
      ]).then(([res2, prevRes]) => {
        if (res2.success && res2.data?.sales) setSales(res2.data.sales);
        if (prevRes.success && prevRes.data?.sales) {
          const prevSum = prevRes.data.sales.reduce(
            (s, x) => s + parseAmountString(x.cashAmount) + parseAmountString(x.cardAmount) + parseAmountString(x.bankAmount),
            0
          );
          setPrevTotal(prevSum);
        }
      });
    }
  };

  return (
    <AppPage>
      <AppHeader
        title={t("salesReportTitle")}
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
              className="mt-4 w-full py-2.5 rounded-xl bg-app-primary-dark hover:bg-app-primary-darker text-white text-sm font-medium"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-auto px-4 py-4">
        {/* Jami tushum card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden relative mb-4">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-app-primary/20 -translate-y-1/2 translate-x-1/2" aria-hidden />
          <div className="p-5 relative z-10">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("reportJamiTushum")}
            </p>
            {loading ? (
              <p className="text-2xl font-bold text-app-primary mt-1">—</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-app-primary mt-1">
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

        {/* Naqd, Karta, Bank */}
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

        {/* Savdo tarixi + Hammasi */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            {t("reportSalesHistoryTitle")}
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
          {!loading && displayRows.length === 0 && (
            <li className="py-6 text-center text-slate-500 dark:text-slate-400 text-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              {t("salesHistoryEmpty")}
            </li>
          )}
          {!loading && displayRows.map((row) => {
            const incomeLabel =
              row.method === "CASH" ? t("reportCashIncome") : row.method === "CARD" ? t("reportCardIncome") : t("reportBankIncome");
            const methodLabel = row.method === "CASH" ? "NAQD" : row.method === "CARD" ? "KARTA" : "BANK";
            return (
              <li
                key={`${row.sale.id}-${row.method}`}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <PaymentMethodIcon type={row.method} className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 dark:text-slate-100">{incomeLabel}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {formatSaleDate(row.sale.saleDate)} • {methodLabel}
                  </p>
                </div>
                <p className="text-app-primary font-bold shrink-0">
                  + {formatSum(row.amount)}
                </p>
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="p-2 rounded-xl text-slate-400 hover:text-app-primary hover:bg-app-primary/10 dark:hover:bg-app-primary/15 shrink-0"
                  aria-label={t("editSale")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      {/* Tahrirlash modali — faqat shu to'lov turidagi summa */}
      {editingSale && editingMethod !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closeEdit}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("editSale")}</h3>
              <button
                type="button"
                onClick={closeEdit}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label={t("close")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  {editingMethod === "CASH" ? t("reportCashIncome") : editingMethod === "CARD" ? t("reportCardIncome") : t("reportBankIncome")}
                </label>
                <AmountInput
                  value={editSingleAmount}
                  onChange={setEditSingleAmount}
                  className="text-lg"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                >
                  {t("close")}
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving || editSingleAmount === 0}
                  className="flex-1 py-2.5 rounded-xl bg-app-primary text-white font-medium disabled:opacity-50"
                >
                  {saving ? t("saving") : t("save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="reports" />
    </AppPage>
  );
}
