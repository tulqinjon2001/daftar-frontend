import { create } from "zustand";
import { getDefaultMonthRange } from "../utils/dateRange";

const STORAGE_KEY_FROM = "qarz_filter_from";
const STORAGE_KEY_TO = "qarz_filter_to";

function getDefaultRange(): { from: string; to: string } {
  return getDefaultMonthRange();
}

function getStored(): { from: string; to: string } {
  if (typeof window === "undefined") return getDefaultRange();
  const from = localStorage.getItem(STORAGE_KEY_FROM);
  const to = localStorage.getItem(STORAGE_KEY_TO);
  if (from && to) return { from, to };
  return getDefaultRange();
}

interface FilterState {
  fromDate: string;
  toDate: string;
  setDateRange: (from: string, to: string) => void;
  getDefaultRange: () => { from: string; to: string };
}

export const useFilterStore = create<FilterState>((set) => {
  const def = getStored();
  return {
    fromDate: def.from,
    toDate: def.to,
    setDateRange: (from, to) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY_FROM, from);
        localStorage.setItem(STORAGE_KEY_TO, to);
      }
      set({ fromDate: from, toDate: to });
    },
    getDefaultRange,
  };
});
