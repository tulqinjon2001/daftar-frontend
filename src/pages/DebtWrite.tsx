import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useClientStore, type Client } from "../stores/clientStore";
import { useProfileStore } from "../stores/profileStore";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { AmountInput } from "../components/AmountInput";

export default function DebtWrite() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const locationState = (location.state as { client?: Client } | null) || null;
  const client = locationState?.client;
  const shopId = useProfileStore((s) => s.shopId);
  const updateClientDebt = useClientStore((s) => s.updateClientDebt);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<"goods" | "debt" | "services" | "other">("debt");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <AppPage>
      <AppHeader title={t("recordDebtBtn")} backFallback="/clients" />

      <main className="flex-1 px-4 pt-2 pb-24 space-y-5">
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden shrink-0" />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {client?.name || "—"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("clientRoleLabel")}</p>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">{t("expenseAmount")}</p>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center justify-between">
            <AmountInput
              value={amount}
              onChange={setAmount}
              className="flex-1 min-w-0 text-2xl font-bold text-app-primary border-0 focus:ring-0 bg-transparent"
            />
            <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t("currency")}
            </span>
          </div>
        </section>

        <section className="mb-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">{t("dateLabel")}</p>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-app-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>
        </section>

        <section className="mb-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">
            {t("expenseCategory")}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "goods" as const, label: t("debtCategoryGoods") },
              { key: "debt" as const, label: t("debtCategoryBorrow") },
              { key: "services" as const, label: t("categoryServices") },
              { key: "other" as const, label: t("debtCategoryOther") },
            ].map((item) => {
              const active = category === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                    active
                      ? "bg-app-primary/15 dark:bg-app-primary/20 border-app-primary text-app-primary-dark dark:text-app-primary"
                      : "bg-slate-100 dark:bg-slate-700/80 border-transparent text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">{error}</p>
        ) : null}

        <section>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">{t("commentOptional")}</p>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={t("expenseNotePlaceholder")}
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
            />
          </div>
        </section>
      </main>

      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          if (!client) {
            navigate(-1);
            return;
          }
          if (!amount || amount <= 0) {
            navigate(-1);
            return;
          }
          setError("");
          const debtorId = client.backendId || client.id;
          if (shopId && debtorId) {
            setLoading(true);
            const res = await api.writeDebt({
              debtorId,
              amount,
              dueDate: date || undefined,
              description: note || undefined,
            });
            setLoading(false);
            if (res.success && res.data?.debt !== undefined) {
              updateClientDebt(client.id, res.data.debt);
              navigate(-1);
            } else {
              setError(res.message || t("debtNotSaved"));
            }
          } else {
            const current = parseInt(String(client.debt || "0").replace(/[,\s]/g, ""), 10) || 0;
            const next = current + amount;
            updateClientDebt(client.id, String(next));
            navigate(-1);
          }
        }}
        className="fixed left-0 right-0 max-w-md mx-auto px-4 z-20 disabled:opacity-70"
        style={{ bottom: "4.5rem" }}
      >
        <div className="w-full py-4 rounded-2xl text-center font-bold text-white shadow-lg bg-app-primary">
          {loading ? t("saving") : t("save")}
        </div>
      </button>
      <BottomNav activeTab="clients" />
    </AppPage>
  );
}
