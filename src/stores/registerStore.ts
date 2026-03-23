import { create } from "zustand";

export interface RegisterOwnerState {
  // Step 1
  fullName: string;
  phone: string;
  password: string;
  // Step 2
  shopName: string;
  address: string;
  openAt: string;
  closeAt: string;
  // Step 3 — OTP sent flag / code
  otpSent: boolean;
  // Actions
  setStep1: (data: { fullName: string; phone: string; password: string }) => void;
  setStep2: (data: { shopName: string; address: string; openAt: string; closeAt: string }) => void;
  setOtpSent: (v: boolean) => void;
  reset: () => void;
}

const initial = {
  fullName: "",
  phone: "",
  password: "",
  shopName: "",
  address: "",
  openAt: "",
  closeAt: "",
  otpSent: false,
};

export const useRegisterStore = create<RegisterOwnerState>((set) => ({
  ...initial,
  setStep1: (data) => set({ fullName: data.fullName, phone: data.phone, password: data.password }),
  setStep2: (data) =>
    set({
      shopName: data.shopName,
      address: data.address,
      openAt: data.openAt,
      closeAt: data.closeAt,
    }),
  setOtpSent: (v) => set({ otpSent: v }),
  reset: () => set(initial),
}));
