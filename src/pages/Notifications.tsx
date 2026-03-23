import { useTranslation } from "../i18n/useTranslation";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";

export default function Notifications() {
  const { t } = useTranslation();

  return (
    <AppPage>
      <AppHeader title={t("notifications")} />

      <main className="flex-1 px-4 py-5">
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-12">{t("notificationsEmpty")}</p>
      </main>

      <BottomNav activeTab="main" />
    </AppPage>
  );
}
