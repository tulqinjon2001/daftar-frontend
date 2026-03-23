import { useState, useRef, useEffect } from "react";
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

const EXPENSE_CATEGORIES_KEY = "expenseCategories";
const EXPENSE_LAST_CATEGORY_KEY = "expenseLastCategory";

function getStoredCategories(): string[] {
  try {
    const raw = localStorage.getItem(EXPENSE_CATEGORIES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x.trim()) : [];
  } catch {
    return [];
  }
}

function setStoredLastCategory(cat: string) {
  try {
    localStorage.setItem(EXPENSE_LAST_CATEGORY_KEY, cat.trim());
  } catch {}
}

function addCategoryToStorage(cat: string) {
  const trimmed = cat.trim();
  if (!trimmed) return;
  const list = getStoredCategories();
  if (list.includes(trimmed)) return;
  list.push(trimmed);
  try {
    localStorage.setItem(EXPENSE_CATEGORIES_KEY, JSON.stringify(list));
  } catch {}
}

export default function AddExpense() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const calculateSales = useSettingsStore((s) => s.calculateSales);

  const [formAmount, setFormAmount] = useState(0);
  const [formCategory, setFormCategory] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState<"CASH" | "CARD" | "BANK">("CASH");
  const now = new Date();
  const [formDate, setFormDate] = useState(() => now.toISOString().slice(0, 10));
  const [formTime, setFormTime] = useState(() =>
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [addTypeModalOpen, setAddTypeModalOpen] = useState(false);
  const [newExpenseTypeName, setNewExpenseTypeName] = useState("");
  const [balance, setBalance] = useState<{ cash: string; card: string; bank: string; total: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitLockRef = useRef(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const categories = getStoredCategories();

  useEffect(() => {
    if (!calculateSales) return;
    api.getBalance().then((res) => {
      if (res.success && res.data) setBalance(res.data);
    }).catch(() => {});
  }, [calculateSales]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categoryDropdownOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return;
    if (!formAmount || formAmount <= 0) {
      setError(t("expenseAmountPlaceholder"));
      return;
    }
    if (!calculateSales) {
      setError("Savdoni hisoblash sozlamada yoqilishi kerak (balansdan ayirish uchun).");
      return;
    }
    setError("");
    submitLockRef.current = true;
    setSubmitting(true);
    const expenseDate = `${formDate}T${formTime}:00`;
    const description = formNote.trim() || undefined;
    const category = formCategory.trim() || undefined;
    try {
      const res = await api.createExpense({
        amount: formAmount,
        category,
        description,
        expenseDate,
        paymentMethod: formPaymentMethod,
      });
      if (res.success) {
        if (category) {
          setStoredLastCategory(category);
          addCategoryToStorage(category);
        }
        api.getBalance().then((r) => { if (r.success && r.data) setBalance(r.data); });
        navigate("/expenses");
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
      <AppHeader title={t("addExpense")} backFallback="/expenses" />

      <main className="flex-1 px-4 py-6">
        {!calculateSales && (
          <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-xl mb-4">
            Balansdan ayirish uchun Profil → Savdoni hisoblash ni yoqing.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Xarajat summasi — rasmdagi: label, keyin UZS (yashil) + katta raqam */}
          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t("expenseAmount")}
            </label>
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-4">
              <span className="text-base font-semibold text-app-primary">{t("currency")}</span>
              <AmountInput
                value={formAmount}
                onChange={setFormAmount}
                className="flex-1 min-w-0 text-2xl font-bold border-0 focus:ring-0"
              />
            </div>
          </div>

          <div ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t("expenseType")}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen((v) => !v)}
                className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 py-3 px-4 text-left"
              >
                <div className="w-10 h-10 shrink-0 flex items-center justify-center text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm0 0h16v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
                <span className={`flex-1 min-w-0 text-left ${formCategory ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>
                  {formCategory || t("selectExpenseType")}
                </span>
                <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${categoryDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {categoryDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg z-20 max-h-56 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      setNewExpenseTypeName("");
                      setAddTypeModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-app-primary hover:bg-slate-50 dark:hover:bg-slate-700/50 font-medium"
                  >
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t("addExpenseType")}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setFormCategory(c);
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 ${formCategory === c ? "bg-app-primary/10 dark:bg-app-primary/20 text-app-primary-dark dark:text-app-primary font-medium" : "text-slate-800 dark:text-slate-100"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {calculateSales && (
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t("paymentMethod")}
              </label>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-300">
                {t("availableBalance")}:{" "}
                <span className="font-bold tabular-nums text-app-primary">
                  {balance
                    ? `${formatSum(parseFloat(formPaymentMethod === "CASH" ? balance.cash : formPaymentMethod === "CARD" ? balance.card : balance.bank) || 0)} ${t("currency")}`
                    : "—"}
                </span>
              </p>
              <div className="flex gap-3">
                {(["CASH", "CARD", "BANK"] as const).map((m) => {
                  const label = m === "CASH" ? t("cash") : m === "CARD" ? t("card") : t("bankAccount");
                  const active = formPaymentMethod === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormPaymentMethod(m)}
                      className={`flex-1 py-4 rounded-2xl text-sm font-bold border-2 transition-colors flex flex-col items-center justify-center gap-2 ${
                        active
                          ? "bg-app-primary border-app-primary text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <PaymentMethodIcon
                        type={m}
                        className={active ? "w-6 h-6 text-white" : "w-6 h-6 text-slate-400 dark:text-slate-500"}
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t("dateLabel")}
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                />
                <svg className="w-5 h-5 text-slate-300 dark:text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t("dateAndTime").split(" ").pop()}
              </label>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-3">
                <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <input
                  type="time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-slate-100 text-sm focus:outline-none"
                />
                <svg className="w-5 h-5 text-slate-300 dark:text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
              {t("expenseDescription")}
            </label>
            <textarea
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              placeholder={t("expenseNotePlaceholder")}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary resize-none text-base"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-2xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !calculateSales}
            className="w-full py-4 rounded-2xl text-white font-bold shadow-md flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-transform disabled:opacity-60 disabled:pointer-events-none bg-app-primary"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            {submitting ? t("saving") : t("save")}
          </button>
        </form>
      </main>

      {/* Kichik modal: Xarajat turini qo'shish */}
      {addTypeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setAddTypeModalOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {t("addExpenseTypeModalTitle")}
              </h3>
            </div>
            <div className="px-4 pb-4">
              <input
                type="text"
                value={newExpenseTypeName}
                onChange={(e) => setNewExpenseTypeName(e.target.value)}
                placeholder={t("addExpenseTypePlaceholder")}
                className="w-full mt-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-app-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const trimmed = newExpenseTypeName.trim();
                    if (trimmed) {
                      addCategoryToStorage(trimmed);
                      setStoredLastCategory(trimmed);
                      setFormCategory(trimmed);
                      setAddTypeModalOpen(false);
                      setNewExpenseTypeName("");
                    }
                  }
                  if (e.key === "Escape") setAddTypeModalOpen(false);
                }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setAddTypeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {t("close")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newExpenseTypeName.trim();
                    if (!trimmed) return;
                    addCategoryToStorage(trimmed);
                    setStoredLastCategory(trimmed);
                    setFormCategory(trimmed);
                    setAddTypeModalOpen(false);
                    setNewExpenseTypeName("");
                  }}
                  disabled={!newExpenseTypeName.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:pointer-events-none hover:brightness-110 bg-app-primary"
                >
                  {t("add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="main" />
    </AppPage>
  );
}
