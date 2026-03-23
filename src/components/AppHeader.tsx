import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";

export type AppHeaderProps = {
  title: ReactNode;
  /** Chap: masalan hamburger. Bo‘lsa, orqaga tugmasi ko‘rinmaydi. */
  left?: ReactNode;
  /** O‘ng: masalan + yoki qo‘ng‘iroq */
  right?: ReactNode;
  onBack?: () => void;
  /** history bo‘sh bo‘lsa shu yo‘nalish */
  backFallback?: string;
  /** left yo‘qida orqaga tugmasi (default: true) */
  showBackButton?: boolean;
  className?: string;
  /** Ikki ikon (qidiruv + bildirishnoma) kabi keng o‘ng blok */
  rightClassName?: string;
};

export function AppHeader({
  title,
  left,
  right,
  onBack,
  backFallback = "/dashboard",
  showBackButton = true,
  className = "",
  rightClassName = "w-11 shrink-0 flex justify-end items-center min-h-[2.5rem]",
}: AppHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate(backFallback);
  };

  const backButton = (
    <button
      type="button"
      onClick={handleBack}
      className="w-10 h-10 shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      aria-label={t("back")}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );

  const leftCell = left ?? (showBackButton ? backButton : <div className="w-10 h-10 shrink-0" aria-hidden />);

  return (
    <header
      className={`sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 safe-area-pt ${className}`.trim()}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="w-11 shrink-0 flex items-center justify-start min-h-[2.5rem]">{leftCell}</div>
        <h1 className="flex-1 min-w-0 text-center text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
          {title}
        </h1>
        <div className={rightClassName}>
          {right ?? <span className="w-10 h-10 block shrink-0" aria-hidden />}
        </div>
      </div>
    </header>
  );
}
