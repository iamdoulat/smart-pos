import api from './axios';

export interface Variant {
    id: number;
    company_id: number;
    name: string;
    description?: string;
    values?: string[];
    status: 'Active' | 'Inactive';
    created_at?: string;
    updated_at?: string;
}

export const VariantService = {
    async getAll(companyId: number): Promise<Variant[]> {
        const response = await api.get(`/variants?company_id=${companyId}`);
        return response.data;
    },

    async create(data: Partial<Variant>): Promise<Variant> {
        const response = await api.post('/variants', data);
        return response.data;
    },

    async update(id: number, data: Partial<Variant>): Promise<Variant> {
        const response = await api.put(`/variants/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/variants/${id}`);
    },
};
