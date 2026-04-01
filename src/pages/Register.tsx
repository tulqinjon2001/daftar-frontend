import { useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelect from "../components/LanguageSelect";
import { useLanguageStore } from "../stores/languageStore";

export default function Register() {
  const navigate = useNavigate();
  const lang = useLanguageStore((s) => s.lang);
  const txt =
    lang === "ru"
      ? {
          title: "Регистрация",
          subtitle: "Выберите тип пользователя",
          ownerTitle: "Я владелец магазина",
          ownerDesc: "Управление магазином, клиентами, долгами и отчётами",
          customerTitle: "Я обычный покупатель",
          customerDesc: "Просмотр долгов по магазинам и истории платежей",
        }
      : lang === "en"
        ? {
            title: "Register",
            subtitle: "Choose your user type",
            ownerTitle: "I am a shop owner",
            ownerDesc: "Manage shop, clients, debts and reports",
            customerTitle: "I am a regular customer",
            customerDesc: "View debts by shops and payment history",
          }
        : lang === "uz-Cyrl"
          ? {
              title: "Рўйхатдан ўтиш",
              subtitle: "Қайси турдаги фойдаланувчи эканлигингизни танланг",
              ownerTitle: "Дўкон эгасиман",
              ownerDesc: "Дўкон, мижоз, қарз ва ҳисоботларни бошқариш",
              customerTitle: "Оддий харидорман",
              customerDesc: "Дўконлар бўйича қарзларим ва тўлов тарихини кўраман",
            }
          : {
              title: "Ro'yxatdan o'tish",
              subtitle: "Qaysi turdagi foydalanuvchi ekanligingizni tanlang",
              ownerTitle: "Do'kon egasiman",
              ownerDesc: "Do'kon, mijoz, qarz va hisobotlarni boshqarish",
              customerTitle: "Oddiy xaridorman",
              customerDesc: "Do'konlar bo'yicha qarzlarim va to'lov tariximni ko'raman",
            };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex flex-col px-4 sm:px-6 pt-4 pb-8">
      <div className="flex justify-end">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm backdrop-blur-sm">
          <ThemeToggle />
          <LanguageSelect />
        </div>
      </div>
      <div className="max-w-md w-full mx-auto flex flex-col flex-1 mt-6 sm:mt-12 justify-center">
        <div className="w-full rounded-[2rem] bg-white dark:bg-slate-800/95 shadow-xl border border-slate-100 dark:border-slate-700/50 px-5 sm:px-8 py-7 sm:py-10">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 text-center">
            {txt.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2 mb-8">
            {txt.subtitle}
          </p>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => navigate("/register-owner")}
              className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 p-4 hover:border-app-primary hover:bg-app-primary/5 transition"
            >
              <p className="font-bold text-slate-800 dark:text-slate-100">{txt.ownerTitle}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {txt.ownerDesc}
              </p>
            </button>
            <button
              type="button"
              onClick={() => navigate("/register-customer")}
              className="w-full text-left rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 p-4 hover:border-app-primary hover:bg-app-primary/5 transition"
            >
              <p className="font-bold text-slate-800 dark:text-slate-100">{txt.customerTitle}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {txt.customerDesc}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
