import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useProfileStore } from "../stores/profileStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useFilterStore } from "../stores/filterStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { appStyles } from "../theme/tokens";
import { DateRangePicker } from "../components/DateRangePicker";
import { formatSum, parseAmountString } from "../utils/amountFormat";
import type { Client } from "../stores/clientStore";
import type { Supplier } from "../stores/supplierStore";

type DashboardTopDebtorRow = {
  id: string;
  name: string;
  phone: string;
  initials: string;
  currentDebt: number;
  totalPaid: number;
};

type DashboardTopSupplierRow = DashboardTopDebtorRow & { debtId: string };

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const shopId = useProfileStore((s) => s.shopId);
  const calculateSales = useSettingsStore((s) => s.calculateSales);
  const { fromDate, toDate, setDateRange, getDefaultRange } = useFilterStore();

  const [stats, setStats] = useState<{
    clientDebtStats?: { totalOlingan: number; totalTolangan: number; currentDebt: number };
    supplierDebtStats?: { totalGoodsTaken: number; totalPaid: number; currentDebt: number };
    topDebtorsByBalance?: DashboardTopDebtorRow[];
    topDebtorsByRepaid?: DashboardTopDebtorRow[];
    topSuppliersByBalance?: DashboardTopSupplierRow[];
    topSuppliersByRepaid?: DashboardTopSupplierRow[];
  } | null>(null);
  const [topDebtorView, setTopDebtorView] = useState<"balance" | "repaid">("balance");
  const [topSupplierView, setTopSupplierView] = useState<"balance" | "repaid">("balance");
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<{
    cash: string;
    card: string;
    bank: string;
    total: string;
  } | null>(null);
  const [periodData, setPeriodData] = useState<{
    salesTotal: number;
    salesToday: number;
    expensesTotal: number;
    clientTotalOlingan: number;
    clientTotalTolangan: number;
    supplierTotalGoodsTaken: number;
    supplierTotalPaid: number;
  }>({
    salesTotal: 0,
    salesToday: 0,
    expensesTotal: 0,
    clientTotalOlingan: 0,
    clientTotalTolangan: 0,
    supplierTotalGoodsTaken: 0,
    supplierTotalPaid: 0,
  });
  const [showBalanceDateFilter, setShowBalanceDateFilter] = useState(false);

  useEffect(() => {
    if (shopId) {
      setLoading(true);
      api
        .getDashboardStats()
        .then((res) => {
          setLoading(false);
          if (res.success && res.data) setStats(res.data);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [shopId]);

  const fetchBalance = () => {
    if (!shopId || !calculateSales) return;
    api
      .getBalance()
      .then((res) => {
        if (res.success && res.data) setBalance(res.data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBalance();
  }, [shopId, calculateSales]);

  useEffect(() => {
    if (!calculateSales) return;
    const onFocus = () => fetchBalance();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [shopId, calculateSales]);

  useEffect(() => {
    if (!shopId || !fromDate || !toDate) return;
    setLoading(true);
    const todayStr = new Date().toISOString().slice(0, 10);
    Promise.all([
      calculateSales ? api.getSales({ fromDate: fromDate, toDate: toDate }) : Promise.resolve(null),
      api.getExpenses({ fromDate: fromDate, toDate: toDate }),
      api.getDebtHistoryAll(),
      api.getSupplierDebtHistoryAll(),
    ])
      .then(([salesRes, expRes, debtRes, suppRes]) => {
        setLoading(false);
        let salesTotal = 0;
        let salesToday = 0;
        if (salesRes?.success && salesRes.data?.sales) {
          salesRes.data.sales.forEach((s) => {
            const sum = parseAmountString(s.cashAmount) + parseAmountString(s.cardAmount) + parseAmountString(s.bankAmount);
            salesTotal += sum;
            if (s.saleDate && s.saleDate.startsWith(todayStr)) salesToday += sum;
          });
        }
        let expensesTotal = 0;
        if (expRes?.success && expRes.data?.total != null) {
          expensesTotal = parseAmountString(expRes.data.total);
        }
        let clientTotalOlingan = 0;
        let clientTotalTolangan = 0;
        if (debtRes?.success && debtRes.data?.history) {
          debtRes.data.history.forEach((item) => {
            if (item.date >= fromDate && item.date <= toDate) {
              if (item.isPayment) clientTotalTolangan += item.summa;
              else clientTotalOlingan += item.summa;
            }
          });
        }
        let supplierTotalGoodsTaken = 0;
        let supplierTotalPaid = 0;
        if (suppRes?.success && suppRes.data?.history) {
          suppRes.data.history.forEach((item) => {
            if (item.date >= fromDate && item.date <= toDate) {
              if (item.isPayment) supplierTotalPaid += item.summa;
              else supplierTotalGoodsTaken += item.summa;
            }
          });
        }
        setPeriodData({
          salesTotal,
          salesToday,
          expensesTotal,
          clientTotalOlingan,
          clientTotalTolangan,
          supplierTotalGoodsTaken,
          supplierTotalPaid,
        });
      })
      .catch(() => setLoading(false));
  }, [shopId, fromDate, toDate, calculateSales]);

  const applyFilter = () => {
    setShowBalanceDateFilter(false);
  };

  const topDebtorsList: DashboardTopDebtorRow[] =
    topDebtorView === "balance" ? stats?.topDebtorsByBalance ?? [] : stats?.topDebtorsByRepaid ?? [];

  const openClientCardFromTopDebtor = (row: DashboardTopDebtorRow) => {
    const client: Client = {
      id: row.id,
      backendId: row.id,
      name: row.name,
      phone: row.phone || "",
      debt: String(Math.round(row.currentDebt)),
      dueDate: "",
      status: row.currentDebt > 0 ? "inPayment" : null,
      initials: row.initials || "MJ",
    };
    navigate("/clients/card", { state: { client } });
  };

  const topSuppliersList: DashboardTopSupplierRow[] =
    topSupplierView === "balance" ? stats?.topSuppliersByBalance ?? [] : stats?.topSuppliersByRepaid ?? [];

  const openSupplierCardFromTop = (row: DashboardTopSupplierRow) => {
    const supplier: Supplier = {
      id: row.id,
      backendId: row.id,
      name: row.name,
      phone: row.phone || undefined,
      debt: String(Math.round(row.currentDebt)),
      dueDate: "",
      dateInfo: "",
      debtId: row.debtId,
    };
    navigate("/suppliers/card", { state: { supplier } });
  };

  return (
    <AppPage>
      <AppHeader
        showBackButton={false}
        title={t("totalBalance")}
        left={
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={t("menu")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        }
        right={
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={t("notifications")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m-6 0H9"
              />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-app-danger ring-2 ring-white dark:ring-slate-900" />
          </button>
        }
      />

      <main className="flex-1 px-4 py-5 space-y-5">
        {/* 1. Jami balans — yashil katta kartochka, ichida NAQD/KARTA/BANK (rasmdagi kabi) */}
        {calculateSales && (
          <section className="rounded-2xl p-5 text-white shadow-lg overflow-hidden" style={appStyles.gradientBalance}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold text-white/90 uppercase tracking-wider">
                {t("jamiBalans")}
              </p>
              <button
                type="button"
                onClick={() => setShowBalanceDateFilter((v) => !v)}
                className="shrink-0 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label={t("filter")}
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-2xl sm:text-3xl font-bold mt-1 tracking-tight">
              {balance ? formatSum(parseFloat(balance.total) || 0) : "—"}{" "}
              <span className="text-lg font-semibold opacity-90">
                {t("currency")}
              </span>
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-xl bg-white/20 backdrop-blur py-3 px-2 text-center">
                <p className="text-[10px] font-semibold text-white/90 uppercase tracking-wide">
                  {t("cash")}
                </p>
                <p
                  className="text-sm font-bold mt-0.5 tabular-nums truncate"
                  title={
                    balance ? formatSum(parseFloat(balance.cash) || 0) : "—"
                  }
                >
                  {balance ? formatSum(parseFloat(balance.cash) || 0) : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-white/20 backdrop-blur py-3 px-2 text-center">
                <p className="text-[10px] font-semibold text-white/90 uppercase tracking-wide">
                  {t("card")}
                </p>
                <p
                  className="text-sm font-bold mt-0.5 tabular-nums truncate"
                  title={
                    balance ? formatSum(parseFloat(balance.card) || 0) : "—"
                  }
                >
                  {balance ? formatSum(parseFloat(balance.card) || 0) : "—"}
                </p>
              </div>
              <div className="rounded-xl bg-white/20 backdrop-blur py-3 px-2 text-center">
                <p className="text-[10px] font-semibold text-white/90 uppercase tracking-wide">
                  {t("bankAccount")}
                </p>
                <p
                  className="text-sm font-bold mt-0.5 tabular-nums truncate"
                  title={
                    balance ? formatSum(parseFloat(balance.bank) || 0) : "—"
                  }
                >
                  {balance ? formatSum(parseFloat(balance.bank) || 0) : "—"}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Filtr modali — vaqt oralig'i (barcha hisobotlar shu muddatga qarab) */}
        {showBalanceDateFilter && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("filter")}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowBalanceDateFilter(false)}
            />
            <div
              className="relative w-full max-w-sm max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 pb-80">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-app-primary/15 dark:bg-app-primary/25 flex items-center justify-center">
                    <svg className="w-5 h-5 text-app-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    {t("filter")}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {t("reportPeriod")}: Savdo, xarajatlar, qarzlar va yetkazuvchilar shu muddat bo‘yicha.
                </p>
                <DateRangePicker
                  fromDate={fromDate}
                  toDate={toDate}
                  onFromChange={(v) => setDateRange(v, toDate)}
                  onToChange={(v) => setDateRange(fromDate, v)}
                />
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const def = getDefaultRange();
                      setDateRange(def.from, def.to);
                      setShowBalanceDateFilter(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium"
                  >
                    {t("clearFilter")}
                  </button>
                  <button
                    type="button"
                    onClick={() => { applyFilter(); }}
                    className="flex-1 py-2.5 rounded-xl bg-app-primary-dark hover:brightness-110 text-white text-sm font-medium"
                  >
                    {t("applyFilter")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Moliyaviy ko'rsatkichlar — Savdo va Xarajat (rasmdagi dizayn) */}
        <section>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 pl-3 border-l-4 border-blue-500">
            {t("financialIndicators")}
          </h2>
          <div className="space-y-3">
            {/* Savdo summasi — yashil tema, to'liq yashil Qo'shish tugmasi */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 p-4 overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-app-primary flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {t("salesAmountTitle")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t("totalIncome")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {calculateSales
                      ? formatSum(periodData.salesTotal)
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t("currency")}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <svg className="w-4 h-4 text-app-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-xs font-semibold text-app-primary">
                      +{formatSum(periodData.salesToday)} {t("today")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/sales/new")}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-app-primary-dark hover:brightness-110 text-white text-sm font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {t("add")}
              </button>
            </div>

            {/* Xarajatlar summasi — qizil tema, to'liq qizil Qo'shish tugmasi */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 p-4 overflow-hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-red-500 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                      {t("expensesAmountTitle")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t("operationalExpenses")}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {formatSum(periodData.expensesTotal)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t("currency")}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                      -0 {t("today")}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/expenses/new")}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                {t("add")}
              </button>
            </div>
          </div>
        </section>

        {/* 3. Qarzlar nazorati — bosganda mijozlar ro'yxatiga */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 rounded-full bg-orange-500 shrink-0" aria-hidden />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {t("debtControl")}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/clients")}
            className="w-full text-left rounded-xl bg-amber-50 dark:bg-amber-950/30 shadow-md border border-amber-100 dark:border-amber-900/40 p-5 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 active:opacity-90 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                    {t("debtsBalance")}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {t("generalReport")}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 shrink-0 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg" aria-hidden>
                !
              </div>
            </div>

            <div className="space-y-0">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                  {t("debtTotalOlingan")}
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                  {loading ? "—" : formatSum(periodData.clientTotalOlingan)} <span className="text-slate-500 dark:text-slate-400 font-normal">{t("currency")}</span>
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-600" />
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <svg className="w-4 h-4 text-app-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {t("debtTotalTolangan")}
                </span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                  {loading ? "—" : formatSum(periodData.clientTotalTolangan)} <span className="text-slate-500 dark:text-slate-400 font-normal">{t("currency")}</span>
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("debtCurrentDebt")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t("expectedFromClientsTotal")}
                </p>
              </div>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400 tabular-nums shrink-0">
                {loading ? "—" : formatSum(stats?.clientDebtStats?.currentDebt ?? 0)} <span className="text-orange-500/80 dark:text-orange-400/80 font-semibold">{t("currency")}</span>
              </span>
            </div>
          </button>

          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">{t("topDebtorsTitle")}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setTopDebtorView("balance")}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  topDebtorView === "balance"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-amber-200/80 dark:border-amber-800/50"
                }`}
              >
                {t("topDebtorsFilterBalance")}
              </button>
              <button
                type="button"
                onClick={() => setTopDebtorView("repaid")}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  topDebtorView === "repaid"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-amber-200/80 dark:border-amber-800/50"
                }`}
              >
                {t("topDebtorsFilterRepaid")}
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">—</p>
            ) : topDebtorsList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">{t("topDebtorsEmpty")}</p>
            ) : (
              <ul className="space-y-2">
                {topDebtorsList.map((row, i) => (
                  <li key={`${row.id}-${i}`}>
                    <button
                      type="button"
                      onClick={() => openClientCardFromTopDebtor(row)}
                      className="w-full flex items-center gap-3 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-amber-100/80 dark:border-amber-900/40 px-3 py-2.5 text-left hover:bg-white/90 dark:hover:bg-slate-800/80 active:opacity-90 transition-colors"
                    >
                      <span className="w-7 h-7 shrink-0 rounded-full bg-orange-500/15 dark:bg-orange-500/25 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center tabular-nums">
                        {i + 1}
                      </span>
                      <span className="w-10 h-10 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {(row.initials || "MJ").slice(0, 3)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
                        {row.phone ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.phone}</p>
                        ) : null}
                      </div>
                      <div className="text-right shrink-0 max-w-[48%]">
                        {topDebtorView === "balance" ? (
                          <>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums leading-tight">
                              {formatSum(row.currentDebt)}{" "}
                              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t("currency")}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                              {t("debtTotalTolangan")}: {formatSum(row.totalPaid)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-app-primary dark:text-emerald-400 tabular-nums leading-tight">
                              {formatSum(row.totalPaid)}{" "}
                              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t("currency")}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                              {t("debtCurrentDebt")}: {formatSum(row.currentDebt)}
                            </p>
                          </>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* 4. Yetkazuvchilarga qarz — xuddi Qarzlar nazorati dizayni */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 rounded-full bg-orange-500 shrink-0" aria-hidden />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {t("debtToSuppliers")}
            </h2>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 shadow-md border border-amber-100 dark:border-amber-900/40 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {t("debtToSuppliers")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                      {t("generalReport")}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 shrink-0 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg" aria-hidden>
                  !
                </div>
              </div>

              <div className="space-y-0">
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    {t("supplierGoodsTaken")}
                  </span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {loading ? "—" : formatSum(periodData.supplierTotalGoodsTaken)} <span className="text-slate-500 dark:text-slate-400 font-normal">{t("currency")}</span>
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-600" />
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-app-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {t("supplierPaid")}
                  </span>
                  <span className="text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {loading ? "—" : formatSum(periodData.supplierTotalPaid)} <span className="text-slate-500 dark:text-slate-400 font-normal">{t("currency")}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {t("supplierCurrentDebt")}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("debtToSuppliersGo")}
                  </p>
                </div>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400 tabular-nums shrink-0">
                  {loading ? "—" : formatSum(stats?.supplierDebtStats?.currentDebt ?? 0)} <span className="text-orange-500/80 dark:text-orange-400/80 font-semibold">{t("currency")}</span>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/suppliers")}
              className="w-full px-5 py-3 flex items-center justify-between border-t border-amber-100 dark:border-amber-900/40 bg-amber-100/50 dark:bg-amber-900/20 text-slate-700 dark:text-slate-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/30 active:opacity-90 transition-colors"
            >
              <span className="text-sm font-medium">{t("debtToSuppliersGo")}</span>
              <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 p-4 shadow-sm">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">{t("topSuppliersTitle")}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => setTopSupplierView("balance")}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  topSupplierView === "balance"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-amber-200/80 dark:border-amber-800/50"
                }`}
              >
                {t("topDebtorsFilterBalance")}
              </button>
              <button
                type="button"
                onClick={() => setTopSupplierView("repaid")}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  topSupplierView === "repaid"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-amber-200/80 dark:border-amber-800/50"
                }`}
              >
                {t("topDebtorsFilterRepaid")}
              </button>
            </div>
            {loading ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">—</p>
            ) : topSuppliersList.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center">{t("topDebtorsEmpty")}</p>
            ) : (
              <ul className="space-y-2">
                {topSuppliersList.map((row, i) => (
                  <li key={`${row.id}-${i}`}>
                    <button
                      type="button"
                      onClick={() => openSupplierCardFromTop(row)}
                      className="w-full flex items-center gap-3 rounded-xl bg-white/60 dark:bg-slate-800/50 border border-amber-100/80 dark:border-amber-900/40 px-3 py-2.5 text-left hover:bg-white/90 dark:hover:bg-slate-800/80 active:opacity-90 transition-colors"
                    >
                      <span className="w-7 h-7 shrink-0 rounded-full bg-orange-500/15 dark:bg-orange-500/25 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center tabular-nums">
                        {i + 1}
                      </span>
                      <span className="w-10 h-10 shrink-0 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {(row.initials || "YT").slice(0, 3)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
                        {row.phone ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{row.phone}</p>
                        ) : null}
                      </div>
                      <div className="text-right shrink-0 max-w-[48%]">
                        {topSupplierView === "balance" ? (
                          <>
                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums leading-tight">
                              {formatSum(row.currentDebt)}{" "}
                              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t("currency")}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                              {t("supplierPaid")}: {formatSum(row.totalPaid)}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-bold text-app-primary dark:text-emerald-400 tabular-nums leading-tight">
                              {formatSum(row.totalPaid)}{" "}
                              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{t("currency")}</span>
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                              {t("supplierCurrentDebt")}: {formatSum(row.currentDebt)}
                            </p>
                          </>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <BottomNav activeTab="main" />
    </AppPage>
  );
}
