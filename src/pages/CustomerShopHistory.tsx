import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppPage } from "../components/AppPage";
import { api } from "../api/client";
import { useLanguageStore } from "../stores/languageStore";

type HistoryRow = {
  id: string;
  createdAt: string;
  date: string;
  action: string;
  amount: number;
  qoldiq: number | null;
  shopId: string;
  shopName: string;
};

const money = (n: number) => new Intl.NumberFormat("uz-UZ").format(Number(n || 0));

export default function CustomerShopHistory() {
  const navigate = useNavigate();
  const { shopId = "" } = useParams();
  const location = useLocation();
  const lang = useLanguageStore((s) => s.lang);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [shopName, setShopName] = useState<string>((location.state as { shopName?: string } | null)?.shopName || "");

  const txt = useMemo(
    () =>
      lang === "ru"
        ? {
            locale: "ru-RU",
            title: "История по магазину",
            loading: "Загрузка...",
            error: "Не удалось загрузить историю",
            empty: "История по этому магазину пока пуста",
            debtAction: "Долг взят",
            payAction: "Оплачено",
            amount: "Сумма",
            balance: "Остаток",
            totalDebt: "Общий долг",
            debtIn: "Взято",
            debtOut: "Оплачено",
            operations: "Операции",
            back: "Назад",
          }
        : lang === "en"
          ? {
              locale: "en-US",
              title: "Shop transaction history",
              loading: "Loading...",
              error: "Failed to load history",
              empty: "No history for this shop yet",
              debtAction: "Debt taken",
              payAction: "Paid",
              amount: "Amount",
              balance: "Balance",
              totalDebt: "Total debt",
              debtIn: "Borrowed",
              debtOut: "Paid",
              operations: "Operations",
              back: "Back",
            }
          : lang === "uz-Cyrl"
            ? {
                locale: "uz-Cyrl-UZ",
                title: "Дўкон бўйича олди-берди тарихи",
                loading: "Юкланмоқда...",
                error: "Тарихни юклаб бўлмади",
                empty: "Бу дўкон бўйича тарих ҳали йўқ",
                debtAction: "Қарз олинди",
                payAction: "Тўланди",
                amount: "Сумма",
                balance: "Қолдиқ",
                totalDebt: "Жами қарз",
                debtIn: "Олинган",
                debtOut: "Тўланган",
                operations: "Амалиётлар",
                back: "Орқага",
              }
            : {
                locale: "uz-UZ",
                title: "Do'kon bo'yicha oldi-berdi tarixi",
                loading: "Yuklanmoqda...",
                error: "Tarixni yuklab bo'lmadi",
                empty: "Bu do'kon bo'yicha tarix hali yo'q",
                debtAction: "Qarz olindi",
                payAction: "To'landi",
                amount: "Summa",
                balance: "Qoldiq",
                totalDebt: "Jami qarz",
                debtIn: "Olgan",
                debtOut: "To'lagan",
                operations: "Amaliyotlar",
                back: "Orqaga",
              },
    [lang]
  );

  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let current = 0;
    for (const h of history) {
      const isPayment = /to'lov|тўлов|payment|оплат/i.test(h.action);
      if (isPayment) totalOut += Number(h.amount || 0);
      else totalIn += Number(h.amount || 0);
    }
    if (history.length) {
      const latest = [...history].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
      current = Number(latest?.qoldiq || 0);
    }
    return { totalIn, totalOut, current };
  }, [history]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.getMyDebtSummary();
      setLoading(false);
      if (!res.success || !res.data) {
        setError(res.message || txt.error);
        return;
      }
      const all = res.data.history || [];
      const filtered = all.filter((h) => h.shopId === shopId);
      setHistory(filtered);
      if (!shopName) {
        const row = filtered[0];
        if (row?.shopName) setShopName(row.shopName);
      }
    })();
  }, [shopId, txt.error, shopName]);

  return (
    <AppPage>
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate("/customer")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={txt.back}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 truncate">{txt.title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{shopName || "-"}</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)]">
        {loading ? <p className="text-sm text-slate-500">{txt.loading}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {!loading && !error ? (
          <div className="space-y-4">
            <section className="rounded-2xl p-4 bg-app-primary text-white shadow-lg shadow-app-primary/30">
              <p className="text-xs uppercase tracking-wide text-white/75">{txt.totalDebt}</p>
              <p className="text-4xl font-extrabold mt-1">{money(stats.current)} so'm</p>
              <div className="mt-4 pt-3 border-t border-white/20 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/70">{txt.debtIn}</p>
                  <p className="text-xl font-bold">{money(stats.totalIn)} so'm</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">{txt.debtOut}</p>
                  <p className="text-xl font-bold text-rose-100">{money(stats.totalOut)} so'm</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-app-primary-dark dark:text-app-primary mb-3">{txt.operations}</h2>
              <div className="space-y-2">
                {history.map((h) => {
                  const isPayment = /to'lov|тўлов|payment|оплат/i.test(h.action);
                  const actionLabel = isPayment ? txt.payAction : txt.debtAction;
                  return (
                    <div
                      key={h.id}
                      className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-9 h-9 shrink-0 rounded-full inline-flex items-center justify-center ${isPayment ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-app-primary/15 text-app-primary dark:bg-app-primary/20 dark:text-app-primary"}`}>
                            {isPayment ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{actionLabel}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(h.createdAt).toLocaleString(txt.locale)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-extrabold ${isPayment ? "text-rose-600 dark:text-rose-400" : "text-app-primary-dark dark:text-app-primary"}`}>
                            {isPayment ? "-" : "+"}{money(h.amount)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {txt.balance}: {money(h.qoldiq ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!history.length ? <p className="text-sm text-slate-500">{txt.empty}</p> : null}
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </AppPage>
  );
}
