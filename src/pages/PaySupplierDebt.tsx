import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../i18n/useTranslation";
import { useSupplierStore, type Supplier } from "../stores/supplierStore";
import { useProfileStore } from "../stores/profileStore";
import { useSettingsStore } from "../stores/settingsStore";
import { api } from "../api/client";
import { BottomNav } from "../components/BottomNav";
import { AppPage } from "../components/AppPage";
import { AppHeader } from "../components/AppHeader";
import { PaymentMethodIcon } from "../components/PaymentMethodIcon";
import { AmountInput } from "../components/AmountInput";

export default function PaySupplierDebt() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const locationState = (location.state as { supplier?: Supplier } | null) || null;
  const supplier = locationState?.supplier;
  const shopId = useProfileStore((s) => s.shopId);
  const calculateSales = useSettingsStore((s) => s.calculateSales);
  const updateSupplierDebt = useSupplierStore((s) => s.updateSupplierDebt);

  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "BANK">("CASH");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!supplier) {
    navigate("/suppliers", { replace: true });
    return null;
  }

  const handleSave = async () => {
    if (!amount || amount <= 0) {
      setError("To'lov summasini kiriting");
      return;
    }
    setError("");
    const supplierId = supplier.backendId || supplier.id;
    if (shopId && supplierId) {
      setLoading(true);
      const res = await api.paySupplierDebt({
        supplierId,
        amount,
        note: note || undefined,
        paymentMethod: calculateSales ? paymentMethod : undefined,
      });
      setLoading(false);
      if (res.success && res.data?.debt !== undefined) {
        updateSupplierDebt(supplier.id, res.data.debt);
        navigate(-1);
      } else {
        setError(res.message || "To'lov saqlanmadi");
      }
    } else {
      const current = parseFloat(String(supplier.debt).replace(/[,\s]/g, "")) || 0;
      updateSupplierDebt(supplier.id, String(current - amount));
      navigate(-1);
    }
  };

  return (
    <AppPage>
      <AppHeader title={t("payBtn")} backFallback="/suppliers" />

      <main className="flex-1 px-4 pt-2 pb-24 space-y-5">
        <section className="rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {supplier.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("totalDebt")}:{" "}
              <span className="text-red-500 dark:text-red-400 font-semibold">
                -{supplier.debt} {t("currency")}
              </span>
            </p>
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">
            {t("paymentAmounts").toUpperCase()}
          </p>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-3 flex items-center justify-between">
            <AmountInput
              value={amount}
              onChange={setAmount}
              className="flex-1 min-w-0 text-2xl font-bold text-app-primary border-0 focus:ring-0 bg-transparent"
            />
            <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {t("currency")}
            </span>
          </div>
        </section>

        {calculateSales && (
          <section>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">
              {t("paymentMethod")}
            </p>
            <div className="flex gap-2">
              {(["CASH", "CARD", "BANK"] as const).map((m) => {
                const label = m === "CASH" ? t("cash") : m === "CARD" ? t("card") : t("bankAccount");
                const active = paymentMethod === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      active
                        ? "bg-app-primary/15 dark:bg-app-primary/20 border-app-primary text-app-primary-dark dark:text-app-primary"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <PaymentMethodIcon type={m} className="w-4 h-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">
            {t("commentOptional")}
          </p>
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="To'lov haqida ma'lumot..."
              className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none"
            />
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl">
            {error}
          </p>
        )}
      </main>

      <button
        type="button"
        disabled={loading}
        onClick={handleSave}
        className="fixed left-0 right-0 max-w-md mx-auto px-4 z-20 disabled:opacity-70"
        style={{ bottom: "4.5rem" }}
      >
        <div className="w-full py-4 rounded-2xl text-center font-bold text-white shadow-lg bg-app-primary">
          {loading ? t("saving") : t("savePayment")}
        </div>
      </button>
      <BottomNav activeTab="suppliers" />
    </AppPage>
  );
}
