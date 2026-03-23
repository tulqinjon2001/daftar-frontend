import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useClientStore, type Client } from "../stores/clientStore";
import { useProfileStore } from "../stores/profileStore";
import { useFilterStore } from "../stores/filterStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { DateRangePicker } from "../components/DateRangePicker";

type FilterTab = "all" | "debtors" | "overdue";
type OperationTypeFilter = "all" | "repaid" | "given";

function mapApiClientToClient(c: { id: string; name: string; phone: string; debt: string; dueDate: string; initials: string }): Client {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    debt: c.debt,
    dueDate: c.dueDate || "",
    status: null,
    initials: c.initials || "MJ",
    backendId: c.id,
  };
}

export default function Clients() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const shopId = useProfileStore((s) => s.shopId);
  const clients = useClientStore((s) => s.clients);
  const setClients = useClientStore((s) => s.setClients);
  const hydrateClients = useClientStore((s) => s.hydrateFromStorage);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<OperationTypeFilter>("all");
  const { fromDate: filterFromDate, toDate: filterToDate, setDateRange } = useFilterStore();
  const [filterByHistoryIds, setFilterByHistoryIds] = useState<Set<string> | null>(null);
  const [filterHistoryLoading, setFilterHistoryLoading] = useState(false);

  const isClientsListPage = location.pathname === "/clients" || location.pathname === "/clients/";

  useEffect(() => {
    hydrateClients();
    if (!isClientsListPage) return;
    if (shopId) {
      setLoading(true);
      api.getClients().then((res) => {
        setLoading(false);
        if (res.success) {
          setClients((res.data?.clients ?? []).map(mapApiClientToClient));
        }
      }).catch(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [shopId, isClientsListPage]);

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
      const res = await api.getDebtHistoryAll();
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
        if (item.debtorId) ids.add(item.debtorId);
      });
      setFilterByHistoryIds(ids.size > 0 ? ids : null);
    } catch {
      setFilterByHistoryIds(null);
    } finally {
      setFilterHistoryLoading(false);
      setFilterModalOpen(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const searchTrim = search.trim().toLowerCase();
    const searchDigits = search.replace(/\D/g, "");
    const clientPhoneDigits = (c.phone || "").replace(/\D/g, "");
    const matchSearch =
      !search.trim() ||
      c.name.toLowerCase().includes(searchTrim) ||
      (searchDigits.length > 0 && clientPhoneDigits.includes(searchDigits));
    const balanceNum = parseFloat(String(c.debt).replace(/[,\s]/g, "")) || 0;
    let tabMatch = true;
    if (filter === "debtors") tabMatch = balanceNum > 0;
    else if (filter === "overdue") tabMatch = c.status === "overdue";
    const historyMatch =
      filterByHistoryIds === null || (c.backendId && filterByHistoryIds.has(c.backendId));
    return matchSearch && tabMatch && historyMatch;
  });

  return (
    <AppPage>
      {/* Header */}
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
          <h1 className="flex-1 text-center text-xl font-bold text-slate-800 dark:text-slate-100 min-w-0">
            {t("clientsTitle")}
          </h1>
          <button
            type="button"
            onClick={() => navigate("/clients/new")}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg hover:brightness-110 active:scale-95 transition-transform bg-app-primary"
            aria-label={t("addClient")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Search + Filter icon */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2.5">
            <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchClientPlaceholder")}
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

        {/* Filter modal: Amaliyot turi + Vaqt oralig'i */}
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
                  aria-label={t("clearFilter")}
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

      {/* Client list */}
      <main className="flex-1 px-4 py-4 overflow-auto">
        {loading ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
            {t("loading") || "Yuklanmoqda..."}
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {filteredClients.map((client) => (
                <li
                  key={client.id}
                  className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    {/* Avatar (placeholder) */}
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm shrink-0 overflow-hidden">
                      {client.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Upper row: name + phone vs amount + date */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{client.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V21a2 2 0 01-2 2h-2C7.82 23 2 17.18 2 10V8a2 2 0 012-2z" />
                            </svg>
                            <span>{client.phone}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {(() => {
                            const b = parseFloat(String(client.debt).replace(/[,\s]/g, "")) || 0;
                            const isCredit = b < 0;
                            const isZero = b === 0;
                            const balanceColor = isCredit ? "text-app-primary" : isZero ? "text-slate-600 dark:text-slate-400" : "text-red-600 dark:text-red-400";
                            const balanceText = isCredit ? `+${String(-b).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}` : isZero ? "0" : `-${String(b).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
                            return (
                              <p className={`text-sm font-bold ${balanceColor}`}>
                                {balanceText} {t("currency")}
                              </p>
                            );
                          })()}
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {client.dueDate}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons row */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate("/debt/write", { state: { client } })}
                          className="flex-1 py-2.5 rounded-full bg-app-danger text-white text-xs font-semibold text-center"
                        >
                          Qarz yozish
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/debt/pay", { state: { client } })}
                          className="flex-1 py-2.5 rounded-full text-xs font-semibold text-center text-white bg-app-primary"
                        >
                          To'lash
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/clients/card", { state: { client } })}
                          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-200 shrink-0"
                          aria-label={t("details")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {filteredClients.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
                {t("clientsEmpty")}
              </p>
            )}
          </>
        )}
      </main>

      <BottomNav activeTab="clients" />
    </AppPage>
  );
}
