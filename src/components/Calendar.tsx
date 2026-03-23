import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

const WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];
const MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

function toDateStr(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date): boolean {
  const t = new Date();
  return isSameDay(d, t);
}

interface CalendarProps {
  value: string; // YYYY-MM-DD
  min?: string;
  max?: string;
  onSelect: (dateStr: string) => void;
  onToday?: () => void;
}

export function Calendar({ value, min, max, onSelect, onToday }: CalendarProps) {
  const { t } = useTranslation();
  const valueDate = value ? new Date(value + "T12:00:00") : new Date();
  const [viewDate, setViewDate] = useState(new Date(valueDate.getFullYear(), valueDate.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7;
  const daysInMonth = lastDay.getDate();
  const totalCells = 42;
  const endPad = totalCells - startPad - daysInMonth;
  const days: Date[] = [];
  for (let i = 0; i < startPad; i++) {
    const d = new Date(firstDay);
    d.setDate(d.getDate() - (startPad - i));
    days.push(d);
  }
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  for (let i = 0; i < endPad; i++) days.push(new Date(year, month + 1, i + 1));

  const minDate = min ? new Date(min + "T12:00:00") : null;
  const maxDate = max ? new Date(max + "T12:00:00") : null;

  const canPrev = !minDate || new Date(year, month - 1, 1) >= minDate;
  const canNext = !maxDate || new Date(year, month + 1, 1) <= maxDate;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
            disabled={!canPrev}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Oldingi oy"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            disabled={!canNext}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Keyingi oy"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 py-1">
              {w}
            </div>
          ))}
          {days.map((d, i) => {
            const dateStr = toDateStr(d);
            const isOtherMonth = d.getMonth() !== month;
            const selected = value && isSameDay(d, valueDate);
            const today = isToday(d);
            const disabled =
              (minDate != null && d < minDate) || (maxDate != null && d > maxDate);
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onSelect(dateStr)}
                className={`
                  w-9 h-9 rounded-xl text-sm font-medium flex items-center justify-center transition-colors
                  ${isOtherMonth ? "text-slate-300 dark:text-slate-500" : "text-slate-800 dark:text-slate-100"}
                  ${selected ? "bg-app-primary text-white hover:bg-app-primary-dark shadow-md" : ""}
                  ${!selected && !disabled ? "hover:bg-slate-100 dark:hover:bg-slate-700" : ""}
                  ${today && !selected ? "ring-2 ring-app-primary" : ""}
                  ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
        {onToday && (
          <button
            type="button"
            onClick={onToday}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {t("today")}
          </button>
        )}
      </div>
    </div>
  );
}
