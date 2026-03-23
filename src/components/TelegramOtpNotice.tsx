import { useTranslation } from "../i18n/useTranslation";

/** Qisqa eslatma: @qarzdaftarsms_bot orqali kod */
export function TelegramOtpNotice({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p
      role="note"
      className={`text-sm text-center font-medium text-sky-900 dark:text-sky-100 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 rounded-xl px-3 py-2 leading-snug ${className}`}
    >
      {t("otpSmsTelegramNotice")}
    </p>
  );
}
