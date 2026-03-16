import api from './axios';

export type TransactionType = 'income' | 'expense' | 'transfer' | 'sales' | 'purchase' | 'tax' | 'shipping';
export type PaymentMethod = 'cash' | 'bank' | 'online';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
    id: number;
    company_id: number;
    user_id: number;
    category_id: number | null;
    contact_id: number | null;
    type: TransactionType;
    amount: number | string;
    date: string;
    payment_method: PaymentMethod;
    status: TransactionStatus;
    description?: string;
    attachment_path?: string;
    reference_number?: string;
    tax_id?: number | null;
    account_id?: number | null;
    category?: { id: number; name: string; type: string };
    contact?: { id: number; name: string };
    created_at?: string;
    updated_at?: string;
}

export const TransactionService = {
    async getAll(companyId: number): Promise<Transaction[]> {
        const response = await api.get(`/transactions?company_id=${companyId}`);
        return response.data;
    },

    async getById(id: number): Promise<Transaction> {
        const response = await api.get(`/transactions/${id}`);
        return response.data;
    },

    async create(data: Partial<Transaction>): Promise<Transaction> {
        const response = await api.post('/transactions', data);
        return response.data;
    },

    async update(id: number, data: Partial<Transaction>): Promise<Transaction> {
        const response = await api.put(`/transactions/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/transactions/${id}`);
    },
};
