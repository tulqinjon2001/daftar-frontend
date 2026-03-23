import { useState, useRef, useEffect } from "react";
import { useTranslation } from "../i18n/useTranslation";
import { Calendar } from "./Calendar";

const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const monthName = MONTHS[(m || 1) - 1] || "";
  return `${d || 1} ${monthName} ${y || ""}`;
}

interface DateRangePickerProps {
  fromDate: string;
  toDate: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  variant?: "default" | "onDark";
  compact?: boolean;
}

const triggerClass =
  "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm text-left flex items-center justify-between gap-2 focus:ring-2 focus:ring-app-primary/50 focus:border-app-primary outline-none transition cursor-pointer hover:border-slate-300 dark:hover:border-slate-500";

export function DateRangePicker({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  variant = "default",
  compact = false,
}: DateRangePickerProps) {
  const { t } = useTranslation();
  const [openFor, setOpenFor] = useState<"from" | "to" | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const labelClass =
    variant === "onDark"
      ? "block text-xs font-medium text-white/90 mb-1"
      : "block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1";

  useEffect(() => {
    if (!openFor) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        fromRef.current?.contains(target) ||
        toRef.current?.contains(target) ||
        calendarRef.current?.contains(target)
      )
        return;
      setOpenFor(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openFor]);

  const todayStr = (() => {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  })();

  return (
    <div className={`${compact ? "flex gap-2 items-end" : "space-y-3"} relative`}>
      <div className={`${compact ? "min-w-0 flex-1" : ""} relative`} ref={fromRef}>
        <label className={labelClass}>{t("reportPeriodFrom")}</label>
        <button
          type="button"
          onClick={() => setOpenFor((v) => (v === "from" ? null : "from"))}
          className={triggerClass}
        >
          <span className="tabular-nums">{formatDisplayDate(fromDate) || "—"}</span>
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        {openFor === "from" && (
          <div className="absolute left-0 top-full z-50 mt-2" ref={calendarRef}>
            <Calendar
              value={fromDate}
              max={toDate}
              onSelect={(d) => {
                onFromChange(d);
                setOpenFor(null);
              }}
              onToday={() => {
                onFromChange(todayStr);
                if (toDate < todayStr) onToChange(todayStr);
                setOpenFor(null);
              }}
            />
          </div>
        )}
      </div>

      <div className={compact ? "min-w-0 flex-1" : undefined} ref={toRef}>
        <label className={labelClass}>{t("reportPeriodTo")}</label>
        <button
          type="button"
          onClick={() => setOpenFor((v) => (v === "to" ? null : "to"))}
          className={triggerClass}
        >
          <span className="tabular-nums">{formatDisplayDate(toDate) || "—"}</span>
          <svg className="w-5 h-5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        {openFor === "to" && (
          <div className="absolute left-0 top-full z-50 mt-2" ref={calendarRef}>
            <Calendar
              value={toDate}
              min={fromDate}
              onSelect={(d) => {
                onToChange(d);
                setOpenFor(null);
              }}
              onToday={() => {
                onToChange(todayStr);
                if (fromDate > todayStr) onFromChange(todayStr);
                setOpenFor(null);
              }}
            />
          </div>
        )}
      </div>

    </div>
  );
}
