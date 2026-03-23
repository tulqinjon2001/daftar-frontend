import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { PaymentMethodIcon } from "../components/PaymentMethodIcon";
import { AmountInput } from "../components/AmountInput";
import { formatSum, parseAmountString } from "../utils/amountFormat";

type ModalType = "sales" | "expenses" | "debt" | "supplier" | "activity" | null;
type ReportModalKey = Exclude<ModalType, null>;

interface SaleItem {
  id: string;
  cashAmount: string;
  cardAmount: string;
  bankAmount: string;
  saleDate: string;
  comment: string | null;
  createdAt: string;
}

interface ExpenseItem {
  id: string;
  amount: string;
  category: string | null;
  description: string | null;
  paymentMethod?: string | null;
  expenseDate: string;
  createdAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = formatDate(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${date} ${h}:${m}`;
}

const REPORT_CARDS: Array<{
  type: ModalType;
  labelKey: "reportCardSales" | "reportCardExpenses" | "reportCardDebtHistory" | "reportCardSupplierHistory" | "reportCardActivity";
  descKey: "reportDescSales" | "reportDescExpenses" | "reportDescDebt" | "reportDescSupplier" | "reportDescActivity";
  iconBg: string;
  iconColor: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  {
    type: "sales",
    labelKey: "reportCardSales",
    descKey: "reportDescSales",
    iconBg: "bg-app-primary/15 dark:bg-app-primary/25",
    iconColor: "text-app-primary",
    Icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    type: "expenses",
    labelKey: "reportCardExpenses",
    descKey: "reportDescExpenses",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-500",
    Icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    type: "debt",
    labelKey: "reportCardDebtHistory",
    descKey: "reportDescDebt",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    Icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    type: "supplier",
    labelKey: "reportCardSupplierHistory",
    descKey: "reportDescSupplier",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    Icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    type: "activity",
    labelKey: "reportCardActivity",
    descKey: "reportDescActivity",
    iconBg: "bg-slate-200 dark:bg-slate-600/50",
    iconColor: "text-slate-600 dark:text-slate-300",
    Icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Reports() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const shopId = useProfileStore((s) => s.shopId);

  const [modal, setModal] = useState<ModalType>(null);
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [debtHistory, setDebtHistory] = useState<Array<{ id: string; date: string; createdAt: string; action: string; summa: number; isPayment: boolean; qoldiq: number | null; debtorName: string }>>([]);
  const [supplierHistory, setSupplierHistory] = useState<Array<{ id: string; date: string; createdAt: string; action: string; summa: number; isPayment: boolean; qoldiq: number | null; supplierName: string }>>([]);
  const [activityItems, setActivityItems] = useState<Array<{ type: string; id: string; date: string; summa: number; label: string; debtorName?: string; supplierName?: string }>>([]);

  const [loading, setLoading] = useState<Record<ReportModalKey, boolean>>({
    sales: false,
    expenses: false,
    debt: false,
    supplier: false,
    activity: false,
  });
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // Edit form state for sale
  const [editSaleCash, setEditSaleCash] = useState(0);
  const [editSaleCard, setEditSaleCard] = useState(0);
  const [editSaleBank, setEditSaleBank] = useState(0);
  const [editSaleDate, setEditSaleDate] = useState("");
  const [editSaleTime, setEditSaleTime] = useState("");
  const [editSaleComment, setEditSaleComment] = useState("");
  const [savingSale, setSavingSale] = useState(false);

  // Edit form state for expense
  const [editExpAmount, setEditExpAmount] = useState(0);
  const [editExpCategory, setEditExpCategory] = useState("");
  const [editExpDescription, setEditExpDescription] = useState("");
  const [editExpDate, setEditExpDate] = useState("");
  const [editExpPaymentMethod, setEditExpPaymentMethod] = useState<"CASH" | "CARD" | "BANK">("CASH");
  const [savingExpense, setSavingExpense] = useState(false);

  const loadSales = () => {
    if (!shopId) return;
    setLoading((p) => ({ ...p, sales: true }));
    api.getSales().then((res) => {
      setLoading((p) => ({ ...p, sales: false }));
      if (res.success && res.data?.sales) setSales(res.data.sales);
    });
  };

  const loadExpenses = () => {
    if (!shopId) return;
    setLoading((p) => ({ ...p, expenses: true }));
    api.getExpenses().then((res) => {
      setLoading((p) => ({ ...p, expenses: false }));
      if (res.success && res.data?.expenses) setExpenses(res.data.expenses);
    });
  };

  const loadDebtHistory = () => {
    if (!shopId) return;
    setLoading((p) => ({ ...p, debt: true }));
    api.getDebtHistoryAll().then((res) => {
      setLoading((p) => ({ ...p, debt: false }));
      if (res.success && res.data?.history) setDebtHistory(res.data.history);
    });
  };

  const loadSupplierHistory = () => {
    if (!shopId) return;
    setLoading((p) => ({ ...p, supplier: true }));
    api.getSupplierDebtHistoryAll().then((res) => {
      setLoading((p) => ({ ...p, supplier: false }));
      if (res.success && res.data?.history) setSupplierHistory(res.data.history);
    });
  };

  const loadActivity = () => {
    if (!shopId) return;
    setLoading((p) => ({ ...p, activity: true }));
    api.getActivityFeed({ limit: 100 }).then((res) => {
      setLoading((p) => ({ ...p, activity: false }));
      if (res.success && res.data?.items) setActivityItems(res.data.items);
    });
  };

  const openModal = (type: ModalType) => {
    setModal(type);
    setEditingSaleId(null);
    setEditingExpenseId(null);
    if (type === "sales") loadSales();
    if (type === "expenses") loadExpenses();
    if (type === "debt") loadDebtHistory();
    if (type === "supplier") loadSupplierHistory();
    if (type === "activity") loadActivity();
  };

  const startEditSale = (s: SaleItem) => {
    setEditingSaleId(s.id);
    const d = new Date(s.saleDate);
    setEditSaleCash(parseAmountString(s.cashAmount));
    setEditSaleCard(parseAmountString(s.cardAmount));
    setEditSaleBank(parseAmountString(s.bankAmount));
    setEditSaleDate(d.toISOString().slice(0, 10));
    setEditSaleTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setEditSaleComment(s.comment || "");
  };

  const saveSale = async () => {
    if (!editingSaleId) return;
    if (editSaleCash === 0 && editSaleCard === 0 && editSaleBank === 0) return;
    setSavingSale(true);
    const res = await api.updateSale(editingSaleId, {
      cashAmount: editSaleCash,
      cardAmount: editSaleCard,
      bankAmount: editSaleBank,
      saleDateTime: `${editSaleDate}T${editSaleTime}:00`,
      comment: editSaleComment.trim() || undefined,
    });
    setSavingSale(false);
    if (res.success) {
      setEditingSaleId(null);
      loadSales();
    }
  };

  const startEditExpense = (e: ExpenseItem) => {
    setEditingExpenseId(e.id);
    setEditExpAmount(parseAmountString(e.amount));
    setEditExpCategory(e.category || "");
    setEditExpDescription(e.description || "");
    setEditExpDate(e.expenseDate.slice(0, 10));
    const method = (e.paymentMethod === "CARD" || e.paymentMethod === "BANK") ? e.paymentMethod : "CASH";
    setEditExpPaymentMethod(method);
  };

  const saveExpense = async () => {
    if (!editingExpenseId) return;
    if (editExpAmount <= 0) return;
    setSavingExpense(true);
    const res = await api.updateExpense(editingExpenseId, {
      amount: editExpAmount,
      category: editExpCategory.trim() || undefined,
      description: editExpDescription.trim() || undefined,
      expenseDate: editExpDate,
      paymentMethod: editExpPaymentMethod,
    });
    setSavingExpense(false);
    if (res.success) {
      setEditingExpenseId(null);
      loadExpenses();
    }
  };

  return (
    <AppPage>
      <AppHeader
        title={t("navReport")}
        rightClassName="shrink-0 flex items-center justify-end gap-1 min-h-[2.5rem]"
        right={
          <>
            <button
              type="button"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
              aria-label={t("search")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
              aria-label={t("notifications")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-app-primary ring-2 ring-white dark:ring-slate-900" aria-hidden />
            </button>
          </>
        }
      />

      <main className="flex-1 overflow-auto px-4 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          {t("reportSectionAnalytical")}
        </p>
        <ul className="space-y-3">
          {REPORT_CARDS.map((card) => (
            <li key={card.labelKey}>
              <button
                type="button"
                onClick={() => (card.type === "sales" ? navigate("/reports/sales") : card.type === "expenses" ? navigate("/reports/expenses") : card.type && openModal(card.type))}
                className="w-full rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md active:scale-[0.99] transition-all p-4 flex items-center gap-4 text-left"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <card.Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    {t(card.labelKey)}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {t(card.descKey)}
                  </p>
                </div>
                <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {/* Modal overlay */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex flex-col items-stretch justify-end sm:justify-center sm:items-center p-0 sm:p-4"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl max-h-[90vh] w-full sm:max-w-lg flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {modal === "sales" && t("reportSalesHistoryTitle")}
                {modal === "expenses" && t("reportExpensesHistoryTitle")}
                {modal === "debt" && t("reportDebtHistoryTitle")}
                {modal === "supplier" && t("reportSupplierHistoryTitle")}
                {modal === "activity" && t("reportActivityTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label={t("close")}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {modal === "sales" && (
                <>
                  {loading.sales ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4">{t("loading")}</p>
                  ) : editingSaleId ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("editSale")}</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t("cash")}</label>
                          <AmountInput value={editSaleCash} onChange={setEditSaleCash} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t("card")}</label>
                          <AmountInput value={editSaleCard} onChange={setEditSaleCard} />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t("bankAccount")}</label>
                          <AmountInput value={editSaleBank} onChange={setEditSaleBank} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={editSaleDate}
                          onChange={(e) => setEditSaleDate(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        />
                        <input
                          type="time"
                          value={editSaleTime}
                          onChange={(e) => setEditSaleTime(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <textarea
                        value={editSaleComment}
                        onChange={(e) => setEditSaleComment(e.target.value)}
                        placeholder={t("saleCommentPlaceholder")}
                        rows={2}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSaleId(null)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                        >
                          {t("close")}
                        </button>
                        <button
                          type="button"
                          onClick={saveSale}
                          disabled={savingSale}
                          className="flex-1 py-2.5 rounded-xl bg-app-primary text-white font-medium disabled:opacity-60"
                        >
                          {savingSale ? t("saving") : t("save")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {sales.length === 0 && <p className="text-slate-500 text-sm py-4">{t("salesHistoryEmpty")}</p>}
                      {sales.map((s) => {
                        const total = parseAmountString(s.cashAmount) + parseAmountString(s.cardAmount) + parseAmountString(s.bankAmount);
                        return (
                          <li
                            key={s.id}
                            className="rounded-xl border border-slate-200 dark:border-slate-600 p-3 flex items-center justify-between gap-2"
                          >
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{formatSum(total)} {t("currency")}</p>
                              <p className="text-xs text-slate-500">{formatDateTime(s.saleDate)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => startEditSale(s)}
                              className="px-3 py-1.5 rounded-lg bg-app-primary text-white text-sm font-medium"
                            >
                              {t("details")}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}

              {modal === "expenses" && (
                <>
                  {loading.expenses ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4">{t("loading")}</p>
                  ) : editingExpenseId ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t("editExpense")}</p>
                      <div>
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">{t("expenseAmount")}</label>
                        <AmountInput value={editExpAmount} onChange={setEditExpAmount} />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">{t("expenseCategory")}</label>
                        <input
                          type="text"
                          value={editExpCategory}
                          onChange={(e) => setEditExpCategory(e.target.value)}
                          placeholder={t("expenseCategoryPlaceholder")}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">{t("expenseDescription")}</label>
                        <input
                          type="text"
                          value={editExpDescription}
                          onChange={(e) => setEditExpDescription(e.target.value)}
                          placeholder={t("expenseDescriptionPlaceholder")}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">{t("expenseDate")}</label>
                        <input
                          type="date"
                          value={editExpDate}
                          onChange={(e) => setEditExpDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">{t("paymentMethod")}</label>
                        <div className="flex gap-2">
                          {(["CASH", "CARD", "BANK"] as const).map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setEditExpPaymentMethod(m)}
                              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border ${
                                editExpPaymentMethod === m
                                  ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                                  : "border-slate-200 dark:border-slate-600"
                              }`}
                            >
                              <PaymentMethodIcon type={m} className="w-4 h-4" />
                              {m === "CASH" && t("cash")}
                              {m === "CARD" && t("card")}
                              {m === "BANK" && t("bankAccount")}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingExpenseId(null)}
                          className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                        >
                          {t("close")}
                        </button>
                        <button
                          type="button"
                          onClick={saveExpense}
                          disabled={savingExpense}
                          className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-medium disabled:opacity-60"
                        >
                          {savingExpense ? t("saving") : t("save")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {expenses.length === 0 && <p className="text-slate-500 text-sm py-4">{t("expensesHistoryEmpty")}</p>}
                      {expenses.map((e) => (
                        <li
                          key={e.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-600 p-3 flex items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100">{formatSum(parseAmountString(e.amount))} {t("currency")}</p>
                            {e.category && <p className="text-xs text-amber-600 dark:text-amber-400">{e.category}</p>}
                            <p className="text-xs text-slate-500">{formatDate(e.expenseDate)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditExpense(e)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium"
                          >
                            {t("details")}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {modal === "debt" && (
                <>
                  {loading.debt ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4">{t("loading")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {debtHistory.length === 0 && <p className="text-slate-500 text-sm py-4">{t("debtHistoryEmpty")}</p>}
                      {debtHistory.map((h) => (
                        <li key={h.id} className="rounded-xl border border-slate-200 dark:border-slate-600 p-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{h.debtorName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{h.action} — {formatSum(h.summa)} {t("currency")}</p>
                              <p className="text-xs text-slate-500">{formatDateTime(h.createdAt)}</p>
                            </div>
                            {h.qoldiq != null && (
                              <span className="text-xs font-medium text-slate-500">Qoldiq: {formatSum(h.qoldiq)}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {modal === "supplier" && (
                <>
                  {loading.supplier ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4">{t("loading")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {supplierHistory.length === 0 && <p className="text-slate-500 text-sm py-4">{t("supplierHistoryEmpty")}</p>}
                      {supplierHistory.map((h) => (
                        <li key={h.id} className="rounded-xl border border-slate-200 dark:border-slate-600 p-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-100">{h.supplierName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{h.action} — {formatSum(h.summa)} {t("currency")}</p>
                              <p className="text-xs text-slate-500">{formatDateTime(h.createdAt)}</p>
                            </div>
                            {h.qoldiq != null && (
                              <span className="text-xs font-medium text-slate-500">Qoldiq: {formatSum(h.qoldiq)}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}

              {modal === "activity" && (
                <>
                  {loading.activity ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm py-4">{t("loading")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {activityItems.length === 0 && <p className="text-slate-500 text-sm py-4">{t("activityEmpty")}</p>}
                      {activityItems.map((item, i) => (
                        <li key={`${item.type}-${item.id}-${i}`} className="rounded-xl border border-slate-200 dark:border-slate-600 p-3">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{item.label}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{formatSum(item.summa)} {t("currency")}</p>
                          {(item.debtorName || item.supplierName) && (
                            <p className="text-xs text-slate-500">{item.debtorName || item.supplierName}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-0.5">{formatDateTime(item.date)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="reports" />
    </AppPage>
  );
}
