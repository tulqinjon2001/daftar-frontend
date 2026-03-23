import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { formatSum } from "../utils/amountFormat";

interface ExpenseItem {
  id: string;
  amount: string;
  category: string | null;
  description: string | null;
  expenseDate: string;
  createdAt: string;
}

function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

export default function Expenses() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const shopId = useProfileStore((s) => s.shopId);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [total, setTotal] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  const loadExpenses = () => {
    if (!shopId) return;
    setLoading(true);
    api
      .getExpenses()
      .then((res) => {
        setLoading(false);
        if (res.success && res.data) {
          setExpenses(res.data.expenses);
          setTotal(res.data.total ?? "0");
        }
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadExpenses();
  }, [shopId]);

  const handleDelete = (id: string) => {
    if (!window.confirm(t("deleteExpense") + "?")) return;
    api.deleteExpense(id).then((res) => {
      if (res.success) loadExpenses();
    });
  };

  return (
    <AppPage>
      <AppHeader
        title={t("navExpenses")}
        right={
          <button
            type="button"
            onClick={() => navigate("/expenses/new")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg hover:brightness-110 active:scale-95 transition-transform bg-app-primary"
            aria-label={t("addExpense")}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        }
      />

      <main className="flex-1 px-4 py-4 overflow-auto">
        {/* Jami xarajat */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v1h-2M3 7v11a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2v11z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t("totalExpenses")}
              </p>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {loading ? "—" : formatSum(parseFloat(total) || 0)} <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{t("currency")}</span>
              </p>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
            {t("loading")}
          </p>
        ) : (
          <ul className="space-y-3">
            {expenses.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {formatSum(parseFloat(item.amount) || 0)} {t("currency")}
                    </p>
                    {item.category && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                        {item.category}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {formatDate(item.expenseDate)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label={t("deleteExpense")}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && expenses.length === 0 && (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
            {t("expensesEmpty")}
          </p>
        )}
      </main>

      <BottomNav activeTab="main" />
    </AppPage>
  );
}
