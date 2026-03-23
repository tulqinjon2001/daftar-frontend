import { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useSupplierStore, type Supplier } from "../stores/supplierStore";
import { useProfileStore } from "../stores/profileStore";
import { useFilterStore } from "../stores/filterStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { appStyles } from "../theme/tokens";
import { DateRangePicker } from "../components/DateRangePicker";

type FilterTab = "all" | "debtors" | "overdue";
type OperationTypeFilter = "all" | "repaid" | "given";

function mapApiSupplierToSupplier(
  s: {
    id: string;
    name: string;
    phone?: string;
    debt: string;
    dueDate: string;
    dateInfo: string;
    debtId: string | null;
  }
): Supplier {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone,
    debt: s.debt,
    dueDate: s.dueDate || "",
    dateInfo: s.dateInfo || "",
    debtId: s.debtId,
    backendId: s.id,
  };
}

export default function Suppliers() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const shopId = useProfileStore((s) => s.shopId);
  const suppliers = useSupplierStore((s) => s.suppliers);
  const setSuppliers = useSupplierStore((s) => s.setSuppliers);
  const hydrateSuppliers = useSupplierStore((s) => s.hydrateFromStorage);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<OperationTypeFilter>("all");
  const { fromDate: filterFromDate, toDate: filterToDate, setDateRange } = useFilterStore();
  const [filterByHistoryIds, setFilterByHistoryIds] = useState<Set<string> | null>(null);
  const [filterHistoryLoading, setFilterHistoryLoading] = useState(false);

  const isSuppliersListPage = location.pathname === "/suppliers" || location.pathname === "/suppliers/";

  useEffect(() => {
    hydrateSuppliers();
    if (!isSuppliersListPage) return;
    if (shopId) {
      setLoading(true);
      api.getSuppliers()
        .then((res) => {
          setLoading(false);
          if (res.success && res.data?.suppliers) {
            setSuppliers(res.data.suppliers.map(mapApiSupplierToSupplier));
          }
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [shopId, isSuppliersListPage]);

  const applyFilterFromHistory = async () => {
    const useOperationType = operationType !== "all";
    if (!filterFromDate && !filterToDate && !useOperationType) {
      setFilterByHistoryIds(null);
      setFilterModalOpen(false);
      return;
    }
    if (!shopId) {
      setFilterModalOpen(false);
      return;
    }
    setFilterHistoryLoading(true);
    try {
      const res = await api.getSupplierDebtHistoryAll();
      if (!res.success || !res.data?.history) {
        setFilterByHistoryIds(null);
        setFilterModalOpen(false);
        return;
      }
      const from = filterFromDate || "";
      const to = filterToDate || "";
      const filtered = res.data.history.filter((item) => {
        const inRange = !from || !to || (item.date >= from && item.date <= to);
        const matchType =
          operationType === "all" ||
          (operationType === "repaid" && item.isPayment) ||
          (operationType === "given" && !item.isPayment);
        return inRange && matchType;
      });
      const ids = new Set<string>();
      filtered.forEach((item) => {
        if (item.supplierId) ids.add(item.supplierId);
      });
      setFilterByHistoryIds(ids.size > 0 ? ids : null);
    } catch {
      setFilterByHistoryIds(null);
    } finally {
      setFilterHistoryLoading(false);
      setFilterModalOpen(false);
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const filteredSuppliers = suppliers.filter((s) => {
    const searchTrim = search.trim().toLowerCase();
    const searchDigits = search.replace(/\D/g, "");
    const supplierPhoneDigits = (s.phone || "").replace(/\D/g, "");
    const matchSearch =
      !search.trim() ||
      s.name.toLowerCase().includes(searchTrim) ||
      (searchDigits.length > 0 && supplierPhoneDigits.includes(searchDigits));
    const balanceNum = parseFloat(String(s.debt).replace(/[,\s]/g, "")) || 0;
    let tabMatch = true;
    if (filter === "debtors") tabMatch = balanceNum > 0;
    else if (filter === "overdue") tabMatch = !!(s.dueDate && s.dueDate < todayStr);
    const historyMatch =
      filterByHistoryIds === null || (s.backendId && filterByHistoryIds.has(s.backendId)) || (s.id && filterByHistoryIds.has(s.id));
    return matchSearch && tabMatch && historyMatch;
  });

  return (
    <AppPage>
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 safe-area-pt">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/dashboard"))}
            className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t("back")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {t("suppliersTitle")}
          </h1>
          <button
            type="button"
            onClick={() => navigate("/suppliers/new")}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg hover:brightness-110 active:scale-95 transition-transform bg-app-primary"
            aria-label={t("addSupplier")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5">
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchSupplierPlaceholder")}
              className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setFilterModalOpen(true)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label={t("filter")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Filter modal: Ro'yxat + Amaliyot turi + Vaqt oralig'i */}
        {filterModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("filter")}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setFilterModalOpen(false)}
            />
            <div
              className="relative w-full max-w-sm max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-5 pb-80">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-app-primary/15 dark:bg-app-primary/25 flex items-center justify-center">
                  <svg className="w-5 h-5 text-app-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t("filter")}</h3>
              </div>

              {/* Ro'yxat: Barchasi / Qarzdorlar / Muddati o'tgan */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t("listFilterLabel")}
                </label>
                <div className="flex gap-2">
                  {(["all", "debtors", "overdue"] as const).map((tab) => {
                    const label = tab === "all" ? t("filterAll") : tab === "debtors" ? t("filterDebtors") : t("filterOverdue");
                    const isActive = filter === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setFilter(tab)}
                        className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                          isActive
                            ? "text-white shadow-sm bg-app-primary"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-transparent"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amaliyot turi */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t("operationTypeLabel")}
                </label>
                <div className="flex gap-2">
                  {(
                    [
                      { key: "all" as const, label: t("filterAll") },
                      { key: "repaid" as const, label: t("operationTypeRepaid") },
                      { key: "given" as const, label: t("operationTypeGiven") },
                    ] as const
                  ).map(({ key, label }) => {
                    const isActive = operationType === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setOperationType(key)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          isActive
                            ? "text-white shadow-sm bg-app-primary"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-transparent"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Vaqt oralig'i */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t("reportPeriod")}
                </label>
                <DateRangePicker
                  fromDate={filterFromDate}
                  toDate={filterToDate}
                  onFromChange={(v) => setDateRange(v, filterToDate)}
                  onToChange={(v) => setDateRange(filterFromDate, v)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFilterByHistoryIds(null);
                    setFilterModalOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium"
                >
                  {t("clearFilter")}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium"
                >
                  {t("close")}
                </button>
                <button
                  type="button"
                  onClick={applyFilterFromHistory}
                  disabled={filterHistoryLoading}
                  className="flex-1 py-2.5 rounded-xl text-white font-medium disabled:opacity-60 bg-app-primary"
                >
                  {filterHistoryLoading ? t("loading") : t("applyFilter")}
                </button>
              </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 overflow-auto">
        {loading ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
            {t("loading")}
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {filteredSuppliers.map((supplier) => {
                const balanceNum = parseFloat(String(supplier.debt).replace(/[,\s]/g, "")) || 0;
                const isPositive = balanceNum === 0;
                const absFormatted = Math.abs(balanceNum)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                const displayDebt = isPositive ? "0" : `-${absFormatted}`;
                const debtColor = isPositive
                  ? "text-app-primary"
                  : "text-red-500 dark:text-red-400";

                return (
                  <li
                    key={supplier.id}
                    className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                  >
                    {/* Card top — avatar + info */}
                    <div className="flex items-start gap-3 px-4 pt-4 pb-3">
                      {/* Avatar */}
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          background: "linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)",
                        }}
                      >
                        <svg className="w-5 h-5 text-app-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>

                      {/* Name + phone + date */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-base leading-tight">
                          {supplier.name}
                        </p>
                        {supplier.phone && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {supplier.phone}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {supplier.dateInfo || supplier.dueDate}
                        </p>
                      </div>

                      {/* Debt badge (top-right) */}
                      <button
                        type="button"
                        onClick={() => navigate("/suppliers/card", { state: { supplier } })}
                        className="shrink-0 flex flex-col items-end gap-0.5"
                        aria-label={t("details")}
                      >
                        <span className={`text-base font-extrabold leading-tight ${debtColor}`}>
                          {displayDebt}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-medium">
                          {t("totalDebt")}
                        </span>
                        <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-100 dark:bg-slate-700 mx-4" />

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => navigate("/supplier-debt/pay", { state: { supplier } })}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                        style={appStyles.gradientCta}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t("payBtn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/supplier-debt/write", { state: { supplier } })}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform border border-slate-200 dark:border-slate-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        {t("recordDebtBtn")}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            {filteredSuppliers.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                {t("suppliersEmpty")}
              </p>
            )}
          </>
        )}
      </main>

      <BottomNav activeTab="suppliers" />
    </AppPage>
  );
}
