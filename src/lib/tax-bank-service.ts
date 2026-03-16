import api from './axios';

export const TaxService = {
    async getAll(companyId: number) {
        const response = await api.get(`/taxes?company_id=${companyId}`);
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/taxes', data);
        return response.data;
    },
    async update(id: number, data: any) {
        const response = await api.put(`/taxes/${id}`, data);
        return response.data;
    },
    async delete(id: number) {
        const response = await api.delete(`/taxes/${id}`);
        return response.data;
    },
    async getPresets() {
        const response = await api.get('/taxes/presets');
        return response.data;
    }
};

export const BankService = {
    async getAll(companyId: number) {
        const response = await api.get(`/bank-accounts?company_id=${companyId}`);
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/bank-accounts', data);
        return response.data;
    }
};
