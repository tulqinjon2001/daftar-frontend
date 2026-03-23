import { formatAmountDisplay, parseAmountInput } from "../utils/amountFormat";

/** Barcha summa kiritadigan inputlar uchun yagona dizayn. Ming/million orasi probel bilan. */
const amountInputClass =
  "w-full min-w-0 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-right tabular-nums placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-app-primary/50 focus:border-app-primary transition";

export type AmountInputProps = {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputMode?: "numeric" | "decimal";
  "aria-label"?: string;
};

export function AmountInput({
  value,
  onChange,
  placeholder = "0",
  disabled,
  className = "",
  inputMode = "numeric",
  "aria-label": ariaLabel,
}: AmountInputProps) {
  const display = formatAmountDisplay(value);

  return (
    <input
      type="text"
      inputMode={inputMode}
      value={display}
      onChange={(e) => onChange(parseAmountInput(e.target.value))}
      onFocus={(e) => e.target.select()}
      placeholder={placeholder}
      disabled={disabled}
      className={`${amountInputClass} ${className}`.trim()}
      aria-label={ariaLabel}
    />
  );
}

export { amountInputClass };
