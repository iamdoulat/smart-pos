import api from './axios';

export interface Category {
    id: number;
    company_id: number;
    name: string;
    type: 'income' | 'expense' | 'asset' | 'liability';
    description?: string;
    status: 'Active' | 'Inactive';
    parent_id?: number | null;
    created_at?: string;
    updated_at?: string;
}

export const CategoryService = {
    async getAll(companyId: number): Promise<Category[]> {
        const response = await api.get(`/categories?company_id=${companyId}`);
        return response.data;
    },

    async create(data: Partial<Category>): Promise<Category> {
        const response = await api.post('/categories', data);
        return response.data;
    },

    async update(id: number, data: Partial<Category>): Promise<Category> {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/categories/${id}`);
    },
};
