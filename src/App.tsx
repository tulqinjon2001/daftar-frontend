import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useThemeStore } from "./stores/themeStore";
import PrivateRoute from "./components/PrivateRoute";

// Public sahifalar
import Login from "./pages/Login";
import OwnerRegister from "./pages/OwnerRegister";
import ForgotPassword from "./pages/ForgotPassword";

// Himoyalangan sahifalar
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Security from "./pages/Security";
import Clients from "./pages/Clients";
import AddClient from "./pages/AddClient";
import DebtWrite from "./pages/DebtWrite";
import PayDebt from "./pages/PayDebt";
import ClientCard from "./pages/ClientCard";
import Suppliers from "./pages/Suppliers";
import AddSupplier from "./pages/AddSupplier";
import SupplierCard from "./pages/SupplierCard";
import SupplierDebtWrite from "./pages/SupplierDebtWrite";
import PaySupplierDebt from "./pages/PaySupplierDebt";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import Reports from "./pages/Reports";
import SalesReport from "./pages/SalesReport";
import ExpenseReport from "./pages/ExpenseReport";
import AddSale from "./pages/AddSale";
import Notifications from "./pages/Notifications";

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="max-w-md mx-auto min-h-screen">
      <Routes>
        {/* ——— Public routelar ——— */}
        <Route path="/" element={<Login />} />
        <Route path="/register-owner" element={<OwnerRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ——— Himoyalangan routelar — token bo'lmasa / ga yo'naltiriladi ——— */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/security" element={<Security />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/new" element={<AddClient />} />
          <Route path="/clients/card" element={<ClientCard />} />
          <Route path="/debt/write" element={<DebtWrite />} />
          <Route path="/debt/pay" element={<PayDebt />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/new" element={<AddSupplier />} />
          <Route path="/suppliers/card" element={<SupplierCard />} />
          <Route path="/supplier-debt/write" element={<SupplierDebtWrite />} />
          <Route path="/supplier-debt/pay" element={<PaySupplierDebt />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/new" element={<AddExpense />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/sales" element={<SalesReport />} />
          <Route path="/reports/expenses" element={<ExpenseReport />} />
          <Route path="/sales/new" element={<AddSale />} />
        </Route>

        {/* ——— 404 — login sahifasiga yo'naltirish ——— */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
