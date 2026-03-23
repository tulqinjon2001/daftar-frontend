import { create } from "zustand";

export type ClientStatus = "overdue" | "new" | "inPayment" | null;

export interface Client {
  id: string;
  name: string;
  phone: string;
  debt: string; // formatted, e.g. "4500000" or "4,500,000"
  dueDate: string;
  status: ClientStatus;
  initials: string;
  /** Backend (User) id — API chaqiriqlarida debtorId sifatida ishlatiladi */
  backendId?: string;
}

const STORAGE_KEY = "qarz_clients";

function load(): Client[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as Client[];
    if (!Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

function save(clients: Client[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch {}
}

interface ClientState {
  clients: Client[];
  addClient: (client: Client) => void;
  setClients: (clients: Client[]) => void;
  updateClientDebt: (id: string, newDebt: string) => void;
  hydrateFromStorage: () => void;
}

export const useClientStore = create<ClientState>((set) => ({
  clients: load(),
  addClient: (client) =>
    set((prev) => {
      const next = [client, ...prev.clients];
      save(next);
      return { clients: next };
    }),
  setClients: (clients) =>
    set(() => {
      save(clients);
      return { clients };
    }),
  updateClientDebt: (id, newDebt) =>
    set((prev) => {
      const next = prev.clients.map((c) =>
        c.id === id ? { ...c, debt: newDebt } : c
      );
      save(next);
      return { clients: next };
    }),
  hydrateFromStorage: () =>
    set(() => {
      const list = load();
      return { clients: list };
    }),
}));

