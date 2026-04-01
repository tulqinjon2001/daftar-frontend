import { create } from "zustand";

const STORAGE_KEY = "qarz_profile";

export interface ProfileData {
  name: string;
  phone: string;
  role: string;
  shopName: string;
  shopAddress: string;
  userId: string;
  shopId: string;
}

function load(): ProfileData {
  if (typeof window === "undefined")
    return { name: "", phone: "", role: "", shopName: "", shopAddress: "", userId: "", shopId: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { name: "", phone: "", role: "", shopName: "", shopAddress: "", userId: "", shopId: "" };
    const data = JSON.parse(raw) as Partial<ProfileData>;
    return {
      name: data.name ?? "",
      phone: data.phone ?? "",
      role: data.role ?? "",
      shopName: data.shopName ?? "",
      shopAddress: data.shopAddress ?? "",
      userId: data.userId ?? "",
      shopId: data.shopId ?? "",
    };
  } catch {
    return { name: "", phone: "", role: "", shopName: "", shopAddress: "", userId: "", shopId: "" };
  }
}

function save(data: ProfileData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

interface ProfileState extends ProfileData {
  setProfile: (data: Partial<ProfileData>) => void;
  clear: () => void;
  /** localStorage dan qayta o‘qib store ni to‘ldiradi (boshqa tab da ro‘yxatdan o‘tgan bo‘lsa). */
  hydrateFromStorage: () => void;
}

const empty: ProfileData = { name: "", phone: "", role: "", shopName: "", shopAddress: "", userId: "", shopId: "" };

export const useProfileStore = create<ProfileState>((set) => ({
  ...load(),
  setProfile: (data) => {
    set((prev) => {
      const next: ProfileData = {
        name: data.name ?? prev.name,
        phone: data.phone ?? prev.phone,
        role: data.role ?? prev.role,
        shopName: data.shopName ?? prev.shopName,
        shopAddress: data.shopAddress ?? prev.shopAddress,
        userId: data.userId ?? prev.userId,
        shopId: data.shopId ?? prev.shopId,
      };
      save(next);
      return { ...prev, ...next };
    });
  },
  clear: () => {
    set(empty);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  },
  hydrateFromStorage: () => {
    const data = load();
    if (data.name || data.phone || data.shopName || data.shopAddress) {
      set((prev) => ({ ...prev, ...data }));
    }
  },
}));
