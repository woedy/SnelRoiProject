import { apiRequest } from "@/lib/api";

export interface Account {
  id: number;
  type: string;
  currency: string;
  status: string;
  account_number: string;
  balance: number;
  customer_name?: string;
  customer_email?: string;
}

export const accountService = {
  getAll: async () => {
    return apiRequest<Account[]>("/admin/accounts/");
  },
  getOne: async (id: number) => {
    return apiRequest<Account>(`/admin/accounts/${id}/`);
  },
  update: async (id: number, data: Partial<Account>) => {
    return apiRequest<Account>(`/admin/accounts/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
