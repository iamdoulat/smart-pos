import api from './axios';

export interface Contact {
    id: number;
    company_id: number;
    type: 'customer' | 'vendor';
    name: string;
    email?: string;
    phone?: string;
    mobile?: string;
    gst_number?: string;
    credit_limit?: number;
    previous_due?: number;
    attachment?: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    postcode?: string;
    location_link?: string;
    shipping_country?: string;
    shipping_state?: string;
    shipping_city?: string;
    shipping_postcode?: string;
    shipping_address?: string;
    shipping_location_link?: string;
    price_level_type?: string;
    price_level?: number;
    tax_id?: string;
    opening_balance: number;
    created_at?: string;
    updated_at?: string;
}

export const ContactService = {
    async getAll(company_id: number, type?: 'customer' | 'vendor'): Promise<Contact[]> {
        const params: any = { company_id };
        if (type) params.type = type;
        const response = await api.get('/contacts', { params });
        return response.data;
    },

    async getById(id: number): Promise<Contact> {
        const response = await api.get(`/contacts/${id}`);
        return response.data;
    },

    async create(data: FormData | Partial<Contact>): Promise<Contact> {
        let headers = {};
        if (data instanceof FormData) {
            headers = { 'Content-Type': 'multipart/form-data' };
        }
        const response = await api.post('/contacts', data, { headers });
        return response.data;
    },

    async update(id: number, data: FormData | Partial<Contact>): Promise<Contact> {
        let headers = {};
        if (data instanceof FormData) {
            headers = { 'Content-Type': 'multipart/form-data' };
            data.append('_method', 'PUT'); // Laravel workaround for PUT with FormData
            const response = await api.post(`/contacts/${id}`, data, { headers });
            return response.data;
        } else {
            const response = await api.put(`/contacts/${id}`, data);
            return response.data;
        }
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/contacts/${id}`);
    },

    async import(company_id: number, type: 'customer' | 'vendor', file: File): Promise<any> {
        const formData = new FormData();
        formData.append('company_id', company_id.toString());
        formData.append('type', type);
        formData.append('file', file);
        const response = await api.post('/contacts/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
