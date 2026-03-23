import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Client } from "../stores/clientStore";
import { useClientStore } from "../stores/clientStore";
import { useProfileStore } from "../stores/profileStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { formatSum } from "../utils/amountFormat";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = MONTHS[d.getMonth()] || "";
  const year = d.getFullYear();
  return `${day}-${month} ${year}`;
}

export default function ClientCard() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { client?: Client } | null) || null;
  const clientFromState = state?.client;
  const clients = useClientStore((s) => s.clients);
  const updateClientDebt = useClientStore((s) => s.updateClientDebt);
  const client = clientFromState ? (clients.find((c) => c.id === clientFromState.id) || clientFromState) : null;
  const shopId = useProfileStore((s) => s.shopId);

  const [history, setHistory] = useState<Array<{ date: string; createdAt: string; action: string; summa: number; isPayment: boolean; qoldiq: number | null }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(false);
  const [historyErrorMsg, setHistoryErrorMsg] = useState("");
  const [didAttemptFetch, setDidAttemptFetch] = useState(false);

  const hasToken = typeof window !== "undefined" && !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!client?.id) {
      setLoadingHistory(false);
      return;
    }
    const debtorId = client.backendId || client.id;
    if (shopId || hasToken) {
      setHistoryError(false);
      setDidAttemptFetch(true);
      setLoadingHistory(true);
      api
        .getDebtHistory(debtorId)
        .then((res) => {
          setLoadingHistory(false);
          setHistoryError(!res.success);
          const isTokenError = res.message?.toLowerCase().includes("token") ?? false;
          setHistoryErrorMsg(isTokenError ? "Tizimga qayta kiring (sessiya tugadi)." : (res.message || ""));
          if (res.success && res.data?.history) {
            const list = res.data.history;
            setHistory(list);
            if (list.length > 0 && list[0].qoldiq != null && client?.id) {
              updateClientDebt(client.id, String(list[0].qoldiq));
            }
          } else setHistory([]);
        })
        .catch(() => {
          setLoadingHistory(false);
          setHistoryError(true);
          setHistoryErrorMsg("");
        });
    } else {
      setLoadingHistory(false);
      setDidAttemptFetch(false);
    }
  }, [client?.id, client?.backendId, shopId, hasToken, location.key]);

  if (!client) {
    navigate("/clients", { replace: true });
    return null;
  }

  const fromHistory = history.length > 0 && history[0].qoldiq != null ? history[0].qoldiq : null;
  const debtNum = fromHistory != null ? fromHistory : (parseInt(String(client.debt || "0").replace(/\s/g, ""), 10) || 0);
  const isCredit = debtNum < 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 safe-area-inset-top">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/clients"))}
            className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Orqaga"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 text-center min-w-0">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">{client.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mijoz kartasi</p>
          </div>
          <button type="button" className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Menu">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Joriy qoldiq */}
        <section className="rounded-2xl bg-slate-800 dark:bg-slate-950 px-5 py-4 text-white">
          <p className="text-sm text-slate-300 dark:text-slate-400">Joriy qoldiq</p>
          <p className={`text-2xl font-bold mt-1 ${isCredit ? "text-app-primary" : ""}`}>
            {isCredit ? `+${formatSum(Math.abs(-debtNum))}` : debtNum === 0 ? "0" : `-${formatSum(Math.abs(debtNum))}`} so'm
          </p>
        </section>

        {/* To'lov / Qarz */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/debt/pay", { state: { client } })}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 bg-app-primary"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2m-4-1V7a2 2 0 012-2h2a2 2 0 012 2v1" />
            </svg>
            To'lov
          </button>
          <button
            type="button"
            onClick={() => navigate("/debt/write", { state: { client } })}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-white bg-app-danger flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Qarz
          </button>
        </div>

        {/* Amallar tarixi */}
        <section className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">Amallar tarixi</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Saralash</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <th className="py-2.5 px-3 font-semibold">Sana</th>
                  <th className="py-2.5 px-3 font-semibold">Amal</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Summa</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Qoldiq</th>
                </tr>
              </thead>
              <tbody>
                {loadingHistory ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 dark:text-slate-400">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : historyError ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-amber-600 dark:text-amber-400 text-sm px-2">
                      {historyErrorMsg || "Tarix yuklanmadi. Internet va tizimga kirishni tekshiring."}
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 dark:text-slate-400">
                      {didAttemptFetch
                        ? "Hali amal kiritilmagan"
                        : "Amallar tarixi faqat tizimga kirgan va bazada saqlangan mijozlar uchun ko'rsatiladi."}
                    </td>
                  </tr>
                ) : (
                  history.map((row, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={row.isPayment ? "text-app-primary font-medium" : "text-red-600 dark:text-red-400 font-medium"}>
                          {row.action}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-medium ${row.isPayment ? "text-app-primary" : "text-red-600 dark:text-red-400"}`}>
                        {row.isPayment ? `+${formatSum(Math.abs(row.summa))}` : `-${formatSum(Math.abs(row.summa))}`}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-medium ${row.qoldiq != null && row.qoldiq < 0 ? "text-app-primary" : "text-slate-700 dark:text-slate-200"}`}>
                        {row.qoldiq != null
                          ? row.qoldiq < 0
                            ? `+${formatSum(Math.abs(-row.qoldiq))}`
                            : row.qoldiq === 0
                              ? "0"
                              : `-${formatSum(Math.abs(row.qoldiq))}`
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <BottomNav activeTab="clients" />
    </div>
  );
}
