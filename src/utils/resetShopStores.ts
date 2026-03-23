import { useClientStore } from "../stores/clientStore";
import { useSupplierStore } from "../stores/supplierStore";

/** Boshqa foydalanuvchi / do‘kon uchun eski ro‘yxatlarni ko‘rsatmaslik */
export function resetShopScopedLists(): void {
  useClientStore.getState().setClients([]);
  useSupplierStore.getState().setSuppliers([]);
}
