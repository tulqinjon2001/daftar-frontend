import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { AppPage } from "../components/AppPage";
import { useProfileStore } from "../stores/profileStore";
import { useLanguageStore } from "../stores/languageStore";

type CustomerData = {
  summary: { totalBorrowed: number; totalPaid: number; totalCurrentDebt: number; shopsCount: number };
  shops: Array<{ shopId: string; shopName: string; totalBorrowed: number; totalPaid: number; currentDebt: number }>;
  history: Array<{
    id: string;
    createdAt: string;
    date: string;
    action: string;
    amount: number;
    qoldiq: number | null;
    shopId: string;
    shopName: string;
  }>;
};

const money = (n: number) => new Intl.NumberFormat("uz-UZ").format(Number(n || 0));

function formatLastUpdate(createdAt: string | undefined, locale: string, prefix: string, todayLabel: string): string {
  if (!createdAt) return `${prefix}: -`;
  const d = new Date(createdAt);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `${prefix}: ${todayLabel}, ${d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
  return `${prefix}: ${d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })}`;
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const lang = useLanguageStore((s) => s.lang);
  const profile = useProfileStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<CustomerData | null>(null);
  const txt =
    lang === "ru"
      ? {
          locale: "ru-RU",
          title: "Долги по магазинам",
          loading: "Загрузка...",
          loadErr: "Не удалось загрузить данные",
          totalDebt: "Общая задолженность",
          customer: "Покупатель",
          lastUpdate: "Последнее обновление",
          today: "Сегодня",
          active: "ACTIVE",
          closed: "ЗАКРЫТО",
          debtAmount: "Сумма долга",
          noDebt: "Пока нет данных о долге",
          back: "Назад",
          profile: "Профиль",
        }
      : lang === "en"
        ? {
            locale: "en-US",
            title: "Debt by shops",
            loading: "Loading...",
            loadErr: "Failed to load data",
            totalDebt: "Total debt",
            customer: "Customer",
            lastUpdate: "Last update",
            today: "Today",
            active: "ACTIVE",
            closed: "CLOSED",
            debtAmount: "Debt amount",
            noDebt: "No debt data yet",
            back: "Back",
            profile: "Profile",
          }
        : lang === "uz-Cyrl"
          ? {
              locale: "uz-Cyrl-UZ",
              title: "Дўконлар бўйича қарз",
              loading: "Юкланмоқда...",
              loadErr: "Маълумотни юклаб бўлмади",
              totalDebt: "Жами қарздорлик",
              customer: "Харидор",
              lastUpdate: "Сўнгги янгиланиш",
              today: "Бугун",
              active: "ACTIVE",
              closed: "ЁПИЛГАН",
              debtAmount: "Қарз миқдори",
              noDebt: "Ҳозирча қарз маълумоти йўқ",
              back: "Орқага",
              profile: "Профил",
            }
          : {
              locale: "uz-UZ",
              title: "Do'konlar bo'yicha qarz",
              loading: "Yuklanmoqda...",
              loadErr: "Ma'lumotni yuklab bo'lmadi",
              totalDebt: "Jami qarzdorlik",
              customer: "Xaridor",
              lastUpdate: "So'nggi yangilanish",
              today: "Bugun",
              active: "ACTIVE",
              closed: "YOPILGAN",
              debtAmount: "Qarz miqdori",
              noDebt: "Hozircha qarz ma'lumoti yo'q",
              back: "Orqaga",
              profile: "Profil",
            };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.getMyDebtSummary();
      setLoading(false);
      if (!res.success || !res.data) {
        setError(res.message || txt.loadErr);
        return;
      }
      setData(res.data);
    })();
  }, [txt.loadErr]);

  return (
    <AppPage>
      <header className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={txt.back}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[18px] font-bold text-slate-900 dark:text-slate-100">{txt.title}</h1>
          <button
            type="button"
            onClick={() => navigate("/customer/profile")}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={txt.profile}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM4.5 20a7.5 7.5 0 1115 0" />
            </svg>
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {loading ? <p className="text-sm text-slate-500">{txt.loading}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {data ? (
          <>
            <section className="rounded-2xl bg-app-primary p-4 shadow-lg shadow-app-primary/25">
              <p className="text-sm text-white/80">{txt.totalDebt}</p>
              <p className="text-4xl font-extrabold tracking-tight text-white mt-1">
                {money(data.summary.totalCurrentDebt)} so'm
              </p>
              <p className="text-xs text-white/70 mt-1">
                {profile.name || txt.customer} • +998 {profile.phone}
              </p>
            </section>

            <section className="space-y-3">
              <div className="space-y-3">
                {data.shops.map((s) => {
                  const lastHistory = data.history.find((h) => h.shopId === s.shopId);
                  const isActive = s.currentDebt > 0;
                  return (
                    <button
                      type="button"
                      key={s.shopId || s.shopName}
                      onClick={() => navigate(`/customer/shop/${encodeURIComponent(s.shopId)}`, { state: { shopName: s.shopName } })}
                      className="w-full text-left rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm p-4 transition-colors hover:border-app-primary/40 dark:hover:border-app-primary/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-none">
                            {s.shopName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatLastUpdate(lastHistory?.createdAt, txt.locale, txt.lastUpdate, txt.today)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                            isActive
                              ? "bg-app-primary/15 text-app-primary-dark dark:bg-app-primary/20 dark:text-app-primary"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300"
                          }`}
                        >
                          {isActive ? txt.active : txt.closed}
                        </span>
                      </div>
                      <div className="mt-4 flex items-end justify-between">
                        <p className="text-lg text-slate-500 dark:text-slate-400">{txt.debtAmount}</p>
                        <p
                          className={`text-4xl font-extrabold leading-none ${
                            isActive
                              ? "text-app-primary-dark dark:text-app-primary"
                              : "text-slate-300 dark:text-slate-500 line-through"
                          }`}
                        >
                          {money(s.currentDebt)} so'm
                        </p>
                      </div>
                    </button>
                  );
                })}
                {!data.shops.length ? (
                  <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4">
                    <p className="text-sm text-slate-500">{txt.noDebt}</p>
                  </div>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </main>
    </AppPage>
  );
}
