import api from './axios';

export const AccountService = {
    async getAll(companyId: number) {
        const response = await api.get(`/accounts?company_id=${companyId}`);
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/accounts', data);
        return response.data;
    },
    async update(id: number, data: any) {
        const response = await api.put(`/accounts/${id}`, data);
        return response.data;
    },
    async delete(id: number) {
        const response = await api.delete(`/accounts/${id}`);
        return response.data;
    },
    async initializeCOA(companyId: number) {
        const response = await api.post('/accounts/initialize-coa', { company_id: companyId });
        return response.data;
    },
};


export const ImportShipmentService = {
    async getAll(companyId: number) {
        const response = await api.get(`/import-shipments?company_id=${companyId}`);
        return response.data;
    },
    async getById(id: number) {
        const response = await api.get(`/import-shipments/${id}`);
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/import-shipments', data);
        return response.data;
    }
};
