import api from './axios';

export interface Brand {
    id: number;
    company_id: number;
    name: string;
    description?: string;
    status: 'Active' | 'Inactive';
    created_at?: string;
    updated_at?: string;
}

export const BrandService = {
    async getAll(companyId: number): Promise<Brand[]> {
        const response = await api.get(`/brands?company_id=${companyId}`);
        return response.data;
    },

    async create(data: Partial<Brand>): Promise<Brand> {
        const response = await api.post('/brands', data);
        return response.data;
    },

    async update(id: number, data: Partial<Brand>): Promise<Brand> {
        const response = await api.put(`/brands/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/brands/${id}`);
    },
};
