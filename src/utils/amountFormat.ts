/**
 * Summa inputlari uchun: raqamni ming/million ajratgich (probel) bilan matnga.
 * Masalan: 1_000_000 -> "1 000 000", 50_000 -> "50 000"
 */
export function formatAmountDisplay(value: number | string): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Input matnidan raqam olish (probel va boshqa belgilarni olib tashlash).
 */
export function parseAmountInput(s: string): number {
  const n = parseFloat(String(s).replace(/\s/g, "").replace(",", ".")) || 0;
  return n >= 0 ? n : 0;
}

/** API / ro'yxatdagi summa matnidan raqam (parseAmountInput bilan bir xil). */
export const parseAmountString = parseAmountInput;

/**
 * Jami summa ko'rsatish (probel bilan mingliklar).
 * Barcha sahifalarda bir xil format.
 */
export function formatSum(n: number): string {
  return Math.round(Number(n) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
