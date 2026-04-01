export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 9) return "Telefon 9 ta raqamdan iborat bo‘lishi kerak";
  return null;
}

/** Telefon raqamini ko'rsatish uchun formatlash: 970363332 → "97 036 33 32" */
export function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return d.slice(0, 2) + " " + d.slice(2);
  if (d.length <= 7) return d.slice(0, 2) + " " + d.slice(2, 5) + " " + d.slice(5);
  return d.slice(0, 2) + " " + d.slice(2, 5) + " " + d.slice(5, 7) + " " + d.slice(7, 9);
}

export function normalizePhoneForApi(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(0, 9);
  return "+998" + digits;
}

export function validatePassword(value: string): string | null {
  if (!value || value.length < 8) return "Parol kamida 8 ta belgidan iborat bo‘lishi kerak";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value || !String(value).trim()) return `${label} to‘ldirilishi shart`;
  return null;
}
