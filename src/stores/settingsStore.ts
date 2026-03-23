import { create } from "zustand";

/** Savdoni hisoblash doim yoqilgan; foydalanuvchi o‘chira olmaydi. */
const STORAGE_KEY = "qarz_calculate_sales";

interface SettingsState {
  calculateSales: boolean;
  setCalculateSales: (value: boolean) => void;
  toggleCalculateSales: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  calculateSales: true,
  setCalculateSales: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ calculateSales: true });
  },
  toggleCalculateSales: () => {
    set({ calculateSales: true });
  },
}));
