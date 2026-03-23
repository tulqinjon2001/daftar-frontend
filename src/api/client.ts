const API = import.meta.env.VITE_API_URL || "";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  message: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const json = await res.json().catch(() => ({ success: false, message: "Network error" }));
  return json as ApiResponse<T>;
}

async function requestAuth<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });
  const json = await res.json().catch(() => ({ success: false, message: "Network error" }));
  if (res.status === 401) {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch {}
    // Token muddati tugagan yoki yaroqsiz — login sahifasiga yo'naltirish
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.replace("/");
    }
  }
  return json as ApiResponse<T>;
}

export const api = {
  login: (phone: string, password: string) =>
    request<{
      user: { id: string; name: string | null; phone: string | null; role: string };
      shop: { id: string; name: string; address: string | null; openAt: string; closeAt: string } | null;
      accessToken: string;
      refreshToken: string;
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),

  refreshToken: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string }>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),

  logoutRefresh: (refreshToken?: string) =>
    request("/api/v1/auth/logout-refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshToken || null }),
    }),

  sendOwnerCode: (phone: string) =>
    request<{ code?: string; telegramDeepLink?: string }>("/api/v1/auth/send-owner-code", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyOwnerCode: (phone: string, code: string) =>
    request("/api/v1/auth/verify-owner-code", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    }),

  registerOwner: (body: {
    full_name: string;
    phone: string;
    password: string;
    shop_name: string;
    address: string;
    open_at: string;
    close_at: string;
  }) =>
    request<{ user: unknown; shop: unknown; accessToken: string; refreshToken: string }>(
      "/api/v1/auth/register-owner",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    ),

  sendResetCode: (phone: string) =>
    request<{ code?: string; telegramDeepLink?: string }>("/api/v1/auth/send-reset-code", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyResetCode: (phone: string, code: string) =>
    request("/api/v1/auth/verify-reset-code", {
      method: "POST",
      body: JSON.stringify({ phone, code }),
    }),

  setNewPassword: (body: { phone: string; code: string; newPassword: string }) =>
    request("/api/v1/auth/set-new-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  sendChangePasswordCode: (currentPassword: string) =>
    requestAuth<{ telegramDeepLink?: string; code?: string }>("/api/v1/auth/send-change-password-code", {
      method: "POST",
      body: JSON.stringify({ currentPassword }),
    }),

  changePassword: (body: { currentPassword: string; newPassword: string; code: string }) =>
    requestAuth("/api/v1/auth/change-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  sendPhoneChangeCode: (newPhone: string) =>
    requestAuth<{ telegramDeepLink?: string; code?: string }>("/api/v1/auth/send-phone-change-code", {
      method: "POST",
      body: JSON.stringify({ newPhone }),
    }),

  confirmPhoneChange: (newPhone: string, code: string) =>
    requestAuth<{ phone?: string }>("/api/v1/auth/confirm-phone-change", {
      method: "POST",
      body: JSON.stringify({ newPhone, code }),
    }),

  // ——— Clients (auth) ———
  createClient: (body: { name: string; phone: string; initialDebt?: number; dueDate?: string }) =>
    requestAuth<{ client: { id: string; name: string; phone: string; debt: string; dueDate: string } }>(
      "/api/v1/clients",
      { method: "POST", body: JSON.stringify(body) }
    ),
  getClients: () =>
    requestAuth<{ clients: Array<{ id: string; name: string; phone: string; debt: string; dueDate: string; initials: string }> }>(
      "/api/v1/clients"
    ),

  // ——— Debts (auth) ———
  writeDebt: (body: { debtorId: string; amount: number; dueDate?: string; description?: string }) =>
    requestAuth<{ debt: string; debtId: string }>("/api/v1/debts/write", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  payDebt: (body: { debtorId: string; amount: number; note?: string; paymentMethod?: "CASH" | "CARD" | "BANK" }) =>
    requestAuth<{ debt: string; debtId: string }>("/api/v1/debts/pay", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getDebtHistory: (debtorId: string) =>
    requestAuth<{
      history: Array<{
        date: string;
        createdAt: string;
        action: string;
        summa: number;
        isPayment: boolean;
        qoldiq: number | null;
      }>;
    }>(`/api/v1/debts/history?debtorId=${encodeURIComponent(debtorId)}`),

  getDashboardStats: () =>
    requestAuth<{
      totalDebtBalance: number;
      totalReceived: number;
      totalPaid: number;
      todayTotal?: number;
      mostActiveClient: {
        id: string;
        name: string;
        initials: string;
        transactionCount: number;
        totalPayments: number;
      } | null;
      clientDebtStats?: {
        totalOlingan: number;
        totalTolangan: number;
        currentDebt: number;
      };
      supplierDebtStats?: {
        totalGoodsTaken: number;
        totalPaid: number;
        currentDebt: number;
      };
    }>("/api/v1/dashboard/stats"),

  // ——— Suppliers (yetkazuvchilar) ———
  createSupplier: (body: { name: string; phone?: string }) =>
    requestAuth<{
      supplier: {
        id: string;
        name: string;
        phone: string;
        debt: string;
        dueDate: string;
        dateInfo: string;
        debtId: string;
      };
    }>("/api/v1/suppliers", { method: "POST", body: JSON.stringify(body) }),
  getSuppliers: () =>
    requestAuth<{
      suppliers: Array<{
        id: string;
        name: string;
        phone: string;
        debt: string;
        dueDate: string;
        dateInfo: string;
        debtId: string | null;
      }>;
    }>("/api/v1/suppliers"),
  writeSupplierDebt: (body: {
    supplierId: string;
    amount: number;
    dueDate?: string;
    description?: string;
  }) =>
    requestAuth<{ debt: string; debtId: string }>("/api/v1/suppliers/debt/write", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  paySupplierDebt: (body: { supplierId: string; amount: number; note?: string; paymentMethod?: "CASH" | "CARD" | "BANK" }) =>
    requestAuth<{ debt: string; debtId: string }>("/api/v1/suppliers/debt/pay", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getBalance: () =>
    requestAuth<{ cash: string; card: string; bank: string; total: string }>("/api/v1/balance"),

  addSale: (body: {
    cashAmount?: number;
    cardAmount?: number;
    bankAmount?: number;
    saleDateTime?: string;
    comment?: string;
  }) =>
    requestAuth("/api/v1/balance/sale", { method: "POST", body: JSON.stringify(body) }),
  getSales: (params?: { fromDate?: string; toDate?: string }) => {
    const sp = new URLSearchParams();
    if (params?.fromDate) sp.set("fromDate", params.fromDate);
    if (params?.toDate) sp.set("toDate", params.toDate);
    const q = sp.toString();
    return requestAuth<{
      sales: Array<{
        id: string;
        cashAmount: string;
        cardAmount: string;
        bankAmount: string;
        saleDate: string;
        comment: string | null;
        createdAt: string;
      }>;
    }>(`/api/v1/balance/sales${q ? `?${q}` : ""}`);
  },
  updateSale: (id: string, body: {
    cashAmount?: number;
    cardAmount?: number;
    bankAmount?: number;
    saleDateTime?: string;
    comment?: string;
  }) =>
    requestAuth(`/api/v1/balance/sales/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  getSupplierDebtHistory: (supplierId: string) =>
    requestAuth<{
      history: Array<{
        date: string;
        createdAt: string;
        action: string;
        summa: number;
        isPayment: boolean;
        qoldiq: number | null;
      }>;
    }>(`/api/v1/suppliers/debt/history?supplierId=${encodeURIComponent(supplierId)}`),
  getSupplierDebtHistoryAll: () =>
    requestAuth<{
      history: Array<{
        id: string;
        date: string;
        createdAt: string;
        action: string;
        summa: number;
        isPayment: boolean;
        qoldiq: number | null;
        supplierId: string | null;
        supplierName: string;
      }>;
    }>("/api/v1/suppliers/debt/history/all"),

  // ——— Expenses (xarajatlar) ———
  getExpenses: (params?: { fromDate?: string; toDate?: string }) => {
    const sp = new URLSearchParams();
    if (params?.fromDate) sp.set("fromDate", params.fromDate);
    if (params?.toDate) sp.set("toDate", params.toDate);
    const q = sp.toString();
    return requestAuth<{
      expenses: Array<{
        id: string;
        amount: string;
        category: string | null;
        description: string | null;
        paymentMethod: string | null;
        expenseDate: string;
        createdAt: string;
      }>;
      total: string;
    }>(`/api/v1/expenses${q ? `?${q}` : ""}`);
  },
  createExpense: (body: {
    amount: number;
    category?: string;
    description?: string;
    expenseDate?: string;
    paymentMethod?: "CASH" | "CARD" | "BANK";
  }) =>
    requestAuth<{
      expense: {
        id: string;
        amount: string;
        category: string | null;
        description: string | null;
        expenseDate: string;
        createdAt: string;
      };
    }>("/api/v1/expenses", { method: "POST", body: JSON.stringify(body) }),
  updateExpense: (id: string, body: {
    amount?: number;
    category?: string;
    description?: string;
    expenseDate?: string;
    paymentMethod?: "CASH" | "CARD" | "BANK";
  }) =>
    requestAuth<{
      expense: {
        id: string;
        amount: string;
        category: string | null;
        description: string | null;
        expenseDate: string;
        createdAt: string;
      };
    }>(`/api/v1/expenses/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteExpense: (id: string) =>
    requestAuth<{ id: string }>(`/api/v1/expenses/${id}`, { method: "DELETE" }),

  // ——— Debts (hisobot: barcha qarz tarixi) ———
  getDebtHistoryAll: () =>
    requestAuth<{
      history: Array<{
        id: string;
        date: string;
        createdAt: string;
        action: string;
        summa: number;
        isPayment: boolean;
        qoldiq: number | null;
        debtorId: string | null;
        debtorName: string;
      }>;
    }>("/api/v1/debts/history/all"),

  // ——— Reports (barcha o'zgarishlar) ———
  getActivityFeed: (params?: { limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    const q = sp.toString();
    return requestAuth<{
      items: Array<{
        type: "sale" | "expense" | "debt" | "supplier_debt";
        id: string;
        date: string;
        createdAt: string;
        summa: number;
        label: string;
        comment?: string | null;
        category?: string | null;
        description?: string | null;
        debtorName?: string;
        supplierName?: string;
        isPayment?: boolean;
      }>;
    }>(`/api/v1/reports/activity${q ? `?${q}` : ""}`);
  },
};
