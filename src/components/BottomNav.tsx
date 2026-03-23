import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import type { Translations } from "../i18n/translations";

export type NavTab = "main" | "clients" | "suppliers" | "reports" | "settings";

const navItems: { tab: NavTab; path: string; key: keyof Translations; Icon: () => ReactElement }[] = [
  {
    tab: "main",
    path: "/dashboard",
    key: "navMain",
    Icon: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    tab: "clients",
    path: "/clients",
    key: "navClients",
    Icon: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    tab: "suppliers",
    path: "/suppliers",
    key: "navSupplier",
    Icon: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 001-1v-3a1 1 0 00-1-1H9m-5-1h4m-4 0V8m0 0V4m0 0H9" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 16a1 1 0 11-2 0 1 1 0 012 0m6 0a1 1 0 11-2 0 1 1 0 012 0" />
      </svg>
    ),
  },
  {
    tab: "reports",
    path: "/reports",
    key: "navReport",
    Icon: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    tab: "settings",
    path: "/profile",
    key: "navSettings",
    Icon: () => (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function BottomNav({ activeTab }: { activeTab: NavTab }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] z-30 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map(({ tab, path, key, Icon }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => navigate(path)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[52px] py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-app-primary dark:text-app-primary font-semibold"
                  : "text-slate-400 dark:text-slate-500 font-medium hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Icon />
              <span className="text-[10px] uppercase tracking-wider leading-tight">{t(key)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
