import api from './axios';

export interface Warehouse {
    id: number;
    company_id: number;
    name: string;
    mobile?: string;
    email?: string;
    status: 'Active' | 'Inactive';
    total_items?: number;
    total_quantity?: number;
    total_worth?: number;
    created_at?: string;
    updated_at?: string;
}

export const WarehouseService = {
    async getAll(companyId: number): Promise<Warehouse[]> {
        const response = await api.get(`/warehouses?company_id=${companyId}`);
        return response.data;
    },

    async create(data: Partial<Warehouse>): Promise<Warehouse> {
        const response = await api.post('/warehouses', data);
        return response.data;
    },

    async update(id: number, data: Partial<Warehouse>): Promise<Warehouse> {
        const response = await api.put(`/warehouses/${id}`, data);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/warehouses/${id}`);
    }
};
