import { create } from "zustand";

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  debt: string;
  dueDate: string;
  dateInfo: string;
  debtId: string | null;
  backendId?: string;
}

const STORAGE_KEY = "qarz_suppliers";

function load(): Supplier[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Supplier[];
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

function save(suppliers: Supplier[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
  } catch {}
}

interface SupplierState {
  suppliers: Supplier[];
  addSupplier: (supplier: Supplier) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  updateSupplierDebt: (id: string, newDebt: string) => void;
  hydrateFromStorage: () => void;
}

export const useSupplierStore = create<SupplierState>((set) => ({
  suppliers: load(),
  addSupplier: (supplier) =>
    set((prev) => {
      const next = [supplier, ...prev.suppliers];
      save(next);
      return { suppliers: next };
    }),
  setSuppliers: (suppliers) =>
    set(() => {
      save(suppliers);
      return { suppliers };
    }),
  updateSupplierDebt: (id, newDebt) =>
    set((prev) => {
      const next = prev.suppliers.map((s) =>
        s.id === id ? { ...s, debt: newDebt } : s
      );
      save(next);
      return { suppliers: next };
    }),
  hydrateFromStorage: () =>
    set(() => {
      const list = load();
      return { suppliers: list };
    }),
}));
